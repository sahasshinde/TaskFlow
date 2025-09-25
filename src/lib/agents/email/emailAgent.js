import OpenAI from "openai";

import {
  sendEmail,
  fetchEmailsByQuery,
  getEmailById,
  deleteEmail,
  buildSearchQuery,
} from "./handler";



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


function getDateContext() {
  const now = new Date();
  const today = now.toISOString().split("T")[0].replace(/-/g, "/");

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0].replace(/-/g, "/");

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "/");

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "/");

  return { today, tomorrow, startOfMonth, endOfMonth };
}

async function handlePrompt(prompt, userId) {
  try {
    const { today, tomorrow, startOfMonth, endOfMonth } = getDateContext();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are an assistant that interprets user instructions for Gmail actions.  
            Respond ONLY in valid JSON. No explanations.
                    
            Context:
            - Today: ${today}
            - Tomorrow: ${tomorrow}
            - This month: from ${startOfMonth} to ${endOfMonth}
                    
            Rules:
            1. If action = "send_email", expand and rephrase the subject and message into a clear, professional, or polite structure depending on the tone of the prompt.
            2. If action = "search_emails", replace natural phrases like "today", "tomorrow", or "this month" with proper yyyy/mm/dd values using the provided context.
            3. Always return a structured JSON with { action, data }.
                    
            Allowed actions:
            - "send_email" { to, subject, message }
            - "get_email" { messageId }
            - "delete_email" { messageId }
            - "fetch_emails" { query, maxResults }
            - "search_emails" { unread?, from?, subject?, keyword?, after?, before?, maxResults? }
                    
            Example (search with time):
            {
              "action": "search_emails",
              "data": { "keyword": "meeting notes", "after": "${today}", "before": "${tomorrow}", "unread": true }
            }
                    
            Example (send email):
            {
              "action": "send_email",
              "data": {
                "to": "alex@example.com",
                "subject": "Project Update - September Progress",
                "message": "Hi Alex,\\n\\nI hope you're doing well. Here’s a quick update on our September project progress...\\n\\nBest regards,\\n[Your Name]"
              }
            }
          `,
        },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "";
    console.log("🧠 AI Raw Reply:", reply);

    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch (err) {
      return { success: false, message: "Invalid JSON from AI", raw: reply };
    }

    const { action, data } = parsed;
    if (!action || !data) {
      return { success: false, message: "Missing action or data." };
    }

    if (action === "send_email") {
      const { to, subject, message } = data;
      if (!to || !subject || !message) {
        return { success: false, message: "Missing fields for send_email." };
      }
      const result = await sendEmail(to, subject, message, userId);
      return { success: true, result };
    }

    if (action === "get_email") {
      const { messageId } = data;
      if (!messageId) return { success: false, message: "Missing messageId." };
      const result = await getEmailById(messageId, userId);
      return { success: true, result };
    }

    if (action === "delete_email") {
      const { messageId } = data;
      if (!messageId) return { success: false, message: "Missing messageId." };
      const result = await deleteEmail(messageId, userId);
      return { success: true, result };
    }

    if (action === "fetch_emails") {
      const { query = "in:inbox", maxResults = 10 } = data;
      const result = await fetchEmailsByQuery(query, maxResults, userId);
      return { success: true, result };
    }

    if (action === "search_emails") {
      const {
        unread = false,
        from,
        subject,
        keyword,
        after,
        before,
        maxResults = 10,
      } = data;
      const query = buildSearchQuery({
        unread,
        from,
        subject,
        keyword,
        after,
        before,
      });
      const result = await fetchEmailsByQuery(query, maxResults, userId);
      return { success: true, result };
    }

    return { success: false, message: "Unknown action." };
  } catch (error) {
    console.error("❌ Error in handlePrompt:", error);
    return { success: false, message: "AI processing failed." };
  }
}

export { handlePrompt };