import { generateText, Output } from "ai";
import { AnalysisSchema, type Analysis } from "./schema";
import { MODEL_ID, SYSTEM_PROMPT, userPrompt } from "./prompt";
import { redact } from "./redact";

export type RunMeta = {
  model: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  redactions: Record<string, number>;
  ran_at: string;
};

export type RunResult = { analysis: Analysis; meta: RunMeta };

// List prices on Vercel AI Gateway, USD per million tokens (Nov 2026).
const PRICES: Record<string, [number, number]> = {
  "google/gemini-2.5-flash": [0.3, 2.5],
  "anthropic/claude-haiku-5.5": [0.1, 0.5],
};

export async function analyze(transcript: string, region?: string): Promise<RunResult> {
  const { text, found } = redact(transcript);
  const started = Date.now();
  const res = await generateText({
    model: MODEL_ID,
    system: SYSTEM_PROMPT,
    prompt: userPrompt(text, region),
    output: Output.object({ schema: AnalysisSchema }),
    temperature: 0,
    maxRetries: 1,
  });
  const latency = Date.now() - started;
  const inTok = res.usage.inputTokens ?? 0;
  const outTok = res.usage.outputTokens ?? 0;
  return {
    analysis: res.output as Analysis,
    meta: {
      model: MODEL_ID,
      latency_ms: latency,
      input_tokens: inTok,
      output_tokens: outTok,
      cost_usd: (inTok * (PRICES[MODEL_ID]?.[0] ?? 0) + outTok * (PRICES[MODEL_ID]?.[1] ?? 0)) / 1_000_000,
      redactions: found,
      ran_at: new Date().toISOString(),
    },
  };
}
