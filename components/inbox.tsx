"use client";
import * as React from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { TRANSCRIPTS, firstGuestLine, toText } from "@/lib/transcripts";
import type { RunResult } from "@/lib/analyze";
import { Button, Segmented, cn } from "./ui";
import { useStore, effective, priority } from "./store";
import { TempPill, UrgPill, Bubbles } from "./bits";
import { Readout } from "./readout";

type Filter = "all" | "todo" | "done";

export function InboxView() {
  const { results, reviews, setResult } = useStore();
  const [sel, setSel] = React.useState<string>("T01");
  const [mobileDetail, setMobileDetail] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [showEv, setShowEv] = React.useState(true);

  React.useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && TRANSCRIPTS.some((x) => x.id === c)) { setSel(c); setMobileDetail(true); }
  }, []);

  const list = TRANSCRIPTS.filter((t) => {
    const done = reviews[t.id]?.status === "confirmed";
    return filter === "all" ? true : filter === "done" ? done : !done;
  });

  async function runOne(id: string) {
    const t = TRANSCRIPTS.find((x) => x.id === id)!;
    setBusy(id); setErr(null);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transcript: toText(t), region: t.region }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setResult(id, j as RunResult);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The model call failed.");
    } finally { setBusy(null); }
  }

  const t = TRANSCRIPTS.find((x) => x.id === sel)!;
  const res = results[sel];

  return (
    <div className="flex min-h-dvh">
      {/* List */}
      <div className={cn("w-full border-r border-hairline bg-canvas md:sticky md:top-0 md:block md:h-dvh md:w-[340px] md:shrink-0 md:overflow-y-auto", mobileDetail && "hidden")}>
        <div className="sticky top-0 z-10 border-b border-hairline bg-[rgb(245_245_247/0.92)] px-5 pt-6 pb-3 backdrop-blur-xl">
          <h1 className="large-title">Inbox</h1>
          <p className="mt-1 text-[13px] text-ink-2">Yesterday&rsquo;s conversations, read and tagged by the assistant. Confirm each one.</p>
          <div className="mt-3">
            <Segmented label="Filter" value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "todo", label: "To review" }, { value: "done", label: "Confirmed" }]} />
          </div>
        </div>
        <ul className="px-2 pb-8" aria-label="Conversations">
          {list.map((x) => {
            const r = results[x.id];
            const eff = r ? effective(r.analysis, reviews[x.id]) : null;
            const done = reviews[x.id]?.status === "confirmed";
            const active = x.id === sel;
            return (
              <li key={x.id}>
                <button
                  onClick={() => { setSel(x.id); setMobileDetail(true); }}
                  aria-current={active}
                  className={cn("w-full rounded-[12px] px-3 py-3 text-left transition", active ? "bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-hairline" : "hover:bg-fill-2")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold">{x.region}</span>
                    <span className="text-[12px] text-ink-3 tabular-nums">{x.id}</span>
                    <span className="ml-auto flex items-center gap-1">
                      {eff?.escalation_needed && <AlertTriangle className="size-4 text-hot" aria-label="Escalation" />}
                      {done && <CheckCircle2 className="size-4 text-ok" aria-label="Confirmed" />}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-ink-2">{r?.analysis.summary ?? firstGuestLine(x)}</p>
                  {eff && (
                    <div className="mt-2 flex gap-1.5">
                      <TempPill v={eff.lead_temperature} />
                      <UrgPill v={eff.urgency} />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="px-4 py-10 text-center text-[14px] text-ink-2">Nothing here. Switch the filter to see all conversations.</li>}
        </ul>
      </div>

      {/* Detail */}
      <div className={cn("min-w-0 flex-1", !mobileDetail && "hidden md:block")}>
        <div className="mx-auto max-w-[1100px] px-4 py-5 md:px-8 md:py-8">
          <button className="mb-3 flex items-center gap-0.5 text-[15px] text-tint md:hidden" onClick={() => setMobileDetail(false)}>
            <ChevronLeft className="size-5" />Inbox
          </button>
          <div key={sel} className="rise grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[13px] text-ink-2">{t.id}</div>
                  <h2 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.022em]">{t.region}</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowEv((s) => !s)} aria-pressed={showEv}>
                  {showEv ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{showEv ? "Hide evidence" : "Show evidence"}
                </Button>
              </div>
              <div className="rounded-[18px] bg-surface p-4">
                <Bubbles transcript={t} evidence={showEv ? res?.analysis.evidence.map((e) => e.quote) : undefined} />
              </div>
              {showEv && res && (
                <p className="mt-2 px-1 text-[12px] text-ink-3">Highlighted lines are the quotes the assistant used as evidence. If a field has no quote behind it, treat it as a guess.</p>
              )}
              <div className="mt-4 flex items-center gap-2 px-1">
                <Button variant="plain" size="sm" disabled={!!busy} onClick={() => runOne(sel)}>
                  {busy === sel ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                  {res ? "Re-run with the model" : "Analyze with the model"}
                </Button>
                {err && <span className="text-[12.5px] text-hot">{err}</span>}
              </div>
            </div>
            <div>
              {res ? (
                <Readout id={sel} result={res} />
              ) : (
                <div className="rounded-[18px] bg-surface p-8 text-center">
                  <p className="text-[15px] font-semibold">Not analyzed yet</p>
                  <p className="mt-1 text-[13.5px] text-ink-2">Run the assistant on this conversation to get tags, a next step and an escalation check.</p>
                  <Button className="mt-4" onClick={() => runOne(sel)} disabled={!!busy}>
                    {busy === sel && <Loader2 className="size-4 animate-spin" />}Analyze conversation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { priority };
