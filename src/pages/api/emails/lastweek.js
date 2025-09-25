import { getAuth } from "@clerk/nextjs/server";
import { getGmailClient } from "@/lib/utils/googleEmails";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const gmail = await getGmailClient(userId);

    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    // Gmail query for last week, only Primary tab
    const query = `category:primary after:${Math.floor(
      lastWeek.getTime() / 1000
    )} before:${Math.floor(now.getTime() / 1000)}`;

    // Fetch messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return res.status(200).json({ success: true, emails: [] });
    }

    // Fetch details of each email with more info
    const emailDetails = await Promise.all(
      response.data.messages.map(async (msg) => {
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full", // can be "metadata", "minimal", or "full"
        });

        const payload = fullMessage.data.payload || {};
        const headers = payload.headers || [];

        return {
          id: msg.id,
          threadId: fullMessage.data.threadId,
          snippet: fullMessage.data.snippet, // preview text
          labelIds: fullMessage.data.labelIds || [], // labels like INBOX, UNREAD, STARRED
          from: headers.find((h) => h.name === "From")?.value || "",
          to: headers.find((h) => h.name === "To")?.value || "",
          subject:
            headers.find((h) => h.name === "Subject")?.value || "(No Subject)",
          date: headers.find((h) => h.name === "Date")?.value || "",
          starred: (fullMessage.data.labelIds || []).includes("STARRED"),
          unread: (fullMessage.data.labelIds || []).includes("UNREAD"),
        };
      })
    );

    return res.status(200).json({ success: true, emails: emailDetails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}