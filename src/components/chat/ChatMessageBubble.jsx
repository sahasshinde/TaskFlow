import { Button } from "@/components/ui/button";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import ResponseRenderer from "@/components/ResponseRenderer";

export default function ChatMessageBubble({
  msg,
  agent,
  setInputMessage,
}) {
  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isUser = msg.role === "user";

  return (
    <div
      className={`group relative flex items-end gap-2 max-w-[85%] ${
        isUser ? "ml-auto justify-end" : "mr-auto justify-start"
      }`}
    >
      {/* Optional Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
          🤖
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`p-3 rounded-2xl shadow-md transition 
          ${isUser
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-none"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
          }`}
      >
        {msg.role === "assistant" ? (
          <ResponseRenderer agent={agent} text={msg.content} />
        ) : (
          msg.content
        )}

        {/* Hover Actions */}
        {msg.role === "assistant" && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100"
              onClick={() => handleCopy(msg.content)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100"
              onClick={() => {
                setInputMessage(msg.content);
                toast.message("Ready to regenerate this response");
              }}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
