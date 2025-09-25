"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  ListTodo,
  ExternalLink,
  Trash2,
  CheckCircle2,
  CalendarDays,
  Calendar as CalendarIcon,
  Filter,
  Inbox,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function TasksDashboard({ isSignedIn }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/task/alltask");
      const data = await res.json();

      if (data) {
        const mappedTasks = Object.entries(data).flatMap(([status, items]) =>
          items.map((t) => ({
            id: t.id,
            title: t.title,
            dueDate: t.due || null,
            status: status || "noduedate",
            htmlLink: t.webViewLink || t.links?.[0]?.link || null,
            completed: t.status === "completed",
          }))
        );
        setTasks(mappedTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) fetchTasks();
  }, [isSignedIn]);

  // --- Delete ---
  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const res = await fetch(`/api/task/${taskToDelete}/delete`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Task deleted");
        setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
      } else {
        toast.error("Failed to delete task");
      }
    } catch (err) {
      toast.error("Error deleting task");
    } finally {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  // --- Complete toggle ---
  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const res = await fetch(`/api/task/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus ? "needsAction" : "completed",
        }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: !currentStatus } : t
          )
        );
        toast.success(
          currentStatus ? "Task marked as incomplete" : "Task completed"
        );
      } else {
        toast.error("Failed to update task");
      }
    } catch (err) {
      toast.error("Error updating task");
    }
  };

  // --- Filters ---
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      (task.dueDate &&
        new Date(task.dueDate).toISOString().slice(0, 10) === dateFilter);

    return matchesStatus && matchesDate;
  });

  // --- Status Colors ---
  const statusColors = {
    pending: "border-l-2 border-red-400",
    ongoing: "border-l-2 border-blue-400",
    upcoming: "border-l-2 border-green-400",
    noduedate: "border-l-2 border-gray-400",
  };

  const statusLabels = {
    pending: "Pending",
    ongoing: "Ongoing",
    upcoming: "Upcoming",
    noduedate: "No Due Date",
  };

  // --- Group Tasks by Status ---
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const key = task.status || "noduedate";
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    return groups;
  }, {});

  return (
    <>
      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-indigo-800 flex items-center gap-2">
          <ListTodo /> Tasks
        </h1>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Calendar Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Select date">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {/* Only show calendar view, no extra header */}
              <Calendar
                mode="single"
                selected={dateFilter ? new Date(dateFilter) : undefined}
                onSelect={(date) =>
                  setDateFilter(date ? format(date, "yyyy-MM-dd") : "")
                }
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>

          {/* Status filter */}
          <Select onValueChange={(v) => setStatusFilter(v)} defaultValue="all">
            <SelectTrigger className="w-36 rounded-md border-gray-300 focus:ring-1 focus:ring-indigo-300 focus:border-indigo-400 flex items-center transition-all duration-200 hover:shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="animate-fade-in">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="noduedate">No Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Groups */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Inbox className="h-10 w-10 text-gray-400 mb-3 animate-bounce" />
          <p className="text-gray-600 text-lg font-semibold">
            You're all caught up! 🎉
          </p>
          <p className="text-sm text-gray-400 mt-1">
            No tasks waiting for you.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([status, tasks]) => (
            <div key={status}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {statusLabels[status]}
              </h2>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const today = new Date();
                  let dueText = "";
                  if (dueDate) {
                    const diff = Math.ceil(
                      (dueDate - today) / (1000 * 60 * 60 * 24)
                    );
                    dueText =
                      diff < 0
                        ? `Overdue by ${Math.abs(diff)} day(s)`
                        : diff === 0
                        ? "Due Today"
                        : `Due in ${diff} day(s)`;
                  }

                  return (
                    <div
                      key={task.id}
                      className={`relative bg-white rounded-md p-4 shadow-sm hover:shadow-md transition flex justify-between items-center ${statusColors[status]}`}
                    >
                      {/* Task Info */}
                      <div className="flex flex-col">
                        <h3
                          className={`text-sm font-medium ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.title || "Untitled Task"}
                        </h3>
                        {dueDate && (
                          <p className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <CalendarDays className="h-3 w-3" />
                            {dueText}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {/* Mark as Complete */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            toggleComplete(task.id, task.completed)
                          }
                          className="h-9 w-9 transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                          title="Mark as complete"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>

                        {/* Open Link */}
                        {task.htmlLink && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(task.htmlLink, "_blank")}
                            className="h-9 w-9 transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            title="Open task link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmDelete(task.id)}
                          className="h-9 w-9 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}