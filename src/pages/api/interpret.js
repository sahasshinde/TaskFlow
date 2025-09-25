import { getAuth } from "@clerk/nextjs/server";
import { interpretJson } from "@/lib/agents/interpreter/agent";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;

    const naturalText = await interpretJson(body);

    return res.status(200).json({ success: true, response: naturalText });
  } catch (error) {
    console.error("Interpretation error:", error);
    return res.status(500).json({ error: "Failed to interpret JSON" });
  }
}