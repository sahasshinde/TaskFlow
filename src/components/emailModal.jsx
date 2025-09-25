"use client";

import { useEffect } from "react";
import { ExternalLink, X, User, CalendarDays, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function EmailModal({ email, onClose, onEmailRead }) {
  useEffect(() => {
    async function markAsRead() {
      if (email.labelIds?.includes("UNREAD")) {
        try {
          await fetch("/api/emails/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailId: email.id, action: "read" }),
          });
          // Notify parent to update state
          onEmailRead?.(email.id);
        } catch (err) {
          console.error("Failed to mark email as read:", err);
        }
      }
    }

    markAsRead();
  }, [email, onEmailRead]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-[650px] max-w-full p-6 relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Subject */}
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {email.subject}
          </h2>
        </div>

        {/* Meta Info */}
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span>
              <strong>From:</strong> {email.from}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>
              <strong>Date:</strong> {new Date(email.date).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Snippet */}
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed border-t pt-3">
          {email.snippet || "No preview available."}
        </div>

        {/* Open in Gmail */}
        <div className="flex justify-end">
          <Button
            variant="default"
            className="mt-6 flex items-center gap-2"
            onClick={() =>
              window.open(
                `https://mail.google.com/mail/u/0/#inbox/${email.id}`,
                "_blank"
              )
            }
          >
            <ExternalLink className="w-4 h-4" />
            Open in Gmail
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}