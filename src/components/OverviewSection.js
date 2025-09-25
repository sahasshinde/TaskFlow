"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  CalendarDays,
  ListTodo,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OverviewDashboard({ userId }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState({
    pending: [],
    ongoing: [],
    upcoming: [],
    noDueDate: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [eventRes, taskRes] = await Promise.all([
          fetch(`/api/calendar/overview`),
          fetch(`/api/task/alltask`),
        ]);

        const eventData = await eventRes.json();
        const taskData = await taskRes.json();
        console.log("Fetched tasks:", taskData);

        if (eventData.success) setEvents(eventData.events || []);
        if (taskData) setTasks(taskData);
      } catch (err) {
        console.error("Error fetching overview:", err);
        toast.error("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchOverview();
  }, [userId]);

  const totalEvents = events.length;
  const upcomingEvents = events;

  // Helper for relative time
  const timeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const taskStatuses = [
    { key: "pending", label: "Pending", color: "blue" },
    { key: "ongoing", label: "Ongoing", color: "green" },
    { key: "upcoming", label: "Upcoming", color: "violet" },
    { key: "noDueDate", label: "No Due Date", color: "gray" },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={<CalendarDays className="w-6 h-6 text-red-900" />}
          label="Events this Week"
          value={totalEvents}
          color="bg-red-50"
        />
        {taskStatuses.map((status) => (
          <StatCard
            key={status.key}
            icon={
              <ListTodo className={`w-6 h-6 text-${status.color}-600`} />
            }
            label={`${status.label} Tasks`}
            value={tasks[status.key].length}
            color={`bg-${status.color}-50`}
          />
        ))}
      </div>

      <Separator />

      {/* Main Overview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="shadow-xl rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-red-100">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-900">
                <CalendarDays className="w-5 h-5 text-red-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-12 w-full rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 text-center py-6"
                >
                  No upcoming events 🎉
                </motion.p>
              ) : (
                <ul className="space-y-2">
                  {upcomingEvents.map((e, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="flex items-center justify-between rounded-xl p-3 bg-white shadow-sm hover:shadow-md border border-gray-100 cursor-pointer group"
                      onClick={() => setSelectedEvent(e)}
                    >
                      <span className="font-medium text-gray-800 group-hover:text-indigo-700 transition">
                        {e.summary || "Untitled Event"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        {new Date(
                          e.start?.dateTime || e.start?.date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition" />
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Overview */}
        <Card className="shadow-xl rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-red-100">
          <CardHeader className="flex justify-between items-center flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-900">
              <ListTodo className="w-6 h-6 text-red-600 shrink-0" />
              Tasks Overview
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Mobile: Dropdown */}
            <div className="sm:hidden mb-4">
              <Select
                value={activeTab}
                onValueChange={(val) => setActiveTab(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label} ({tasks[status.key]?.length || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs
              defaultValue="ongoing"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="hidden sm:grid sm:grid-cols-4 gap-2 bg-red-50 p-1 rounded-lg mb-4">
                {taskStatuses.map((status) => (
                  <TabsTrigger
                    key={status.key}
                    value={status.key}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-sm sm:text-base"
                  >
                    {status.label}
                    {tasks[status.key]?.length > 0 && (
                      <Badge
                        className={`ml-1 bg-${status.color}-100 text-${status.color}-700`}
                      >
                        {tasks[status.key].length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {taskStatuses.map((status) => (
                <TabsContent key={status.key} value={status.key}>
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-12 w-full rounded-lg bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : tasks[status.key].length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No {status.label.toLowerCase()} tasks 🎉
                    </p>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1 sm:pr-2">
                      {tasks[status.key].map((task) => {
                        const isOverdue =
                          task.due && new Date(task.due) < new Date();

                        return (
                          <motion.li
                            key={task.id}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
                          >
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div>
                                <h4 className="font-medium text-gray-800 truncate max-w-[240px] sm:max-w-[300px]">
                                  {task.title}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                                  {task.due && (
                                    <span
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                                        isOverdue
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due).toLocaleDateString(
                                        "en-GB",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                        }
                                      )}
                                    </span>
                                  )}
                                  <Badge variant="outline">
                                     {task.tasklistName}
                                  </Badge>
                                  <span className="italic text-gray-500">
                                    Updated {timeAgo(task.updated)}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <a
                                  href={task.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button> */}
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent.summary || "Untitled Event"}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent.description || "No additional details"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm text-gray-700 mt-2">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                {new Date(
                  selectedEvent.start?.dateTime || selectedEvent.start?.date
                ).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {selectedEvent.end &&
                  ` → ${new Date(
                    selectedEvent.end?.dateTime || selectedEvent.end?.date
                  ).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
              </p>
              <p>
                <strong>Organizer:</strong>{" "}
                {selectedEvent.organizer?.email || "Unknown"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700"
                >
                  {selectedEvent.status}
                </Badge>
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    selectedEvent.htmlLink,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Open in Google Calendar
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

/* ---- Enhanced Stat Card with Animation + Trend ---- */
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm transition">
        <CardContent className="p-5 flex items-center justify-between">
          {/* Left: Label + Value */}
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-gray-900 sm:text-2xl lg:text-3xl"
            >
              {value}
            </motion.p>
          </div>

          {/* Right: Icon with glow effect */}
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full relative ${color}`}
          >
            {icon}
            <span className="absolute inset-0 rounded-full blur-md opacity-30 bg-white" />
          </div>
        </CardContent>

        {/* Bottom accent bar */}
        <motion.div
          layoutId={`accent-${label}`}
          className={`absolute bottom-0 left-0 w-full h-1 ${color}`}
        />
      </Card>
    </motion.div>
  );
}