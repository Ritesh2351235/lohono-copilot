"use client";
import * as React from "react";
import snapshot from "@/data/snapshot.json";
import type { RunResult } from "@/lib/analyze";
import type { Analysis } from "@/lib/schema";

export type EditKey = "intent" | "lead_temperature" | "urgency" | "escalation_needed" | "escalation_to" | "owner" | "action";
export type Review = { edits: Partial<Record<EditKey, string>>; status: "pending" | "confirmed"; at?: string };

type Ctx = {
  results: Record<string, RunResult>;
  setResult: (id: string, r: RunResult) => void;
  reviews: Record<string, Review>;
  edit: (id: string, k: EditKey, v: string, original: string) => void;
  confirm: (id: string) => void;
  reopen: (id: string) => void;
  resetAll: () => void;
};

const StoreCtx = React.createContext<Ctx | null>(null);
const KEY = "lohono-copilot-reviews-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = React.useState<Record<string, RunResult>>(snapshot as unknown as Record<string, RunResult>);
  const [reviews, setReviews] = React.useState<Record<string, Review>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setReviews(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Record<string, Review>) => {
    setReviews(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const value: Ctx = {
    results,
    setResult: (id, r) => setResults((s) => ({ ...s, [id]: r })),
    reviews,
    edit: (id, k, v, original) => {
      const cur = reviews[id] ?? { edits: {}, status: "pending" };
      const edits = { ...cur.edits };
      if (v === original) delete edits[k];
      else edits[k] = v;
      persist({ ...reviews, [id]: { ...cur, edits, status: "pending" } });
    },
    confirm: (id) => persist({ ...reviews, [id]: { edits: reviews[id]?.edits ?? {}, status: "confirmed", at: new Date().toISOString() } }),
    reopen: (id) => persist({ ...reviews, [id]: { edits: reviews[id]?.edits ?? {}, status: "pending" } }),
    resetAll: () => persist({}),
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = React.useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

// The record after the agent's edits are applied. This is what the manager sees.
export function effective(a: Analysis, r?: Review) {
  const e = r?.edits ?? {};
  return {
    intent: (e.intent ?? a.intent) as Analysis["intent"],
    lead_temperature: (e.lead_temperature ?? a.lead_temperature) as Analysis["lead_temperature"],
    urgency: (e.urgency ?? a.urgency) as Analysis["urgency"],
    escalation_needed: e.escalation_needed ? e.escalation_needed === "true" : a.escalation.needed,
    escalation_to: (e.escalation_to ?? a.escalation.to) as Analysis["escalation"]["to"],
    owner: (e.owner ?? a.next_best_action.owner) as Analysis["next_best_action"]["owner"],
    action: e.action ?? a.next_best_action.action,
  };
}

export function priority(x: ReturnType<typeof effective>) {
  const u = { high: 3, medium: 2, low: 1 }[x.urgency];
  const t = { hot: 2, warm: 1, cold: 0, not_a_lead: 0 }[x.lead_temperature];
  return (x.escalation_needed ? 4 : 0) + u + t;
}
