"use client";
import * as React from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { TRANSCRIPTS } from "@/lib/transcripts";
import { LABELS, EVAL_FIELDS, FIELD_NAMES } from "@/lib/labels";
import { scoreAll, type Verdict } from "@/lib/eval";
import type { RunResult } from "@/lib/analyze";
import { useStore } from "@/components/store";
import { Button, cn, human } from "@/components/ui";
import { MISS_NOTES, OTHER_FINDINGS } from "@/data/notes";

const DOT: Record<Verdict, string> = { match: "bg-ok", acceptable: "bg-warm", miss: "bg-hot" };
const fmtVal = (v: string) => (v === "null" ? "not stated" : v === "[]" ? "none" : v.split(",").map(human).join(", "));

const MEASURE: [string, string, string][] = [
  ["Intent, type, temperature", "Exact match against a reviewer label; temperature also scored against what happened (booked within 7 days or not).", "Two senior agents label a weekly sample of 200; disagreements go to the sales manager. Booking outcome from the CRM."],
  ["Urgency", "Exact match, plus a cost-weighted score: calling a high-urgency case low is penalised three times more than the reverse.", "Reviewer label; later, whether the guest complained or churned when we were slow."],
  ["Escalation flag", "Recall first (missed escalations are the expensive error), then precision. Target recall ≥ 95%.", "Every case a manager actually handled, plus every complaint, refund and review that followed a conversation."],
  ["Party, budget, dates", "Exact match on numbers; a null when the guest never said it counts as correct.", "Reviewer label, cross-checked against the eventual booking."],
  ["Objections", "Set match per type (precision and recall), since a conversation can have several.", "Reviewer label."],
  ["Next step", "Not string-matched. Graded on a 3-point rubric: specific, correct owner, respects the guest. Plus the agent edit rate in production.", "Rubric grading of a weekly sample; agent edits are logged as a free signal."],
];

export default function EvalPage() {
  const { results, setResult } = useStore();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const scored = Object.fromEntries(TRANSCRIPTS.filter((t) => results[t.id]).map((t) => [t.id, results[t.id].analysis]));
  const n = Object.keys(scored).length;
  const s = scoreAll(scored);
  const metas = TRANSCRIPTS.map((t) => results[t.id]?.meta).filter(Boolean) as RunResult["meta"][];
  const lat = metas.map((m) => m.latency_ms).sort((a, b) => a - b);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const avgCost = avg(metas.map((m) => m.cost_usd));
  const p95 = lat.length ? lat[Math.min(lat.length - 1, Math.ceil(lat.length * 0.95) - 1)] : 0;
  const monthly = avgCost * 500 * 30;

  async function rerun() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/batch");
      const j = await r.json();
      Object.entries(j.results as Record<string, RunResult>).forEach(([id, v]) => setResult(id, v));
      if (Object.keys(j.errors).length) setErr(`${Object.keys(j.errors).length} conversation(s) failed: ${Object.values(j.errors)[0]}`);
    } catch {
      setErr("The batch run failed. Check the AI Gateway connection.");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="large-title">Evaluation</h1>
          <p className="mt-1 max-w-[64ch] text-[14px] text-ink-2">
            The model&rsquo;s output on the 10 sample conversations, scored against labels written by hand before any model output was seen. {n < 10 && `${n} of 10 analyzed so far.`}
          </p>
        </div>
        <Button variant="secondary" onClick={rerun} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Re-run all 10 and re-score
        </Button>
      </div>
      {err && <p className="mt-2 text-[13px] text-hot">{err}</p>}

      {n > 0 && (
        <>
          <section className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[18px] bg-surface p-6">
              <div className="font-[family-name:var(--font-display)] text-[56px] font-semibold leading-none tracking-[-0.035em] tabular-nums">
                {Math.round((s.strict / s.total) * 100)}%
              </div>
              <p className="mt-2 text-[14px] text-ink-2">
                of {s.total} field values match my label exactly. <span className="text-ink">{Math.round((s.lenient / s.total) * 100)}%</span> once answers a second reviewer could defend are accepted.
              </p>
              <div className="mt-5 space-y-1.5 text-[13px] text-ink-2">
                <Legend c="bg-ok" t="Matches my label" />
                <Legend c="bg-warm" t="Different, but defensible" />
                <Legend c="bg-hot" t="Wrong" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-[18px] bg-surface p-4">
              <table className="w-full min-w-[640px] text-[12.5px]">
                <caption className="sr-only">Per-field result for each conversation</caption>
                <thead>
                  <tr>
                    <th className="w-[150px] pb-2 text-left font-medium text-ink-2">Field</th>
                    {s.rows.map((r) => (
                      <th key={r.id} className="pb-2 font-medium text-ink-2 tabular-nums"><Link className="hover:text-tint" href={`/?c=${r.id}`}>{r.id}</Link></th>
                    ))}
                    <th className="pb-2 text-right font-medium text-ink-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {EVAL_FIELDS.map((f, i) => {
                    const bf = s.byField[i];
                    return (
                      <tr key={f} className="border-t border-hairline">
                        <td className="py-2 pr-2">{FIELD_NAMES[f]}</td>
                        {s.rows.map((r) => {
                          const c = r.fields.find((x) => x.field === f)!;
                          return (
                            <td key={r.id} className="py-2 text-center">
                              <span title={`${r.id} ${FIELD_NAMES[f]}: expected ${fmtVal(c.expected)}, got ${fmtVal(c.got)}`} className={cn("inline-block size-3 rounded-full", DOT[c.verdict])} />
                              <span className="sr-only">{c.verdict}</span>
                            </td>
                          );
                        })}
                        <td className="py-2 text-right tabular-nums">{bf.strict}/{bf.n}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">Where the model was wrong</h2>
            <p className="mt-0.5 text-[14px] text-ink-2">Every red dot above, with what I expected and what came back.</p>
            {s.misses.length === 0 ? (
              <p className="mt-4 rounded-[14px] bg-surface p-5 text-[14px]">No outright misses on this run. Ten samples is too few to read much into that; see the plan below.</p>
            ) : (
              <ul className="mt-4 overflow-hidden rounded-[16px] bg-surface divide-y divide-hairline">
                {s.misses.map((m) => (
                  <li key={m.id + m.field} className="grid gap-x-4 gap-y-1 px-5 py-3.5 md:grid-cols-[120px_220px_minmax(0,1fr)]">
                    <div className="text-[14px] font-semibold">{m.id} <span className="font-normal text-ink-2">{TRANSCRIPTS.find((t) => t.id === m.id)?.region}</span></div>
                    <div className="text-[13.5px]">
                      <div className="text-ink-2">{FIELD_NAMES[m.field]}</div>
                      <div>Expected <b className="font-semibold">{fmtVal(m.expected)}</b>, got <b className="font-semibold text-hot">{fmtVal(m.got)}</b></div>
                    </div>
                    <p className="text-[13.5px] leading-snug text-ink-2">{MISS_NOTES[`${m.id}:${m.field}`] ?? LABELS[m.id].note ?? ""}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">What the scores don&rsquo;t show</h2>
            <p className="mt-0.5 text-[14px] text-ink-2">Found by reading every output in full, not by the field comparison.</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {OTHER_FINDINGS.map((f) => (
                <li key={f.title} className="rounded-[14px] bg-surface px-4 py-3 text-[14px] leading-snug"><b className="font-semibold">{f.title}.</b> <span className="text-ink-2">{f.body}</span></li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">Next step, side by side</h2>
            <p className="mt-0.5 text-[14px] text-ink-2">Free text can&rsquo;t be string-matched, so it&rsquo;s graded by a person against a rubric.</p>
            <div className="mt-4 overflow-hidden rounded-[16px] bg-surface divide-y divide-hairline">
              {s.rows.map((r) => (
                <div key={r.id} className="grid gap-x-6 gap-y-1 px-5 py-3.5 text-[13.5px] leading-snug md:grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="font-semibold">{r.id}</div>
                  <div><span className="text-ink-3">Mine </span>{LABELS[r.id].next_action}</div>
                  <div><span className="text-ink-3">Model </span>{results[r.id].analysis.next_best_action.action}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">Cost and latency</h2>
              <p className="mt-0.5 text-[14px] text-ink-2">Measured on this run, not estimated.</p>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-hairline">
                <Stat k="Cost per conversation" v={`$${avgCost.toFixed(5)}`} sub={`≈ ₹${(avgCost * 88).toFixed(2)} at ₹88 to the dollar`} />
                <Stat k="At 500 conversations a day" v={`$${monthly.toFixed(2)}`} sub="per month" />
                <Stat k="Median latency" v={`${(lat[Math.floor(lat.length / 2)] / 1000).toFixed(1)} s`} sub="one model call" />
                <Stat k="p95 latency" v={`${(p95 / 1000).toFixed(1)} s`} sub={`avg ${Math.round(avg(metas.map((m) => m.input_tokens)))} in / ${Math.round(avg(metas.map((m) => m.output_tokens)))} out tokens`} />
              </dl>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
                Under half a US cent per conversation is already negligible next to an agent&rsquo;s time. Most of it is output: Gemini 2.5 Flash spends over a thousand tokens thinking before it writes the record. Cheapest lever: send the after-call queue through the batch endpoint at half price, since nobody waits on a post-call record in real time. Next: cap the thinking budget, which should also cut latency, and only keep the change if the labelled set says accuracy holds.
              </p>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">What I&rsquo;d watch after launch</h2>
              <ul className="mt-4 space-y-2 text-[14px] leading-snug">
                {[
                  ["Agent edit rate per field", "A rising rate means drift. Below 5% suggests agents are rubber-stamping."],
                  ["Escalation recall", "Weekly: every complaint, refund or bad review is checked against whether we flagged it."],
                  ["Hot-lead follow-up time", "The outcome the product exists for. Split by region and agent."],
                  ["Accuracy by language and channel", "Hinglish and noisy call audio sliced separately, so bias shows up rather than averaging out."],
                  ["Schema failures and nulls", "Spikes in invalid output or “not stated” often mean the transcription pipeline broke upstream."],
                  ["Cost, latency, PII", "Token use per call, p95 latency, and a daily scan of logs for anything that slipped past redaction."],
                ].map(([a, b]) => (
                  <li key={a} className="rounded-[12px] bg-surface px-4 py-3"><b className="font-semibold">{a}.</b> <span className="text-ink-2">{b}</span></li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">How each field would be measured</h2>
        <div className="mt-4 overflow-x-auto rounded-[16px] bg-surface">
          <table className="w-full min-w-[720px] text-left text-[13.5px] leading-snug">
            <thead className="text-ink-2"><tr><th className="px-5 py-3 font-medium">Field</th><th className="px-5 py-3 font-medium">Metric</th><th className="px-5 py-3 font-medium">Ground truth</th></tr></thead>
            <tbody>
              {MEASURE.map(([a, b, c]) => (
                <tr key={a} className="border-t border-hairline align-top"><td className="px-5 py-3 font-medium">{a}</td><td className="px-5 py-3 text-ink-2">{b}</td><td className="px-5 py-3 text-ink-2">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 px-1 text-[12.5px] text-ink-3">Ten conversations show where the prompt breaks; they can&rsquo;t prove it works. The pilot gate is a labelled set of 300+ real (redacted) conversations, sliced by region, language and channel.</p>
      </section>
    </div>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return <div className="flex items-center gap-2"><span className={cn("size-2.5 rounded-full", c)} />{t}</div>;
}
function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-[13px] text-ink-2">{k}</dt>
      <dd className="font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.02em] tabular-nums">{v}</dd>
      <p className="text-[12px] text-ink-3">{sub}</p>
    </div>
  );
}
