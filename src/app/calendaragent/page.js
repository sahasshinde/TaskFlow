"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ExternalLink,
  Clock,
  MapPin,
  User,
  FileText,
  LayoutPanelLeft,
  Calendar,
  Trash2,
  Sparkles,
} from "lucide-react";

export default function CalendarAgentPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userInput = prompt;
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();

      console.log("API Response:", data);
      if (data.success) {
        let newChat = {
          question: userInput,
          response: "",
        };

        if (Array.isArray(data.events)) {
          newChat.response = `Found ${data.events.length} event(s)`;
          newChat.events = data.events;
        } else if (data.event) {
          newChat.response = "Event updated successfully!";
          newChat.event = data.event;
          newChat.link = data.link;
        } else if (data.message && data.link) {
          newChat.response = "Event created successfully!";
          newChat.message = data.message;
          newChat.link = data.link;
        } else {
          newChat.response = data.message || "Done";
        }

        setChats((prev) => [...prev, newChat]);
        toast.success("AI responded");
      } else {
        let failedChat = {
          question: userInput,
          response: data.message || "Failed to process",
        };

        setChats((prev) => [...prev, failedChat]);
        toast.warning(data.message || "Failed to process");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const res = await fetch("/api/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted");
        const updatedChats = [...chats];
        const events = updatedChats[selectedChatIndex].events.filter(
          (e) => e.id !== eventId
        );
        updatedChats[selectedChatIndex].events = events;
        setChats(updatedChats);
      } else {
        toast.error(data.message || "Failed to delete event");
      }
    } catch (err) {
      toast.error("Error deleting event");
    }
  };

  const handleUpdate = (event) => {
    const start = new Date(event.start?.dateTime || event.start?.date);
    const startDate = start.toLocaleDateString("en-IN");
    const startTime = start.toLocaleTimeString("en-IN");

    const updatePrompt = `Update the event titled "${event.summary}" scheduled on ${startDate} at ${startTime}. You can change the title, time, location, or description as needed.`;

    setPrompt(updatePrompt);
    toast.info("Edit the prompt and submit to update the event");
  };

  const filteredChats = chats.filter((chat) =>
    chat.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[100vh] w-full grid md:grid-cols-[25rem_1fr]">
      {/* Left Chat Panel */}
      <div className="bg-white border-r h-full flex flex-col p-4 space-y-4 sticky top-0 overflow-y-auto">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Calendar Agent
          </h2>
          <p className="text-sm text-gray-500">Ask calendar-related queries</p>
        </div>

        <Input
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm"
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredChats.map((chat, index) => (
            <div
              key={index}
              className={`p-2 rounded-md shadow-sm text-sm cursor-pointer ${
                selectedChatIndex === index
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-100"
              }`}
              onClick={() => setSelectedChatIndex(index)}
            >
              <div className="font-medium text-gray-800 line-clamp-2">
                {chat.question}
              </div>
              <div className="text-xs text-gray-500">
                {chat.response?.slice(0, 50)}...
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t">
          <Textarea
            placeholder="e.g., What’s on my calendar today?"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
          />
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Ask AI"}
          </Button>
        </form>
      </div>

      {/* Right Output Panel */}
      <div className="overflow-y-auto p-6 bg-gray-50 h-full">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-green-700">
            <LayoutPanelLeft className="h-5 w-5 text-blue-600" />
            <span>My Chats</span>
          </h2>

          {selectedChatIndex === null ? (
            <p className="text-gray-500">Select a chat to see Response</p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800">
                {chats[selectedChatIndex].question}
              </h3>

              {chats[selectedChatIndex].events?.map((event) => {
                const start = new Date(
                  event.start?.dateTime || event.start?.date
                );
                const end = new Date(event.end?.dateTime || event.end?.date);
                const duration = Math.round(
                  (end.getTime() - start.getTime()) / (1000 * 60)
                );

                return (
                  <div
                    key={event.id}
                    className="border bg-white rounded-xl p-4 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 text-base">
                        {event.summary || "Untitled Event"}
                      </h4>
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open{" "}
                        <ExternalLink className="inline-block w-4 h-4 ml-1 cursor-pointer" />
                      </a>
                    </div>

                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {start.toLocaleString()} — {end.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-2">
                        ({duration} min)
                      </span>
                    </p>

                    {event.location && (
                      <p className="text-sm text-gray-700 flex gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {event.location}
                      </p>
                    )}

                    {event.description && (
                      <p className="text-sm text-gray-700 flex gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {event.description}
                      </p>
                    )}

                    <p className="text-sm text-gray-700 flex gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      Organizer: {event.organizer?.email}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(event.id)}
                        className={"cursor-pointer"}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdate(event)}
                        className="cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 mr-1 text-purple-600" />{" "}
                        Update
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400">
                      Updated: {new Date(event.updated).toLocaleString()}
                    </p>
                  </div>
                );
              })}

              {chats[selectedChatIndex].message &&
                chats[selectedChatIndex].link && (
                  <div className="bg-green-50 border border-green-300 rounded-xl p-4 shadow-sm mt-2">
                    <p className="text-md font-medium text-green-700 mb-2">
                      {chats[selectedChatIndex].message}
                    </p>
                    <a
                      href={chats[selectedChatIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Open Event ↗
                    </a>
                  </div>
                )}

              {!chats[selectedChatIndex].events &&
                !chats[selectedChatIndex].link &&
                chats[selectedChatIndex].response && (
                  <p className="text-sm text-gray-700 mt-2">
                    {chats[selectedChatIndex].response}
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}