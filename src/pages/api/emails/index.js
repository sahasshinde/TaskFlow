// pages/api/emails/index.js
import {
  fetchEmailsByQuery,
  buildSearchQuery,
} from "@/lib/agents/email/handler";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET")
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });

    const { userId } = getAuth(req);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { q, maxResults = 25, filter = "all" } = req.query;

    // Build gmail query using helper; enhance for 'filter' if needed
    const searchQuery = buildSearchQuery({
      unread: q?.includes("is:unread"),
      keyword: q,
    });

    // For dashboard, we may want only certain categories; you can add logic for filter param
    const { emails } = await fetchEmailsByQuery(
      searchQuery || "",
      Number(maxResults),
      userId
    );

    // Minimal highlight extraction so UI can decide (move to shared helper later)
    const addHighlights = (e) => {
      const text = `${e.subject || ""} ${e.snippet || ""}`.toLowerCase();
      const highlights = [];
      if (/due|deadline|submit|assign|assignment/.test(text))
        highlights.push({ type: "action", text: "Action required" });
      if (/meeting|invite|join|meet/.test(text))
        highlights.push({ type: "event", text: "Meeting / Event" });
      if (/attachment|file|report/.test(text))
        highlights.push({ type: "attachment", text: "Has attachments" });
      return { ...e, highlights };
    };

    const mapped = (emails || []).map(addHighlights);

    res.status(200).json({ success: true, emails: mapped });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}