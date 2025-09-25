"use client";

import { motion } from "framer-motion";
import ChatMessage from "./ChatMessage";

export default function ChatList({ messages, renderContent }) {
  return (
    <div className="flex flex-col space-y-4 px-2 sm:px-4 py-4 overflow-y-auto scroll-smooth">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="group"
        >
          <ChatMessage
            role={msg.role}
            content={msg.content}
            renderContent={renderContent}
          />
        </motion.div>
      ))}
    </div>
  );
}
