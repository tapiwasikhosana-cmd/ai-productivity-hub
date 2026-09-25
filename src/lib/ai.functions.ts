import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";

class AiError extends Error {}

async function runAi(system: string, user: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiError("AI is not configured yet. Please try again shortly.");
  }

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new AiError("Too many requests right now. Please wait a moment and try again.");
    }
    if (response.status === 402 || response.status === 403) {
      throw new AiError(
        "AI usage is currently unavailable for this workspace. Check your AI credits or limits.",
      );
    }
    console.error("AI gateway error", response.status, detail.slice(0, 500));
    throw new AiError("The AI service could not complete this request. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          text?: string;
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        }
      } catch {
        // ignore partial/non-JSON keepalive frames
      }
    }
  }

  const output = text.trim();
  if (!output) {
    throw new AiError("The AI returned an empty response. Try rephrasing your input.");
  }
  return output;
}

const emailInput = z.object({
  purpose: z.string().min(3).max(2000),
  context: z.string().min(2).max(2000),
  keyPoints: z.string().max(3000).optional().default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const system = [
      "You are an expert business communication writer.",
      "Write one complete, ready-to-send professional email using ONLY the user's details.",
      "Never invent facts, names, dates, numbers or commitments the user did not provide.",
      "Format exactly as:",
      "Subject: <concise subject>",
      "",
      "<greeting>",
      "",
      "<body paragraphs, 2-4 short paragraphs>",
      "",
      "<sign-off>",
      "Use plain text. No markdown, no commentary, no options, no placeholders other than [Your Name] if the sender is unknown.",
    ].join("\n");

    const user = [
      `Tone: ${data.tone}`,
      `Purpose of the email: ${data.purpose}`,
      `Recipient and context: ${data.context}`,
      data.keyPoints.trim() ? `Key points that must be covered:\n${data.keyPoints}` : "No extra key points supplied.",
    ].join("\n\n");

    return { text: await runAi(system, user) };
  });

const researchInput = z.object({
  query: z.string().min(5).max(20000),
  mode: z.enum(["topic", "text", "url"]),
});

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }) => {
    const sourceNote =
      data.mode === "url"
        ? "The user supplied a URL. You cannot browse the web, so state clearly at the top that the analysis is based on your existing knowledge of this page/topic and not on live page content, then continue the analysis."
        : data.mode === "text"
          ? "The user pasted source content. Base the analysis on that content and mark any inference clearly as analysis."
          : "The user supplied a topic. Base the analysis on your general knowledge and flag areas of uncertainty.";

    const system = [
      "You are a rigorous research analyst.",
      sourceNote,
      "Respond in markdown with exactly these sections, in this order:",
      "## Summary",
      "## Key Insights",
      "## Important Points",
      "## Practical Recommendations",
      "## Confidence & Caveats",
      "Use short bullet points. Be specific to the user's input; never produce generic filler.",
      "Where a statement is your own inference rather than from the supplied source, prefix it with 'Analysis:'.",
    ].join("\n");

    const user = `Input type: ${data.mode}\n\nInput:\n${data.query}`;
    return { text: await runAi(system, user) };
  });

const plannerInput = z.object({
  tasks: z.string().min(3).max(6000),
  hoursPerDay: z.number().min(1).max(16),
  horizon: z.enum(["daily", "weekly"]),
  notes: z.string().max(2000).optional().default(""),
});

export const buildPlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }) => {
    const system = [
      "You are a pragmatic productivity planner.",
      `Build a realistic ${data.horizon} schedule from the user's task list.`,
      "Respect the stated available working hours per day; never schedule more than that.",
      "Respond in markdown with these sections:",
      "## Priority Order",
      "(ranked list with a one-line reason each, referencing deadlines and priorities given)",
      data.horizon === "daily" ? "## Today's Schedule" : "## Weekly Schedule",
      "(time-blocked plan using a table with columns Time | Task | Focus)",
      "## Risks & Adjustments",
      "Be concrete: use the user's exact task names and deadlines. No generic advice.",
    ].join("\n");

    const user = [
      `Planning horizon: ${data.horizon}`,
      `Available working hours per day: ${data.hoursPerDay}`,
      `Tasks, deadlines and priorities:\n${data.tasks}`,
      data.notes.trim() ? `Constraints / preferences:\n${data.notes}` : "No extra constraints.",
    ].join("\n\n");

    return { text: await runAi(system, user) };
  });

