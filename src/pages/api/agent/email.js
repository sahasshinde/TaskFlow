import { getAuth } from "@clerk/nextjs/server";
import { handlePrompt } from "@/lib/agents/email/emailAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing prompt",
      });
    }

    const result = await handlePrompt(prompt, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}