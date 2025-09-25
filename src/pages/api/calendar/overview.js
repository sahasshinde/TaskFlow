import { getCalendarClient } from "@/lib/utils/googleCalendar";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { userId } = getAuth(req); // ✅ get userId directly from Clerk

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no user found" });
    }

    // Get Google Calendar client using your helper
    const calendar = await getCalendarClient(userId);

    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: weekLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return res
      .status(200)
      .json({ success: true, events: response.data.items || [] });
  } catch (error) {
    console.error("Error fetching calendar overview:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch calendar events" });
  }
}
