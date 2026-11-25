import type { Analysis } from "./schema";
import { EVAL_FIELDS, LABELS, type EvalField } from "./labels";

export type Verdict = "match" | "acceptable" | "miss";
export type FieldResult = { field: EvalField; expected: string; got: string; verdict: Verdict };

const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return v.length ? [...v].sort().join(",") : "[]";
  return String(v);
};

export function pick(a: Analysis, f: EvalField): string {
  switch (f) {
    case "escalation_needed": return fmt(a.escalation.needed);
    case "escalation_to": return fmt(a.escalation.to);
    case "party_total": return fmt(a.party.total);
    case "budget_per_night_inr": return fmt(a.budget.per_night_inr);
    case "objection_types": return fmt([...new Set(a.objections.map((o) => o.type))]);
    case "owner": return fmt(a.next_best_action.owner);
    default: return fmt(a[f]);
  }
}

export function scoreOne(id: string, a: Analysis): FieldResult[] {
  const label = LABELS[id];
  return EVAL_FIELDS.map((field) => {
    const expected = fmt(label[field]);
    const got = pick(a, field);
    const alt = label.accept?.[field] ?? [];
    const verdict: Verdict = got === expected ? "match" : alt.includes(got) ? "acceptable" : "miss";
    return { field, expected, got, verdict };
  });
}

export function scoreAll(results: Record<string, Analysis>) {
  const rows = Object.entries(results).map(([id, a]) => ({ id, fields: scoreOne(id, a) }));
  const byField = EVAL_FIELDS.map((field) => {
    const cells = rows.map((r) => r.fields.find((f) => f.field === field)!);
    const strict = cells.filter((c) => c.verdict === "match").length;
    const lenient = cells.filter((c) => c.verdict !== "match" ? c.verdict === "acceptable" : true).length;
    return { field, strict, lenient, n: cells.length };
  });
  const total = rows.length * EVAL_FIELDS.length;
  const strict = byField.reduce((s, f) => s + f.strict, 0);
  const lenient = byField.reduce((s, f) => s + f.lenient, 0);
  const misses = rows.flatMap((r) => r.fields.filter((f) => f.verdict === "miss").map((f) => ({ id: r.id, ...f })));
  return { rows, byField, strict, lenient, total, misses };
}
