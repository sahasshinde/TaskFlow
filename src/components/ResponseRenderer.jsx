"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Enhanced Markdown Renderer
function MarkdownRenderer({ text }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-black prose-em:text-gray-600 prose-em:italic prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-md prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-li:marker:text-blue-500 prose-table:border prose-table:border-gray-300 prose-th:bg-gray-100 prose-th:text-gray-800 prose-th:p-2 prose-td:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Custom link styling
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-600 font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),

          // Custom checkbox for task lists
          input: ({ node, ...props }) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-400 text-green-600 focus:ring-green-500"
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },

          // Highlight important words (basic keyword detection)
          p: ({ node, children }) => {
            const highlight = (child) => {
              if (typeof child === "string") {
                return child.split(/(Important|Deadline|Tomorrow)/gi).map(
                  (part, i) =>
                    ["important", "deadline", "tomorrow"].includes(
                      part.toLowerCase()
                    ) ? (
                      <span
                        key={i}
                        className="bg-yellow-200 text-yellow-800 font-semibold px-1 rounded"
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                );
              }
              return child;
            };

            return <p>{React.Children.map(children, highlight)}</p>;
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// Main Renderer (no more agent-based cards)
export default function ResponseRenderer({ text }) {
  return <MarkdownRenderer text={text} />;
}