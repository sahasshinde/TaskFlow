"use client";

import React from "react";
import { Plus, Search, X, Pin, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar({
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat,
  togglePinChat,
  deleteChat,
  search,
  setSearch,
}) {
  return (
    <div className="flex flex-col h-full w-full sm:w-72 bg-white border-r border-gray-200 shadow-md">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 text-lg">Chats</h2>
        <Button
          size="icon"
          onClick={createNewChat}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-red-200 transition">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={cn(
              "flex justify-between items-center px-3 py-2 cursor-pointer rounded-lg transition-all group",
              activeChatId === chat.id
                ? "bg-red-50 border border-red-200 text-red-700 shadow-sm"
                : "hover:bg-gray-50"
            )}
          >
            {/* Title + Pin */}
            <div className="flex items-center gap-2 truncate">
              <span
                className={cn(
                  "truncate text-sm",
                  chat.pinned
                    ? "text-red-600 font-semibold"
                    : "text-gray-700"
                )}
              >
                {chat.title}
              </span>
              {chat.pinned && (
                <Pin
                  className="w-4 h-4 text-red-500"
                  title="Pinned chat"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinChat(chat.id);
                }}
              >
                <Pin
                  className={cn(
                    "h-4 w-4",
                    chat.pinned ? "text-red-500" : "text-gray-400"
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {chats.length === 0 && (
          <div className="p-4 text-gray-400 text-center text-sm">
            No chats yet. Start a new one!
          </div>
        )}
      </div>

      <a
        href="/dashboard"
        className="fixed bottom-8 left-8 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-3 flex items-center gap-2 transition"
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </a>
    </div>
  );
}
