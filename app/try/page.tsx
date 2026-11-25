"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import type { RunResult } from "@/lib/analyze";
import { Readout } from "@/components/readout";
import { Button, Select } from "@/components/ui";

const EXAMPLES = [
  {
    name: "Hinglish WhatsApp",
    region: "Goa",
    text: `guest: hi bhaiya villa chahiye goa mein 31st night ke liye
guest: hum 6 log hai + 1 baby
agent: sure sir, north ya south?
guest: north. budget 40-45k tak chalega per nite
guest: pool zaroori hai aur party allowed ho
agent: party allowed till 10pm only sir, after that music low
guest: hmm thoda issue hai.. ok send options jaldi, friends ko kal tak confirm karna hai`,
  },
  {
    name: "Messy call, with personal data",
    region: "Lonavala",
    text: `Agent: lohono villas good evening
Guest: yeah hi I'm calling about booking LV-88213, my number is 98201 44567
Guest: we were supposed to check in saturday but the caretaker isnt picking up and nobody shared the location
Agent: sorry ma'am, let me
Guest: [inaudible] ... we're already on the expressway with my parents, they're senior citizens
Agent: I'll call the caretaker and send you the pin right now
Guest: please, and email me at priya.k@example.com the confirmation also`,
  },
];

export default function TryPage() {
  const [text, setText] = React.useState(EXAMPLES[0].text);
  const [region, setRegion] = React.useState<string>(EXAMPLES[0].region);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [res, setRes] = React.useState<RunResult | null>(null);
  const [runId, setRunId] = React.useState(0);

  async function run() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transcript: text, region: region === "unknown" ? undefined : region }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setRes(j); setRunId((n) => n + 1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The model call failed. Try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="large-title">Analyze a conversation</h1>
      <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
        Paste any call transcript or WhatsApp thread. Phone numbers, emails and booking IDs are stripped before the text reaches the model. Please use made-up data only.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {EXAMPLES.map((e) => (
              <Button key={e.name} variant="secondary" size="sm" onClick={() => { setText(e.text); setRegion(e.region); }}>{e.name}</Button>
            ))}
          </div>
          <label className="sr-only" htmlFor="tx">Transcript</label>
          <textarea
            id="tx"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full resize-y rounded-[16px] bg-surface p-4 font-mono text-[13px] leading-relaxed outline-none ring-1 ring-hairline focus:ring-2 focus:ring-tint/40"
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13.5px] text-ink-2">
              Region
              <Select label="Region" value={region} options={["Goa", "Lonavala", "Alibaug", "Coorg", "unknown"] as const} onChange={setRegion} />
            </label>
            <Button className="ml-auto" size="lg" onClick={run} disabled={busy || text.trim().length < 20}>
              {busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Reading conversation…" : "Analyze conversation"}
            </Button>
          </div>
          {err && <p className="mt-3 text-[13px] text-hot">{err}</p>}
        </div>
        <div>
          {res ? (
            <div key={runId} className="rise"><Readout id={`custom-${runId}`} result={res} /></div>
          ) : (
            <div className="grid h-full min-h-[280px] place-items-center rounded-[18px] border border-dashed border-hairline p-8 text-center">
              <div>
                <p className="text-[15px] font-semibold">The record appears here</p>
                <p className="mt-1 max-w-[36ch] text-[13.5px] text-ink-2">You&rsquo;ll get tags, a next step, an escalation check and the quotes behind them, usually in a few seconds.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
