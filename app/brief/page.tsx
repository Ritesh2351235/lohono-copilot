import { AI_USE } from "@/data/notes";

export const metadata = { title: "Product brief — Lohono Copilot" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 mb-3 font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.015em]">{children}</h2>;
}
function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-[14px] bg-surface">
      <table className="w-full min-w-[560px] text-left text-[14px] leading-snug">
        <thead className="text-ink-2"><tr>{head.map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-hairline align-top">{r.map((c, i) => <td key={i} className={i === 0 ? "px-4 py-2.5 font-medium" : "px-4 py-2.5 text-ink-2"}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function Brief() {
  return (
    <article className="mx-auto max-w-[760px] px-5 py-6 text-[16px] leading-[1.6] md:px-8 md:py-10 [&_p]:my-3 [&_li]:my-1.5">
      <h1 className="large-title">Lohono Copilot</h1>
      <p className="!mt-2 text-[19px] leading-snug text-ink-2 text-pretty">
        An assistant that reads every sales and support conversation the moment it ends, tags the lead, proposes the next step and raises escalations, so hot leads get a reply in minutes instead of hours.
      </p>

      <H>The problem</H>
      <p>
        Lohono agents handle several hundred calls and WhatsApp threads a day across Goa, Lonavala, Alibaug and Coorg. After each one, the agent recalls it, tags the lead in the CRM and decides the follow-up by hand. Tags differ from agent to agent, managers can&rsquo;t see which conversations are urgent, and hot leads wait. In peak season a guest comparing three villas books with whoever replies first.
      </p>
      <Table
        head={["Assumed baseline", "Value", "Basis"]}
        rows={[
          ["Conversations per day", "~500", "“Several hundred” in the brief, peak-season weighted"],
          ["After-call work per conversation", "~3 min", "Read back, tag, write a note; to be measured in week 0"],
          ["Median time to follow up a hot lead", "~4 hours", "Assumption; will be measured from CRM timestamps"],
          ["Agreement between agents on lead tag", "~60%", "Assumption; measured by double-labelling 100 conversations"],
        ]}
      />

      <H>Users and their jobs</H>
      <Table
        head={["User", "Job to be done", "What they get"]}
        rows={[
          ["Sales or support agent", "Finish one conversation and move to the next without dropping anything.", "A pre-filled record and one clear next step to confirm in under 30 seconds."],
          ["Shift manager", "Know which of today’s conversations will cost money if they wait.", "A queue ranked by escalation, urgency and lead heat; every escalation with a reason."],
          ["Head of sales (secondary)", "Understand why leads are lost.", "Clean, consistent objection and intent data across agents."],
        ]}
      />

      <H>Scope for v1</H>
      <p><b className="font-semibold">In:</b> after-conversation analysis of text transcripts (call transcripts from the existing speech-to-text, and WhatsApp threads) in English and Hinglish. Output a structured record with the fields below, a next step, an escalation flag with a reason, and the quotes it relied on. Agent confirms or edits; the manager sees a ranked queue.</p>
      <p><b className="font-semibold">Out:</b> sending anything to guests, changing bookings, deciding refunds or compensation, pricing, scoring agents, and speech-to-text itself. A live in-call version (suggestions while the guest is still on the line) is v2, once v1 accuracy is proven, because a wrong live prompt is spoken to the guest before anyone can check it.</p>

      <H>What it produces</H>
      <Table
        head={["Field", "Values", "Used by"]}
        rows={[
          ["Intent and conversation type", "Ready to book, comparing, browsing, change or cancel, service complaint, payment problem", "Routing, reporting"],
          ["Lead temperature", "Hot, warm, cold, or not a lead (service matter)", "Agent follow-up order"],
          ["Urgency and respond-by", "High, medium, low with a concrete deadline and reason", "Manager queue"],
          ["Trip details", "Region, dates, nights, party size, pets, occasion, budget (kept separate from prices the agent quoted)", "CRM, villa matching"],
          ["Objections", "Price, policy, competition, availability, service quality, timing; open or resolved", "Win-back, sales insight"],
          ["Next step", "One instruction with an owner (agent, manager, ops, payments) and a due time", "Agent"],
          ["Escalation", "Yes or no, to whom, and why", "Manager"],
          ["Evidence and confidence", "Quotes from the transcript; confidence on the key fields", "Agent verification"],
        ]}
      />

      <H>Success metrics</H>
      <Table
        head={["Metric", "Baseline", "Pilot target"]}
        rows={[
          ["Median time to follow up a hot lead", "~4 h", "< 1 h"],
          ["Hot-lead conversion to booking", "Measured in week 0", "+10% relative"],
          ["After-call work per conversation", "~3 min", "< 1 min"],
          ["Agent agreement on lead tag (consistency)", "~60%", "> 85%"],
        ]}
      />
      <p className="!mb-1 font-semibold">Guardrails (any breach pauses the pilot)</p>
      <Table
        head={["Guardrail", "Threshold"]}
        rows={[
          ["Escalation recall", "≥ 95% on the weekly audit. A missed angry guest costs more than a false alarm."],
          ["Field accuracy on intent and urgency", "≥ 90% on the weekly audit sample"],
          ["Agent edit rate", "Between 5% and 25%. Higher means the model is wrong; lower means nobody is checking."],
          ["Personal data in model logs", "Zero unredacted phone numbers, emails, booking or payment IDs"],
          ["Guest complaints and CSAT", "No worse than the control group"],
          ["Cost and latency", "< ₹1 per conversation; p95 under 10 seconds"],
        ]}
      />

      <H>Where people stay in control</H>
      <ul className="list-disc pl-5">
        <li><b className="font-semibold">The agent confirms every record.</b> Each AI field is a dropdown they can change in one tap. Nothing reaches the CRM as fact until confirmed.</li>
        <li><b className="font-semibold">Escalations don&rsquo;t wait for confirmation.</b> They appear in the manager queue at once, marked as AI-suggested, because speed is the point. The manager can dismiss them.</li>
        <li><b className="font-semibold">Evidence is shown, not hidden.</b> The quotes behind each field are highlighted in the transcript, so a check takes seconds. A field with no quote is a guess and is shown as low confidence.</li>
        <li><b className="font-semibold">Edits are data.</b> Every override is logged with the before and after, and feeds the weekly eval and prompt fixes.</li>
        <li><b className="font-semibold">No customer-facing action in v1.</b> The assistant drafts; people send.</li>
      </ul>

      <H>Failure modes and risks</H>
      <Table
        head={["Risk", "Mitigation"]}
        rows={[
          ["Hallucinated details (dates, budgets, party size)", "Nullable fields and an explicit “never guess” rule; evidence quotes required; schema validation rejects malformed output; agent confirmation."],
          ["Wrong tags at scale, quietly", "Weekly audit of 200 labelled conversations; edit-rate monitoring per field; prompt changes ship only after beating the current version on the labelled set."],
          ["Personal data", "Redaction of phones, emails, booking and payment IDs before the model call; provider with zero data retention and no training on inputs; aligned with India’s DPDP Act 2023; transcripts kept only as long as the CRM keeps them."],
          ["Bias across languages and accents", "Most errors start in speech-to-text on Indian accents and Hinglish. Eval is sliced by language and channel; confidence is lowered on noisy transcripts; Hinglish examples in the prompt and the test set."],
          ["Prompt injection in a transcript", "The transcript is passed as quoted data; the model has no tools and can’t act, so the worst case is a wrong tag that the agent sees."],
          ["Over-reliance", "Edit rate below 5% triggers spot checks; the record states it is a suggestion until confirmed."],
        ]}
      />

      <H>Rollout</H>
      <ol className="list-decimal pl-5">
        <li><b className="font-semibold">Week 0 to 2, shadow mode.</b> Run on two weeks of past conversations. Two agents label 300; measure baseline follow-up time and tag agreement. Gate: field accuracy and escalation recall at target on the labelled set.</li>
        <li><b className="font-semibold">Week 3 to 6, pilot.</b> Goa, the highest-volume region, with 6 agents using the assistant and 6 matched agents as control. Weekly audit and prompt review.</li>
        <li><b className="font-semibold">Expand</b> region by region if hot-lead follow-up time falls by at least half, escalation recall stays ≥ 95%, edit rate sits between 5% and 25%, and most pilot agents want to keep it.</li>
        <li><b className="font-semibold">Kill or rethink</b> if any personal data leaks, escalation recall drops below 85%, or after four weeks follow-up time hasn&rsquo;t moved or after-call work has gone up.</li>
      </ol>

      {AI_USE.length > 0 && (
        <>
          <H>How AI was used on this case</H>
          <ul className="list-disc pl-5">{AI_USE.map((x) => <li key={x}>{x}</li>)}</ul>
        </>
      )}
    </article>
  );
}
