import { getTasksClient } from "@/lib/utils/googletasks";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const tasksClient = await getTasksClient(userId);

    // --- Get all task lists ---
    const listsResponse = await tasksClient.tasklists.list();
    const taskLists = listsResponse.data.items || [];

    let allTasks = [];

    // --- Loop through each list ---
    for (const list of taskLists) {
      const response = await tasksClient.tasks.list({
        tasklist: list.id,
        showCompleted: false, // only incomplete tasks
      });

      const tasks = response.data.items || [];
      allTasks = allTasks.concat(
        tasks.map((t) => ({ ...t, tasklistName: list.title }))
      );
    }

    // --- Categorization ---
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    let pending = [];
    let ongoing = [];
    let upcoming = [];
    let noDueDate = [];

    allTasks.forEach((task) => {
      if (!task.due) {
        noDueDate.push(task); // tasks without time limit
        return;
      }

      const dueDate = new Date(task.due);

      if (dueDate < today) {
        pending.push(task); // overdue
      } else if (dueDate >= today && dueDate < tomorrow) {
        ongoing.push(task); // today’s tasks
      } else if (
        dueDate >= tomorrow &&
        dueDate < new Date(tomorrow.getTime() + 7*24 * 60 * 60 * 1000)
      ) {
        upcoming.push(task); // tomorrow’s tasks
      }
    });

    res.status(200).json({
      pending,
      ongoing,
      upcoming,
      noDueDate,
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
}