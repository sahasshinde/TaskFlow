import { getAuth } from "@clerk/nextjs/server";
import { parseTaskInstruction } from "@/lib/agents/tasks/aiTasksAgent";
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
} from "@/lib/agents/tasks/handler";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { parsed, error } = await parseTaskInstruction(prompt);
    if (error) {
      return res
        .status(400)
        .json({ error: "AI parsing failed", details: error });
    }

    console.log("Parsed AI Instruction:", parsed);

    let result;
    switch (parsed.action) {
      case "create":
        result = await createTask(
          userId,
          parsed.tasklistId ?? "@default",
          parsed.task
        );
        break;
      case "update":
        result = await updateTask(
          userId,
          parsed.tasklistId,
          parsed.taskId,
          parsed.task
        );
        break;
      case "delete":
        result = await deleteTask(userId, parsed.tasklistId, parsed.taskId);
        break;
      case "list":
        result = await listTasks(userId, parsed.tasklistId ?? "@default");
        break;
      default:
        return res
          .status(400)
          .json({ error: `Unknown action: ${parsed.action}` });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in agent tasks API:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}