"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles } from "lucide-react";

const agentPrompts = {
  calendar: [
    "What's on my schedule today?",
    "Add a meeting",
    "Show me this week's events",
  ],
  email: ["Check my emails", "Send a quick email", "Mark all as read"],
  tasks: ["Add a new task", "Show pending tasks", "Complete today's task"],
};

export default function ChatInput({
  agent,
  input,
  setInput,
  sendMessage,
  loading,
  autoResize = false,
}) {
  const textareaRef = useRef(null);
  const prompts = agentPrompts[agent] || [];

  // Auto resize textarea
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input, autoResize]);

  return (
    <footer className="p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-inner sticky bottom-0">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input + Send */}
        <div className="flex-1 flex items-center gap-2 relative">
          <textarea
            ref={textareaRef}
            placeholder={`Ask about your ${agent}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 resize-none overflow-hidden rounded-xl border border-gray-300 dark:border-gray-600 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 
              bg-white/80 dark:bg-gray-800/80 
              p-3 text-sm transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex items-center gap-1 sm:px-4 bg-blue-600 hover:bg-blue-700 
              text-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>

        {/* Quick Prompts */}
        {prompts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {prompts.map((q) => (
              <Badge
                key={q}
                onClick={() => setInput(q)}
                className="cursor-pointer rounded-full px-3 py-1 flex items-center 
                  bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                  hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              >
                <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
                {q}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
