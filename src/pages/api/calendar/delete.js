"use-client";
import { getAuth } from "@clerk/nextjs/server";
import { getCalendarClient } from "@/lib/utils/googleCalendar";
import { deleteEventByTitle } from "@/lib/agents/calendar";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const eventId = req.body;

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing title for deletion" });
    }

    const calendar = await getCalendarClient(userId);
    const deleted = await deleteEventByTitle(calendar, eventId);

    return res.status(200).json({
      success: deleted,
      message: deleted ? "Event deleted successfully" : "Event not found",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}