"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parses a natural language task instruction into a structured intent for Google Tasks CRUD.
 *
 * @param userPrompt The natural language instruction from the user.
 */
export async function parseTaskInstruction(userPrompt) {
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const tzOffsetMinutes = now.getTimezoneOffset();
  const tzHours = Math.floor(Math.abs(tzOffsetMinutes) / 60)
    .toString()
    .padStart(2, "0");
  const tzMinutes = (Math.abs(tzOffsetMinutes) % 60)
    .toString()
    .padStart(2, "0");
  const tzSign = tzOffsetMinutes <= 0 ? "+" : "-";
  const timezone = `${tzSign}${tzHours}:${tzMinutes}`;

  const systemPrompt = `
You are an AI that converts user requests into valid JSON instructions for Google Tasks API.

**Current context:**
- Today's date: ${todayISO}
- Current time: ${now.toTimeString().split(" ")[0]} (HH:MM:SS)
- Timezone offset: ${timezone}
- If user says "today", use date ${todayISO}.
- If user says "tomorrow", add 1 day to ${todayISO}.
- If user says "next <weekday>", calculate the exact date based on current context.
- For times like "at 3pm", combine with the correct date to produce full ISO 8601 datetime with timezone offset.

**Output rules by action:**
1. **CREATE**
{
  "action": "create",
  "tasklistId": string | "@default",
  "task": {
    "title": string,
    "notes": string | null,
    "due": string | null, // ISO 8601 date-time or null
    "status": "needsAction" | "completed" | null,
    "subtasks": [
      { "title": string, "notes": string | null }
    ] | []
  }
}

2. **UPDATE**
{
  "action": "update",
  "tasklistId": string | "@default",
  "taskId": string, // Must be provided
  "updates": {
    "title": string | null,
    "notes": string | null,
    "due": string | null,
    "status": "needsAction" | "completed" | null
  }
}

3. **DELETE**
{
  "action": "delete",
  "tasklistId": string | "@default",
  "taskId": string // Must be provided
}

4. **LIST**
{
  "action": "list",
  "tasklistId": string | "@default",
  "filter": string | null // Optional search/filter keyword
}

**General rules:**
- Only output JSON. No markdown, no explanations, no backticks.
- Always resolve relative dates/times into exact ISO format.
- If no time provided for a due date, set it to 09:00:00 local time.
- For create/update, omit properties not relevant to the action.
- Subtasks only for create action.
`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 400,
  });

  const content = resp.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content);
    return { parsed, raw: content };
  } catch (err) {
    return { error: "Invalid JSON from AI", raw: content };
  }
}