"use client";

import { motion } from "framer-motion";

export default function TypingIndicator({
  loading,
  message = "Assistant is typing...",
  dotColor = "bg-gray-400",
  dotSize = "w-2 h-2",
}) {
  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex items-end gap-2 px-4 py-2"
    >
      {/* Bubble container */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 shadow-sm max-w-[70%]">
        {/* Dots */}
        <div className="flex space-x-1">
          <span
            className={`${dotSize} ${dotColor} rounded-full animate-bounce`}
            style={{ animationDelay: "0s" }}
          ></span>
          <span
            className={`${dotSize} ${dotColor} rounded-full animate-bounce`}
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className={`${dotSize} ${dotColor} rounded-full animate-bounce`}
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>

        {/* Label */}
        <span className="text-xs text-gray-500">{message}</span>
      </div>
    </motion.div>
  );
}
