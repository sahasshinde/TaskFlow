function formatDateTime(dateStr, timeStr = "09:00") {
  if (!dateStr) throw new Error("Date is required to format DateTime.");
  return new Date(`${dateStr}T${timeStr}:00+05:30`).toISOString();
}

export async function addEvent(
  calendar,
  title = "Untitled Event",
  date,
  time = "09:00",
  duration_minutes = 60,
  description = null,
  location = null,
  attendees = [],
  reminders = null,
  colorId = null
) {
  const startDateTime = formatDateTime(date, time);
  const endDateTime = new Date(
    new Date(startDateTime).getTime() + duration_minutes * 60000
  ).toISOString();

  const event = {
    summary: title,
    description,
    location,
    start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
    attendees: attendees.length > 0 ? attendees : undefined,
    reminders: reminders || { useDefault: true },
    colorId: colorId || undefined,
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return response.data.htmlLink;
}

export async function deleteEventByTitle(calendar, { eventId, title }) {
  try {
    if (eventId) {
      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });
      return { success: true, method: "eventId" };
    }

    if (title) {
      const res = await calendar.events.list({
        calendarId: "primary",
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      const event = res.data.items.find((e) =>
        e.summary?.toLowerCase().includes(title.toLowerCase())
      );

      if (event) {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: event.id,
        });
        return { success: true, method: "title" };
      }

      return { success: false, message: "Event not found by title" };
    }

    return { success: false, message: "Missing eventId or title" };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, message: "Error deleting event", error };
  }
}

export async function updateEventByTitle(
  calendar,
  {
    eventId = null,
    oldTitle = null,
    newTitle = null,
    newDate = null,
    newTime = null,
    duration_minutes = 60,
    description = null,
    location = null,
    attendees = [],
    reminders = null,
    colorId = null,
  }
) {
  let event = null;

  if (eventId) {
    const res = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });
    event = res.data;
  } else if (oldTitle) {
    const res = await calendar.events.list({
      calendarId: "primary",
      maxResults: 500,
      singleEvents: true,
      orderBy: "startTime",
    });

    event = res.data.items.find((e) =>
      e.summary?.toLowerCase().includes(oldTitle.toLowerCase())
    );

    if (!event) return false;
    eventId = event.id;
  } else {
    throw new Error("Either eventId or oldTitle must be provided.");
  }

  const startDateTime = newDate
    ? formatDateTime(newDate, newTime || "09:00")
    : event.start.dateTime;

  const endDateTime = newDate
    ? new Date(
        new Date(startDateTime).getTime() + duration_minutes * 60000
      ).toISOString()
    : event.end.dateTime;

  const updatedEvent = {
    summary: newTitle || event.summary,
    description: description ?? event.description,
    location: location ?? event.location,
    start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
    attendees: attendees.length > 0 ? attendees : event.attendees,
    reminders: reminders || event.reminders || { useDefault: true },
    colorId: colorId || event.colorId,
  };

  const updatedResponse = await calendar.events.update({
    calendarId: "primary",
    eventId,
    resource: updatedEvent,
  });

  return updatedResponse.data;
}

export async function fetchEvents(calendar, options = {}) {
  const {
    max = 500,
    query, // free-text search
    title, // exact or partial match in summary
    date,
    month,
    year,
    category,
    deadline,
    timeMin,
    timeMax,
    updatedMin,
    showDeleted = false,
    singleEvents = true,
    orderBy = "startTime",
  } = options;

  const now = new Date();
  const parsedMonth = isNaN(month)
    ? new Date(`${month} 1, ${year || now.getFullYear()}`).getMonth()
    : Number(month);
  const parsedYear = year || now.getFullYear();

  let computedTimeMin = timeMin ? new Date(timeMin) : now;
  let computedTimeMax = timeMax ? new Date(timeMax) : null;

  if ((month !== undefined || year !== undefined) && !timeMax) {
    computedTimeMin = new Date(parsedYear, parsedMonth, 1);
    computedTimeMax = new Date(parsedYear, parsedMonth + 1, 1); // Next month
  }

  const params = {
    calendarId: "primary",
    maxResults: max,
    timeMin: computedTimeMin.toISOString(),
    singleEvents,
    orderBy,
    showDeleted,
  };

  if (computedTimeMax) params.timeMax = computedTimeMax.toISOString();
  if (query) params.q = query;
  if (updatedMin) params.updatedMin = new Date(updatedMin).toISOString();

  try {
    const res = await calendar.events.list(params);
    let events = res.data.items || [];

    events = events.filter((event) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      const eventDate = new Date(start);
      const endDate = new Date(end);

      return (
        (!title ||
          (event.summary &&
            event.summary.toLowerCase().includes(title.toLowerCase()))) &&
        (!date || eventDate.toISOString().slice(0, 10) === date) &&
        (!month || eventDate.getMonth() === parsedMonth) &&
        (!year || eventDate.getFullYear() === parsedYear) &&
        (!category ||
          event.colorId === category ||
          (event.description &&
            event.description
              .toLowerCase()
              .includes(category.toLowerCase()))) &&
        (!deadline || endDate <= new Date(deadline))
      );
    });

    return events;
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}