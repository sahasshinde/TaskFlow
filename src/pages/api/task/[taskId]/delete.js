// src/pages/api/tasks/[taskId]/delete.js
import { getTasksClient } from "@/lib/utils/googletasks";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { taskId } = req.query;
    const tasksClient = await getTasksClient(userId);

    await tasksClient.tasks.delete({
      tasklist: "@default",
      task: taskId,
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}