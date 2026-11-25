"use client";
import * as React from "react";
import { AlertTriangle, Check, Pencil, RotateCcw, ShieldCheck, CircleHelp } from "lucide-react";
import type { RunResult } from "@/lib/analyze";
import { INTENTS, OWNERS, TEMPERATURES, URGENCY, type Analysis } from "@/lib/schema";
import { Button, Group, Pill, Row, Select, cn, human, inr } from "./ui";
import { useStore, effective, type EditKey } from "./store";

const ESC_TO = ["manager", "ops", "payments", "none"] as const;

export function Readout({ id, result }: { id: string; result: RunResult }) {
  const { reviews, edit, confirm, reopen } = useStore();
  const a = result.analysis;
  const review = reviews[id];
  const eff = effective(a, review);
  const edits = review?.edits ?? {};
  const confirmed = review?.status === "confirmed";
  const nEdits = Object.keys(edits).length;
  const [editingAction, setEditingAction] = React.useState(false);
  const [draft, setDraft] = React.useState(eff.action);
  React.useEffect(() => setDraft(eff.action), [eff.action, id]);

  const set = (k: EditKey, v: string, orig: string) => edit(id, k, v, orig);
  const urgencyBar = { high: "bg-hot", medium: "bg-warm", low: "bg-ink-3" }[eff.urgency];

  const dates = [a.stay.check_in, a.stay.check_out].filter(Boolean).join(" – ");
  const party = [
    a.party.adults != null && `${a.party.adults} adults`,
    a.party.children != null && `${a.party.children} children`,
    a.party.total != null && a.party.adults == null && `${a.party.total} guests`,
  ].filter(Boolean).join(", ");

  return (
    <div className="space-y-5">
      {/* Next step: the one thing the agent must do */}
      <section aria-labelledby={`nba-${id}`} className="relative overflow-hidden rounded-[18px] bg-surface p-5 pl-6">
        <span className={cn("absolute inset-y-0 left-0 w-[5px]", urgencyBar)} aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`nba-${id}`} className="text-[13px] font-medium text-ink-2">
            Next step · respond {a.respond_within}
          </h2>
          {!editingAction ? (
            <Button variant="plain" size="sm" onClick={() => setEditingAction(true)}><Pencil className="size-3.5" />Edit</Button>
          ) : null}
        </div>
        {editingAction ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              aria-label="Next step"
              className="w-full resize-none rounded-[10px] bg-fill-2 p-3 text-[17px] leading-snug outline-none focus:bg-fill"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => { set("action", draft.trim(), a.next_best_action.action); setEditingAction(false); }}>Save step</Button>
              <Button size="sm" variant="secondary" onClick={() => { setDraft(eff.action); setEditingAction(false); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-[21px] font-semibold leading-[1.25] tracking-[-0.02em] text-balance">
            {eff.action}
            {edits.action && <span className="ml-2 align-middle rounded-full bg-tint-soft px-1.5 text-[10.5px] font-semibold text-tint">Edited</span>}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-2">
          <label className="flex items-center gap-1.5">
            Owner
            <Select label="Owner" value={eff.owner} options={OWNERS} onChange={(v) => set("owner", v, a.next_best_action.owner)} />
          </label>
          <span>Due {a.next_best_action.due}</span>
        </div>
        {a.urgency_reason && !["null", "none"].includes(a.urgency_reason.trim().toLowerCase()) && <p className="mt-2 text-[12.5px] text-ink-3">{a.urgency_reason}</p>}
      </section>

      {/* Escalation */}
      <section
        className={cn(
          "flex flex-wrap items-start gap-3 rounded-[14px] px-4 py-3",
          eff.escalation_needed ? "bg-[rgb(255_59_48/0.08)]" : "bg-surface",
        )}
      >
        {eff.escalation_needed ? <AlertTriangle className="mt-0.5 size-[18px] text-hot" /> : <ShieldCheck className="mt-0.5 size-[18px] text-ok" />}
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold">{eff.escalation_needed ? `Escalate to ${human(eff.escalation_to === "none" ? "manager" : eff.escalation_to)}` : "No escalation needed"}</div>
          {a.escalation.reason && eff.escalation_needed && <p className="text-[13px] text-ink-2">{a.escalation.reason}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Select
            label="Escalation"
            value={eff.escalation_needed ? "true" : "false"}
            options={["true", "false"] as const}
            onChange={(v) => set("escalation_needed", v, String(a.escalation.needed))}
            className="w-[86px]"
          />
          {eff.escalation_needed && (
            <Select label="Escalate to" value={eff.escalation_to} options={ESC_TO} onChange={(v) => set("escalation_to", v, a.escalation.to)} />
          )}
        </div>
      </section>

      <p className="px-1 text-[13px] leading-relaxed text-ink-2">{a.summary}</p>

      <Group title="Lead">
        <Row label="Intent" edited={!!edits.intent}>
          <Select label="Intent" value={eff.intent} options={INTENTS} onChange={(v) => set("intent", v, a.intent)} />
        </Row>
        <Row label="Temperature" edited={!!edits.lead_temperature}>
          <Select label="Temperature" value={eff.lead_temperature} options={TEMPERATURES} onChange={(v) => set("lead_temperature", v, a.lead_temperature)} />
        </Row>
        <Row label="Urgency" edited={!!edits.urgency}>
          <Select label="Urgency" value={eff.urgency} options={URGENCY} onChange={(v) => set("urgency", v, a.urgency)} />
        </Row>
        <Row label="Type">{human(a.conversation_type)}</Row>
        <Row label="Sentiment">{human(a.sentiment)}</Row>
      </Group>

      <Group title="Trip">
        <Row label="Where">{a.region}{a.sub_location && a.sub_location !== a.region ? `, ${a.sub_location}` : ""}</Row>
        <Row label="When" hint={a.stay.nights ? `${a.stay.nights} nights` : undefined}>{dates || a.stay.timing_text || <Missing />}</Row>
        <Row label="Party" hint={[a.party.pets && `Pets: ${a.party.pets}`, a.party.occasion].filter(Boolean).join(" · ") || undefined}>
          {party || (a.party.total != null ? `${a.party.total} guests` : <Missing />)}
        </Row>
        <Row
          label="Budget"
          hint={a.budget.quoted_per_night_inr ? `Agent quoted ${inr(a.budget.quoted_per_night_inr)} a night` : undefined}
        >
          {a.budget.per_night_inr ? <>{inr(a.budget.per_night_inr)} a night <span className="text-ink-3">({human(a.budget.flexibility).toLowerCase()})</span></> : a.budget.flexibility === "flexible" ? "Flexible, no figure given" : <Missing />}
        </Row>
        {a.requirements.length > 0 && (
          <Row label="Needs">
            <div className="flex flex-wrap gap-1.5">{a.requirements.map((r) => <Pill key={r}>{r}</Pill>)}</div>
          </Row>
        )}
      </Group>

      <Group title="Objections">
        {a.objections.length === 0 ? (
          <Row label="None">No objections raised</Row>
        ) : (
          a.objections.map((o, i) => (
            <Row key={i} label={human(o.type)}>
              <span className="flex items-start gap-2">
                <span className="flex-1">{o.detail}</span>
                {o.resolved ? <Pill tone="green">Resolved</Pill> : <Pill tone="orange">Open</Pill>}
              </span>
            </Row>
          ))
        )}
      </Group>

      {(a.missing_info.length > 0 || a.risk_flags.length > 0) && (
        <Group title="Before you reply">
          {a.missing_info.length > 0 && (
            <Row label="Ask about">
              <ul className="space-y-0.5">{a.missing_info.map((m) => <li key={m} className="flex gap-1.5"><CircleHelp className="mt-[3px] size-3.5 shrink-0 text-ink-3" />{m}</li>)}</ul>
            </Row>
          )}
          {a.risk_flags.length > 0 && (
            <Row label="Flags">
              <div className="flex flex-wrap gap-1.5">{a.risk_flags.map((r) => <Pill key={r} tone={r.includes("threat") || r.includes("money") ? "red" : "sea"}>{human(r)}</Pill>)}</div>
            </Row>
          )}
        </Group>
      )}

      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-[16px] bg-[rgb(250_250_252/0.94)] backdrop-blur-xl px-4 py-3 shadow-[0_8px_30px_rgb(0_0_0/0.08)] ring-1 ring-hairline">
        <div className="min-w-0 flex-1 text-[13px] text-ink-2">
          {confirmed ? (
            <span className="text-[#1d7a36]">Confirmed{nEdits ? ` with ${nEdits} edit${nEdits > 1 ? "s" : ""}` : " as suggested"}. Your manager now sees this record.</span>
          ) : nEdits ? `${nEdits} field${nEdits > 1 ? "s" : ""} edited. Edits are logged as training signal.` : "Check the suggestion, edit anything wrong, then confirm."}
        </div>
        {confirmed ? (
          <Button variant="secondary" size="sm" onClick={() => reopen(id)}><RotateCcw className="size-3.5" />Reopen</Button>
        ) : (
          <Button size="md" onClick={() => confirm(id)}><Check className="size-4" />Confirm record</Button>
        )}
      </div>

      <Meta result={result} />
    </div>
  );
}

function Missing() {
  return <span className="text-ink-3">Not stated</span>;
}

export function Meta({ result }: { result: RunResult }) {
  const { meta, analysis: a } = result;
  const red = Object.entries(meta.redactions);
  return (
    <p className="px-1 text-[11.5px] leading-relaxed text-ink-3">
      {meta.model.split("/").pop()} · {(meta.latency_ms / 1000).toFixed(1)} s · {meta.input_tokens.toLocaleString()} in / {meta.output_tokens.toLocaleString()} out tokens · ${meta.cost_usd.toFixed(5)}
      {" · "}confidence: intent {a.confidence.intent}, urgency {a.confidence.urgency}, budget {a.confidence.budget}, party {a.confidence.party}
      {red.length > 0 && <> · redacted before sending: {red.map(([k, n]) => `${n} ${k.toLowerCase().replace("_", " ")}`).join(", ")}</>}
    </p>
  );
}
