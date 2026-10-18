import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM = `You are a patient, expert ICSE Class 10 Mathematics teacher (CISCE syllabus) at Sri Ramakrishna Sharadadevi Vidyamandira.
Explain in clear, simple English for a 15-year-old. Use Markdown and LaTeX ($...$ inline, $$...$$ display).
Follow ICSE board conventions and units; show every step an examiner would award marks for.
Structure your answer with these headings:
## Concept & formula
## Given / To find
## Step-by-step solution  (numbered steps, one idea per step, with a short reason for each)
## Final answer  (boxed with \\boxed{})
## Examiner tips  (common mistakes and how marks are lost)
If the student gives their own attempt, first add "## Checking your attempt": quote the first incorrect line, explain exactly what went wrong, and praise correct steps. Never call the student careless or lazy.
In "hint" mode, give only the concept and the first step plus a guiding question — do NOT reveal the final answer.
If the question is not mathematics, politely ask for a maths problem. If the problem is ambiguous, state your assumption.`;

export const Route = createFileRoute("/api/math-explain")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Please sign in.", { status: 401 });
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const sb = createClient(url, key, { auth: { persistSession: false } });
        const { data: u } = await sb.auth.getUser(token);
        if (!u.user) return new Response("Please sign in.", { status: 401 });

        const body = (await request.json().catch(() => null)) as
          | { problem?: string; attempt?: string; chapter?: string; mode?: string }
          | null;
        const problem = body?.problem?.trim().slice(0, 4000);
        if (!problem) return new Response("Please type a problem.", { status: 400 });
        const attempt = body?.attempt?.trim().slice(0, 4000);
        const mode = body?.mode === "hint" ? "hint" : body?.mode === "check" ? "check" : "full";

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured.", { status: 500 });
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const prompt = [
          `Mode: ${mode}`,
          body?.chapter ? `Chapter: ${body.chapter}` : "",
          `Problem:\n${problem}`,
          attempt ? `Student's attempt:\n${attempt}` : "",
        ].filter(Boolean).join("\n\n");

        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: SYSTEM,
          prompt,
          abortSignal: request.signal,
          maxRetries: 0,
          providerOptions: {
            openai: {
              store: false,
              forceReasoning: true,
              reasoningEffort: "medium",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            },
          },
        });
        return result.toTextStreamResponse();
      },
    },
  },
});
