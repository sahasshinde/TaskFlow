"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ListTodo, RefreshCcw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ResponseRenderer from "@/components/ResponseRenderer";
import Sidebar from "@/components/chat/Sidebar";
import AgentHeader from "@/components/chat/ChatHeader";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";

export default function MultiAgentChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState("calendar");
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [], pinned: false },
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editMessageId, setEditMessageId] = useState(null); 
  const endRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Sync active chat messages
  useEffect(() => {
    const activeChat = chats.find((c) => c.id === activeChatId);
    if (activeChat) setMessages(activeChat.messages);
  }, [activeChatId, chats]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    let updatedMessages;

    // If editing a previous message
    if (editMessageId !== null) {
      updatedMessages = messages.map((msg, idx) =>
        idx === editMessageId ? userMessage : msg
      );
      setEditMessageId(null);
    } else {
      updatedMessages = [...messages, userMessage];
    }

    updateChatMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const agentRes = await fetch(`/api/agent/${agent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const agentJson = await agentRes.json();
      if (!agentJson.success) throw new Error(`${agent} agent failed`);
      console.log("Agent response:", agentJson);
      const data = agentJson.events || agentJson;

      const interpRes = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, events: data }),
      });

      if (!interpRes.ok) throw new Error("Interpreter request failed");

      const interpJson = await interpRes.json();
      const aiMessage = {
        role: "assistant",
        content: interpJson.response,
        structuredData: agent === "email" ? data.result.emails || [] : null,
      };

      updateChatMessages([...updatedMessages, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateChatMessages = (newMessages) => {
    setMessages(newMessages);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
      )
    );
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied response to clipboard");
  };

  const handleClear = () => {
    updateChatMessages([]);
    toast.info("Chat cleared");
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
    setSidebarOpen(false);
  };

  const togglePinChat = (id) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat
      )
    );
  };

  const deleteChat = (id) => {
    if (chats.length === 1) return toast.error("Cannot delete last chat");
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (id === activeChatId) {
      setActiveChatId(chats[0].id);
    }
  };

  const filteredChats = chats
    .filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="relative flex h-screen w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat bg-gray-50 overflow-hidden">
      {/* Animated glowing overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-red-200 to-transparent opacity-20"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
      />

      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-50 md:hidden"
          >
            <ListTodo className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            chats={filteredChats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            createNewChat={createNewChat}
            togglePinChat={togglePinChat}
            deleteChat={deleteChat}
            search={search}
            setSearch={setSearch}
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex bg-white border-r shadow-sm flex-col">
        <Sidebar
          chats={filteredChats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          createNewChat={createNewChat}
          togglePinChat={togglePinChat}
          deleteChat={deleteChat}
          search={search}
          setSearch={setSearch}
        />
      </aside>

      {/* Main chat */}
      <div className="flex flex-col flex-1 relative z-10">
        <AgentHeader
          agent={agent}
          setAgent={setAgent}
          handleClear={handleClear}
        />

        <Separator />

        <main className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          {/* Chat messages */}
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } group`}
            >
              <div
                className={`p-3 rounded-2xl shadow-sm max-w-[80%] break-words transition ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900 relative"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ResponseRenderer
                    text={msg.content}
                    structuredData={msg.structuredData}
                  />
                ) : (
                  msg.content
                )}

                {msg.role === "assistant" && (
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(msg.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>

                    {/* Edit-in-place button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setInput(msg.content);
                        setEditMessageId(idx);
                        toast.message("Editing this response");
                      }}
                    >
                      <RefreshCcw className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading Skeleton */}
          {loading &&
            Array(2)
              .fill(0)
              .map((_, idx) => (
                <motion.div
                  key={`skeleton-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-3 rounded-2xl bg-gray-200 animate-pulse max-w-[60%] h-6"></div>
                </motion.div>
              ))}

          <TypingIndicator
            loading={loading}
            message="Assistant is typing..."
            dotColor="bg-red-500"
            dotSize="w-3 h-3"
          />

          <div ref={endRef} />
        </main>

        {/* Chat input */}
        <ChatInput
          agent={agent}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
          autoResize // flag to enable smart auto-resize
        />
      </div>
    </div>
  );
}