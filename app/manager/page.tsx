"use client";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { TRANSCRIPTS } from "@/lib/transcripts";
import { useStore, effective, priority } from "@/components/store";
import { TempPill, UrgPill } from "@/components/bits";
import { human, cn } from "@/components/ui";

export default function Manager() {
  const { results, reviews } = useStore();
  const rows = TRANSCRIPTS.filter((t) => results[t.id])
    .map((t) => {
      const r = results[t.id];
      const eff = effective(r.analysis, reviews[t.id]);
      return { t, r, eff, p: priority(eff), review: reviews[t.id] };
    })
    .sort((a, b) => b.p - a.p);

  const esc = rows.filter((x) => x.eff.escalation_needed);
  const hot = rows.filter((x) => x.eff.lead_temperature === "hot");
  const confirmed = rows.filter((x) => x.review?.status === "confirmed");
  const edited = confirmed.filter((x) => Object.keys(x.review?.edits ?? {}).length > 0);

  const stats = [
    { n: esc.length, label: "need a manager or another team", tone: "text-hot" },
    { n: hot.length, label: "hot leads to act on today", tone: "text-ink" },
    { n: `${confirmed.length}/${rows.length}`, label: "confirmed by agents", tone: "text-ink" },
    { n: confirmed.length ? `${Math.round((edited.length / confirmed.length) * 100)}%` : "—", label: "of confirmed records were edited", tone: "text-ink" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="large-title">Manager queue</h1>
      <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
        Every conversation from the last shift, ranked by what costs money if it waits: escalations first, then urgency, then how close the guest is to booking.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-hairline md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-5 py-4">
            <dt className="sr-only">{s.label}</dt>
            <dd className={cn("font-[family-name:var(--font-display)] text-[30px] font-semibold tracking-[-0.02em] tabular-nums", s.tone)}>{s.n}</dd>
            <p className="text-[13px] leading-snug text-ink-2">{s.label}</p>
          </div>
        ))}
      </dl>

      <ol className="mt-8 overflow-hidden rounded-[16px] bg-surface divide-y divide-hairline">
        {rows.map(({ t, r, eff, review }, i) => (
          <li key={t.id}>
            <Link href={`/?c=${t.id}`} className="grid gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-fill-2 md:grid-cols-[28px_150px_minmax(0,1fr)_120px]">
              <span className="hidden pt-0.5 text-[13px] tabular-nums text-ink-3 md:block">{i + 1}</span>
              <div>
                <div className="flex items-center gap-1.5 text-[14.5px] font-semibold">
                  {eff.escalation_needed && <AlertTriangle className="size-4 text-hot" aria-label="Escalation" />}
                  {t.region}<span className="text-[12px] font-normal text-ink-3">{t.id}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1"><TempPill v={eff.lead_temperature} /><UrgPill v={eff.urgency} /></div>
              </div>
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium leading-snug">{eff.action}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-2">
                  {eff.escalation_needed ? <span className="font-medium text-hot">Escalated to {human(eff.escalation_to === "none" ? "manager" : eff.escalation_to)}. </span> : null}
                  {r.analysis.summary}
                </p>
              </div>
              <div className="flex items-start gap-1.5 text-[13px] text-ink-2 md:flex-col md:items-end md:text-right">
                <span>{human(eff.owner)}, respond {r.analysis.respond_within}</span>
                <span className="flex items-center gap-1">
                  {review?.status === "confirmed" ? <><CheckCircle2 className="size-3.5 text-ok" />Agent confirmed</> : <><Circle className="size-3.5" />Awaiting agent</>}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 px-1 text-[12px] text-ink-3">Records show the agent&rsquo;s edits once made. Unconfirmed records show the assistant&rsquo;s suggestion and are marked as awaiting agent.</p>
    </div>
  );
}
