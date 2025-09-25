"use server";

import { getTasksClient } from "@/lib/utils/googletasks";

export async function listTaskLists(userId) {
  const tasks = await getTasksClient(userId);
  const res = await tasks.tasklists.list();
  return res.data.items || [];
}

/**
 * List tasks from a given task list
 * @param {string} tasklistId - Use "@default" for the default list
 * @param {object} options - Optional filter options
 */
export async function listTasks(userId, tasklistId = "@default", options = {}) {
  const tasks = await getTasksClient(userId);
  const res = await tasks.tasks.list({
    tasklist: tasklistId,
    showCompleted: options.showCompleted ?? true,
    dueMin: options.dueMin,
    dueMax: options.dueMax,
    maxResults: options.maxResults ?? 100,
  });
  return res.data.items || [];
}

export async function createTask(userId, tasklistId = "@default", task) {
  if (!userId) throw new Error("Missing userId");
  if (!task || !task.title) throw new Error("Task title is required");

  const tasksClient = await getTasksClient(userId);

  try {
    const taskBody = {
      title: task.title,
      notes: task.notes || "",
      status: task.status || "needsAction",
    };

    if (task.due) {
      const dueDate = new Date(task.due);
      if (!isNaN(dueDate.getTime())) {
        taskBody.due = dueDate.toISOString();
      }
    }

    const res = await tasksClient.tasks.insert({
      tasklist: tasklistId,
      requestBody: taskBody,
    });

    const parentTaskId = res.data.id;

    if (
      Array.isArray(task.subtasks) &&
      task.subtasks.length > 0 &&
      parentTaskId
    ) {
      for (const sub of task.subtasks) {
        try {
          const subtaskBody = {
            title: sub.title,
            notes: sub.notes || "",
            parent: parentTaskId,
          };

          await tasksClient.tasks.insert({
            tasklist: tasklistId,
            requestBody: subtaskBody,
          });
        } catch (subErr) {
          console.error(
            `Failed to create subtask "${sub.title}":`,
            subErr.message
          );
        }
      }
    }

    return res.data;
  } catch (err) {
    console.error("Failed to create task:", err.message);
    throw err;
  }
}

export async function updateTask(userId, tasklistId, taskId, task) {
  const tasks = await getTasksClient(userId);

  if (!taskId && task.title) {
    const foundId = await findTaskIdByTitle(userId, tasklistId, task.title);
    if (!foundId) {
      throw new Error(
        `Task with title "${task.title}" not found in tasklist ${tasklistId}`
      );
    }
    taskId = foundId;
  }

  if (!taskId) {
    throw new Error("Task ID or Task Title must be provided to update a task.");
  }

  // Patch the task
  const res = await tasks.tasks.patch({
    tasklist: tasklistId,
    task: taskId,
    requestBody: task,
  });
  return res.data;
}

export async function findTaskIdByTitle(userId, tasklistId, title) {
  const tasks = await getTasksClient(userId);
  const res = await tasks.tasks.list({
    tasklist: tasklistId,
    showCompleted: true,
    showHidden: true,
    maxResults: 100,
  });

  const task = res.data.items?.find(
    (t) => t.title?.trim().toLowerCase() === title.trim().toLowerCase()
  );

  return task?.id || null;
}

export async function completeTask(userId, tasklistId, taskId) {
  return updateTask(userId, tasklistId, taskId, { status: "completed" });
}

export async function deleteTask(userId, tasklistId, taskId) {
  const tasks = await getTasksClient(userId);
  await tasks.tasks.delete({
    tasklist: tasklistId,
    task: taskId,
  });
  return { success: true };
}

export async function moveTask(userId, taskId, oldListId, newListId) {
  const oldTaskList = await listTasks(userId, oldListId);
  const taskData = oldTaskList.find((t) => t.id === taskId);
  if (!taskData) throw new Error("Task not found in old list");

  await deleteTask(userId, oldListId, taskId);

  return createTask(userId, newListId, {
    title: taskData.title,
    notes: taskData.notes || undefined,
    due: taskData.due || undefined,
    status: taskData.status,
  });
}