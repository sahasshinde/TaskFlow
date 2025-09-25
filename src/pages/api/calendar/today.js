import { getCalendarClient } from "@/lib/utils/googleCalendar";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, calendarId = "primary", date } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const calendar = await getCalendarClient(userId);

    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(
      targetDate.setHours(23, 59, 59, 999)
    ).toISOString();

    const { data } = await calendar.events.list({
      calendarId,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.status(200).json({ success: true, events: data.items || [] });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: error.message });
  }
}