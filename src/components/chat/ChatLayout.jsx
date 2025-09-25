"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatLayout() {
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [], pinned: false },
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [messages, setMessages] = useState([]);
  const [agent, setAgent] = useState("calendar");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const endRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync messages with active chat
  useEffect(() => {
    const activeChat = chats.find((c) => c.id === activeChatId);
    if (activeChat) setMessages(activeChat.messages);
  }, [activeChatId, chats]);

  const updateChatMessages = (newMessages) => {
    setMessages(newMessages);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
      )
    );
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      pinned: false,
    };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        createNewChat={createNewChat}
        setChats={setChats}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Section */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <ChatHeader
          agent={agent}
          setAgent={setAgent}
          clearChat={() => updateChatMessages([])}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <ChatMessages
            messages={messages}
            agent={agent}
            setInputMessage={() => {}} // will be connected with ChatInput
            updateChatMessages={updateChatMessages}
          />
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <ChatInput
          agent={agent}
          loading={loading}
          onSendMessage={(msg) =>
            updateChatMessages([...messages, { role: "user", content: msg }])
          }
        />
      </div>
    </div>
  );
}
