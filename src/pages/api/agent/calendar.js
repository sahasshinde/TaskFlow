"use-client";
import { getAuth } from "@clerk/nextjs/server";
import { getCalendarClient } from "@/lib/utils/googleCalendar";
import { extractCalendarAction } from "@/lib/agents/calendar/extractAction";
import {
  addEvent,
  deleteEventByTitle,
  updateEventByTitle,
  fetchEvents,
} from "@/lib/agents/calendar";

// Category to Google Calendar colorId mapping
const categoryColorMap = {
  Work: "5",
  Meeting: "7",
  Study: "10",
  Personal: "9",
  Call: "11",
  Reminder: "2",
  Errand: "4",
  Project: "6",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { prompt } = req.body;
    const aiReply = await extractCalendarAction(prompt);
    console.log("AI Reply:", aiReply);

    const data = aiReply;
    const calendar = await getCalendarClient(userId);

    // Resolve colorId from category (if any)
    const colorId =
      data.colorId ||
      (data.category && categoryColorMap[data.category]) ||
      null;

    if (data.action === "add_event") {
      const link = await addEvent(
        calendar,
        data.title ?? "Untitled Event",
        data.date,
        data.time ?? "09:00",
        data.duration_minutes ?? 60,
        data.description ?? null,
        data.location ?? null,
        data.attendees ?? [],
        null, // reminders
        colorId
      );
      return res
        .status(200)
        .json({ success: true, message: "Event added!", link });
    }

    if (data.action === "update_event") {
      try {
        const updatedEvent = await updateEventByTitle(calendar, {
          eventId: data.event_id ?? null,
          oldTitle: data.old_title ?? data.title,
          newTitle: data.new_title ?? data.title,
          newDate: data.new_date ?? data.date ?? null,
          newTime: data.new_time ?? data.time ?? null,
          duration_minutes:
            data.new_duration_minutes ?? data.duration_minutes ?? 60,
          description: data.description ?? null,
          location: data.location ?? null,
          attendees: data.attendees ?? [],
          reminders: null,
          colorId: colorId ?? null,
        });

        if (!updatedEvent) {
          return res.status(404).json({
            success: false,
            message: `Event "${data.old_title}" not found.`,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Event updated successfully!",
          event: updatedEvent,
          link: updatedEvent.htmlLink || null,
        });
      } catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update event.",
          error: err.message,
        });
      }
    }

    if (data.action === "delete_event") {
      const response = await deleteEventByTitle(calendar, data.title);

      if (!response) {
        return res.status(404).json({
          success: false,
          message: `No event found with title: "${data.title}"`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully.",
        deletedTitle: data.title,
      });
    }

    if (data.action === "fetch_events") {
      const now = new Date();

      let timeMin = now;
      let timeMax = null;

      let year = data.year || now.getFullYear();
      let month = null;

      if (data.month) {
        if (typeof data.month === "string") {
          const monthIndex = new Date(`${data.month} 1, ${year}`).getMonth();
          if (!isNaN(monthIndex)) {
            month = monthIndex;
          }
        } else if (typeof data.month === "number") {
          month = data.month;
        }
      }

      if (data.deadline) {
        timeMax = new Date(data.deadline);
      } else if (data.date) {
        timeMin = new Date(data.date);
        const nextDay = new Date(timeMin);
        nextDay.setDate(nextDay.getDate() + 1);
        timeMax = nextDay;
      } else if (month !== null) {
        timeMin = new Date(year, month, 1);
        timeMax = new Date(year, month + 1, 1);
      }

      const events = await fetchEvents(calendar, {
        query: data.query || null,
        title: data.title || null,
        date: data.date || null,
        month,
        year,
        category: data.category || null,
        deadline: data.deadline || null,
        timeMin,
        timeMax,
        orderBy: "startTime",
        showDeleted: false,
        singleEvents: true,
      });

      return res.status(200).json({ success: true, events });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unknown command." });
  } catch (err) {
    console.error("❌ Handler Error:", err);
    return res.status(500).json({
      error: "Error processing request: " + (err.message || err.toString()),
    });
  }
}