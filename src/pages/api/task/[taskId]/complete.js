import { getTasksClient } from "@/lib/utils/googletasks";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { taskId } = req.query;
    const tasksClient = await getTasksClient(userId);

    await tasksClient.tasks.patch({
      tasklist: "@default",
      task: taskId,
      requestBody: { status: "completed" },
    });

    res.status(200).json({ message: "Task marked as completed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}