"use client";

import { MailOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DetailViewer({ response }) {
  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
        <MailOpen className="h-10 w-10 opacity-50" />
        <p className="text-sm">👈 Select an AI response to view details</p>
      </div>
    );
  }

  if (Array.isArray(response)) {
    return (
      <div className="p-6 space-y-4">
        {response.map((email, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
          >
            <p className="text-base font-semibold text-gray-900">
              {email.subject}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
              <span>From: {email.from}</span>
              <span>{email.date}</span>
            </div>
            <p className="mt-2 text-gray-700 text-sm leading-relaxed">
              {email.snippet}
            </p>
            <div className="mt-3">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <a
                  href={email.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Gmail
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 whitespace-pre-wrap bg-white rounded-xl shadow-sm border border-gray-200 text-gray-800 leading-relaxed">
      {response}
    </div>
  );
}
