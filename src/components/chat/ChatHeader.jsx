"use client";

import { Calendar, Mail, ListTodo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AgentHeader({ agent, setAgent, handleClear, title }) {
  const getIcon = () => {
    switch (agent) {
      case "calendar":
        return <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-200" />;
      case "email":
        return <Mail className="w-6 h-6 text-gray-700 dark:text-gray-200" />;
      case "tasks":
        return <ListTodo className="w-6 h-6 text-gray-700 dark:text-gray-200" />;
      default:
        return null;
    }
  };

  return (
    <header className="flex items-center justify-between p-4 
      bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-b border-white/40 dark:border-gray-700/50 
      shadow-md sticky top-0 z-40">
      
      {/* Title + Icon */}
      <div className="flex items-center gap-2">
        {getIcon()}
        <h1 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100 drop-shadow-sm">
          {title || `${agent} Assistant`}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center">
        {/* Agent Selector */}
        <Select value={agent} onValueChange={(val) => setAgent(val)}>
          <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border-none rounded-lg 
            hover:bg-white/70 dark:hover:bg-gray-700/70 focus:ring-2 focus:ring-gray-400/50 transition">
            <SelectValue placeholder="Select Agent" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <SelectItem value="calendar">📅 Calendar</SelectItem>
            <SelectItem value="email">✉️ Email</SelectItem>
            <SelectItem value="tasks">✅ Tasks</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleClear}
          title="Clear chat"
          className="bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 
          text-gray-900 dark:text-gray-100 rounded-full shadow-md transition"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
