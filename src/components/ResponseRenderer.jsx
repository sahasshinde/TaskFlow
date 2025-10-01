"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import TaskActionButton from "./TaskActionButtn";
import CalendarActionButton from "./CalendarActionButton";

function MarkdownRenderer({ text }) {
  return (
    <div className="prose prose-base max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function ResponseRenderer({ text, structuredData }) {
  return (
    <div className="space-y-6">
      {/* Normal readable text */}
      <MarkdownRenderer text={text} />

      {/* If email agent with multiple structured items */}
      {Array.isArray(structuredData) && structuredData.length > 0 && (
        <div className="space-y-4">
          {structuredData.map((email, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm"
            >
              <p className="font-medium text-gray-800">
                {email.subject || "No subject"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {email.from ? `From: ${email.from}` : ""}
              </p>
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
  <TaskActionButton taskData={email} />
  <CalendarActionButton eventData={email} />
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}