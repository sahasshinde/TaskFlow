// pages/api/calendar/range.js
import { getCalendarClient } from "@/lib/utils/googleCalendar";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { userId, start, end } = req.query;

    if (!userId || !start || !end) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required params" });
    }

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events by range:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}