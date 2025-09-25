import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getCurrentDateTime() {
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [date, time] = localISO.split("T");
  return { date, time };
}

export async function extractCalendarAction(prompt) {
  const { date, time } = getCurrentDateTime();

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a smart assistant that extracts structured calendar actions from natural language.

Current local date is ${date}, and time is ${time}. Use this for interpreting relative dates like "tomorrow", "this week", "next month", etc.

You must return a SINGLE-LINE valid JSON object for ONE of the following actions:

---

1. **Add Event**
{
  "action": "add_event",
  "title": string,
  "date": "YYYY-MM-DD",
  "time": "HH:MM" | null,
  "duration_minutes": number | null,
  "description": string | null,
  "location": string | null,
  "attendees": [email, ...] | [],
  "colorId": string | null,
  "category": string | null
}

---

2. **Update Event**
{
  "action": "update_event",
  "old_title": string,
  "new_title": string | null,
  "new_date": "YYYY-MM-DD" | null,
  "new_time": "HH:MM" | null,
  "new_duration_minutes": number | null,
  "description": string | null,
  "location": string | null,
  "attendees": [email, ...] | [],
  "colorId": string | null,
  "category": string | null
}

---

3. **Delete Event**
{
  "action": "delete_event",
  "title": string
}

---

4. **Fetch Events**
{
  "action": "fetch_events",
  "title": string | null,
  "query": string | null,
  "date": "YYYY-MM-DD" | null,
  "month": string | null,
  "year": number | null,
  "timeMin": "YYYY-MM-DD" | null,
  "timeMax": "YYYY-MM-DD" | null,
  "deadline": "YYYY-MM-DD" | null,
  "category": string | null
}

---

Rules:
- Only include fields relevant to the action.
- Use \`timeMin\` and \`timeMax\` for ranges (e.g., this week/month/year).
- Set unknown fields to null or empty array.
- Categories must be one of: ["Work", "Meeting", "Study", "Personal", "Call", "Reminder", "Errand", "Project"]
- Use matching colorId (e.g., Work → "5", Personal → "9") if possible.
- DO NOT include anything outside the JSON object. No explanations, comments, or line breaks.
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = res.choices[0].message.content?.trim() || "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse action response:", raw);
    return { action: "unknown" };
  }
}