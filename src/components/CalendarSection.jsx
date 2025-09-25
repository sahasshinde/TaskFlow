"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  CalendarClock,
  ExternalLink,
  Trash2,
  CalendarDays,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CalendarDashboard({ isSignedIn, userId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("day"); // "day" | "week" | "month"

  // Fetch by single day
  const fetchEvents = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/today?userId=${userId}&date=${date.toISOString()}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Fetch by range
  const fetchEventsByRange = async (start, end) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/range?userId=${userId}&start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events by range:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn || !selectedDate) return;

    if (viewMode === "day") {
      fetchEvents(selectedDate);
    } else if (viewMode === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      fetchEventsByRange(startOfWeek, endOfWeek);
    } else if (viewMode === "month") {
      const startOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      );
      fetchEventsByRange(startOfMonth, endOfMonth);
    }
  }, [isSignedIn, selectedDate, viewMode]);

  const confirmDelete = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      const res = await fetch("/api/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, eventId: eventToDelete }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted");
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete));
      } else {
        toast.error(data.message || "Failed to delete event");
      }
    } catch (err) {
      toast.error("Error deleting event");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const toggleDescription = (eventId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  function formatEventTime(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (start.includes("T00:00:00") && end.includes("T23:59:59")) {
      return "All Day";
    }

    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return `${startDate.toLocaleTimeString(
      "en-US",
      options
    )} – ${endDate.toLocaleTimeString("en-US", options)}`;
  }

  // Filtered events
  const filteredEvents = events.filter((event) => {
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);
    const now = new Date();

    let status = "Upcoming";
    if (now > end) status = "Completed";
    else if (now >= start && now <= end) status = "Ongoing";

    if (filter === "all") return true;
    return status.toLowerCase() === filter;
  });

  return (
    <>
      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this event? This action cannot be
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

      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-indigo-800 flex items-center gap-2">
          <Calendar /> Events
        </h1>

        <div className="flex gap-3 items-center">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors shadow-sm"
              >
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                {selectedDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <ShadcnCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* View Mode Dropdown */}
          <Select onValueChange={setViewMode} defaultValue="day">
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Dropdown */}
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2 text-indigo-600" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Section */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <CalendarDays className="h-12 w-12 mb-3 text-gray-400" />
          <p className="text-base font-medium">No events found</p>
          <p className="text-sm text-gray-400">
            Try selecting another filter, date, or view
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event, i) => {
            const start = new Date(event.start?.dateTime || event.start?.date);
            const end = new Date(event.end?.dateTime || event.end?.date);

            let status = "Upcoming";
            let badgeColor = "bg-indigo-100 text-indigo-700";

            if (new Date() > end) {
              status = "Completed";
              badgeColor = "bg-green-100 text-green-700";
            } else if (new Date() >= start && new Date() <= end) {
              status = "Ongoing";
              badgeColor = "bg-amber-100 text-amber-700";
            }

            return (
              <Card
                key={i}
                className="hover:shadow-md hover:border-indigo-200 transition p-4 rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Event Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <CalendarClock className="h-5 w-5 text-indigo-600 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-md font-semibold truncate max-w-xs sm:max-w-sm">
                          {event.summary || "Untitled Event"}
                        </h2>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Time */}
                      {formatEventTime(
                        event.start.dateTime || event.start.date,
                        event.end.dateTime || event.end.date
                      ) === "All Day" ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
                          All Day
                        </span>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {formatEventTime(
                            event.start.dateTime || event.start.date,
                            event.end.dateTime || event.end.date
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                          <div>
                            {expandedDescriptions[event.id] ? (
                              <>
                                {event.description}
                                <button
                                  onClick={() => toggleDescription(event.id)}
                                  className="ml-2 text-indigo-600 hover:underline text-xs"
                                >
                                  Show less
                                </button>
                              </>
                            ) : (
                              <>
                                {event.description.length > 100
                                  ? event.description.slice(0, 100) + "..."
                                  : event.description}
                                {event.description.length > 100 && (
                                  <button
                                    onClick={() => toggleDescription(event.id)}
                                    className="ml-2 text-indigo-600 hover:underline text-xs"
                                  >
                                    Read more
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {/* Open Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              window.open(event.htmlLink, "_blank")
                            }
                            className="cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 text-indigo-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open in Calendar</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Delete Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {status === "Completed" ? (
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled
                              className="opacity-60 cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => confirmDelete(event.id)}
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Event</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}