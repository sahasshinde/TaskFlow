import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function interpretJson(body) {
  const agentType = body.agent || "generic";

  const systemPrompt = `
You are an assistant that converts JSON into clear, natural sentences for users.
Be concise, friendly, and context-aware. Adapt your tone based on the agent type.

- If it's "calendar": summarize events (title, date, time, location).
- If it's "tasks": explain task status, due dates, or updates.
- If it's "gmail": summarize email subjects, senders, and times.
- If "generic": just describe the JSON naturally.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Agent type: ${agentType}\nJSON:\n${JSON.stringify(
          body,
          null,
          2
        )}`,
      },
    ],
  });

  return completion.choices[0].message.content;
}