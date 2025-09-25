import { getAuth } from "@clerk/nextjs/server";
import { getGmailClient } from "@/lib/utils/googleEmails";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { emailId, action } = req.body;
    // action = "read" | "unread" | "archive" | "delete"
    if (!emailId || !action) {
      return res
        .status(400)
        .json({ success: false, message: "Email ID and action required" });
    }

    const gmail = await getGmailClient(userId);

    if (action === "read" || action === "unread") {
      await gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: {
          removeLabelIds: action === "read" ? ["UNREAD"] : [],
          addLabelIds: action === "unread" ? ["UNREAD"] : [],
        },
      });
    } else if (action === "archive") {
      await gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: {
          removeLabelIds: ["INBOX"], // archive = remove from inbox
        },
      });
    } else if (action === "delete") {
      await gmail.users.messages.delete({
        userId: "me",
        id: emailId,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    return res
      .status(200)
      .json({ success: true, message: `Email ${action}d successfully` });
  } catch (error) {
    console.error("Error handling email action:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}