"use client";
import * as React from "react";
import type { Analysis } from "@/lib/schema";
import type { Transcript } from "@/lib/transcripts";
import { Pill, cn, human } from "./ui";

export const TEMP_TONE = { hot: "red", warm: "orange", cold: "blue", not_a_lead: "gray" } as const;
export const URG_TONE = { high: "red", medium: "orange", low: "gray" } as const;

export function TempPill({ v }: { v: Analysis["lead_temperature"] }) {
  const dot = { hot: "bg-hot", warm: "bg-warm", cold: "bg-cool", not_a_lead: "bg-ink-3" }[v];
  return (
    <Pill tone={TEMP_TONE[v]}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {v === "not_a_lead" ? "Service" : human(v)}
    </Pill>
  );
}

export function UrgPill({ v }: { v: Analysis["urgency"] }) {
  return <Pill tone={URG_TONE[v]}>{human(v)} urgency</Pill>;
}

function highlight(text: string, quotes: string[]) {
  const qs = quotes.map((q) => q.trim().replace(/^["']|["']$/g, "")).filter((q) => q.length > 3);
  if (!qs.length) return text;
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const q of qs) {
    const i = lower.indexOf(q.toLowerCase());
    if (i >= 0) ranges.push([i, i + q.length]);
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const out: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach(([s, e], k) => {
    if (s > pos) out.push(text.slice(pos, s));
    out.push(<mark key={k} className="ev">{text.slice(s, e)}</mark>);
    pos = e;
  });
  out.push(text.slice(pos));
  return out;
}

export function Bubbles({ transcript, evidence }: { transcript: Transcript; evidence?: string[] }) {
  return (
    <ol className="space-y-1.5" aria-label="Conversation">
      {transcript.turns.map((t, i) => {
        const guest = t.speaker === "Guest";
        const prevSame = i > 0 && transcript.turns[i - 1].speaker === t.speaker;
        return (
          <li key={i} className={cn("flex flex-col", guest ? "items-start" : "items-end", !prevSame && i > 0 && "pt-2")}>
            {!prevSame && <span className="px-3 pb-0.5 text-[11.5px] text-ink-3">{guest ? "Guest" : "Agent"}</span>}
            <p
              className={cn(
                "max-w-[85%] rounded-[18px] px-3.5 py-2 text-[14.5px] leading-[1.38]",
                guest ? "bg-bubble text-ink rounded-bl-[6px]" : "bg-tint text-white rounded-br-[6px] [&_mark]:bg-[rgb(255_214_10/0.85)] [&_mark]:text-ink",
              )}
            >
              {evidence ? highlight(t.text, evidence) : t.text}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
