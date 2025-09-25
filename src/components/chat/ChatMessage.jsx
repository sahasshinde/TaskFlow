import { motion } from "framer-motion";
import ChatMessageBubble from "./ChatMessageBubble";

export default function ChatMessages({
  messages,
  agent,
  updateChatMessages,
  setInputMessage,
}) {
  return (
    <main
      className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 
      bg-gradient-to-b from-white via-gray-50 to-gray-100 
      dark:from-gray-900 dark:via-gray-950 dark:to-black
      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
      dark:scrollbar-thumb-gray-700 rounded-t-xl"
    >
      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <ChatMessageBubble
            msg={msg}
            agent={agent}
            setInputMessage={setInputMessage}
            updateChatMessages={updateChatMessages}
          />
        </motion.div>
      ))}

      {/* Spacer so last message never sticks to input */}
      <div className="h-20" />
    </main>
  );
}
