"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TaskActionButton({ taskData }) {
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: JSON.stringify(taskData),
        }),
      });

      if (!res.ok) throw new Error("Task creation failed");
      toast.success("Task added successfully!");
    } catch (err) {
      console.error("Task error:", err);
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddTask}
      disabled={loading}
      className="w-full sm:w-auto relative flex items-center gap-2 rounded-xl border border-primary/40 
                 bg-gradient-to-r from-primary/10 via-background to-primary/10 
                 hover:from-primary/20 hover:to-primary/5 
                 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <ListTodo className="h-4 w-4 text-primary" />
      )}
      {loading ? "Adding..." : "Add to Tasks"}
    </Button>
  );
}