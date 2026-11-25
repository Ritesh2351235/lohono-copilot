import { analyze, type RunResult } from "@/lib/analyze";
import { TRANSCRIPTS, toText } from "@/lib/transcripts";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Runs all 10 sample transcripts through the model in parallel.
export async function GET() {
  const settled = await Promise.allSettled(TRANSCRIPTS.map((t) => analyze(toText(t), t.region)));
  const results: Record<string, RunResult> = {};
  const errors: Record<string, string> = {};
  settled.forEach((s, i) => {
    const id = TRANSCRIPTS[i].id;
    if (s.status === "fulfilled") results[id] = s.value;
    else errors[id] = String(s.reason?.message ?? s.reason);
  });
  return Response.json({ results, errors });
}
