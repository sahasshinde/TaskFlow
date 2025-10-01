"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CalendarActionButton({ eventData }) {
  const [loading, setLoading] = useState(false);

  const handleAddCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: JSON.stringify(eventData),
        }),
      });

      if (!res.ok) throw new Error("Calendar event creation failed");
      toast.success("Event added to calendar!");
    } catch (err) {
      console.error("Calendar error:", err);
      toast.error("Failed to add calendar event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddCalendar}
      disabled={loading}
      className="w-full sm:w-auto relative flex items-center gap-2 rounded-xl border border-blue-500/40 
                 bg-gradient-to-r from-blue-50 via-background to-blue-50 
                 hover:from-blue-100 hover:to-blue-50 
                 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      ) : (
        <Calendar className="h-4 w-4 text-blue-500" />
      )}
      {loading ? "Adding..." : "Add to Calendar"}
    </Button>
  );
}