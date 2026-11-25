import type { Analysis } from "./schema";

// Hand labels for the 10 samples: the ground truth the model is scored against.
// Written before looking at any model output. Where a call was genuinely
// debatable, `note` explains the judgement and `accept` lists the other
// answers a reasonable reviewer could give (counted as a soft match).

export type Label = {
  conversation_type: Analysis["conversation_type"];
  intent: Analysis["intent"];
  lead_temperature: Analysis["lead_temperature"];
  urgency: Analysis["urgency"];
  escalation_needed: boolean;
  escalation_to: Analysis["escalation"]["to"];
  region: Analysis["region"];
  party_total: number | null;
  budget_per_night_inr: number | null;
  objection_types: Analysis["objections"][number]["type"][];
  owner: Analysis["next_best_action"]["owner"];
  next_action: string;
  accept?: Partial<Record<EvalField, string[]>>;
  note?: string;
};

export const EVAL_FIELDS = [
  "conversation_type",
  "intent",
  "lead_temperature",
  "urgency",
  "escalation_needed",
  "escalation_to",
  "party_total",
  "budget_per_night_inr",
  "objection_types",
  "owner",
] as const;
export type EvalField = (typeof EVAL_FIELDS)[number];

export const FIELD_NAMES: Record<EvalField, string> = {
  conversation_type: "Conversation type",
  intent: "Intent",
  lead_temperature: "Lead temperature",
  urgency: "Urgency",
  escalation_needed: "Escalation flag",
  escalation_to: "Escalate to",
  party_total: "Party size",
  budget_per_night_inr: "Budget / night",
  objection_types: "Objections",
  owner: "Action owner",
};

export const LABELS: Record<string, Label> = {
  T01: {
    conversation_type: "new_enquiry", intent: "comparing_options", lead_temperature: "hot", urgency: "high",
    escalation_needed: false, escalation_to: "none", region: "Goa", party_total: 10, budget_per_night_inr: 60000,
    objection_types: ["competition"], owner: "agent",
    next_action: "Send 2–3 North Goa villas with pool and chef under ₹60k/night on WhatsApp today, then call tomorrow morning before they decide.",
    accept: { intent: ["ready_to_book"] },
  },
  T02: {
    conversation_type: "booking_change", intent: "change_or_cancel", lead_temperature: "not_a_lead", urgency: "high",
    escalation_needed: true, escalation_to: "manager", region: "Lonavala", party_total: null, budget_per_night_inr: null,
    objection_types: ["policy"], owner: "manager",
    next_action: "Manager calls the guest today, explains the one-time reschedule and decides whether a goodwill exception is worth it given the review threat.",
  },
  T03: {
    conversation_type: "new_enquiry", intent: "ready_to_book", lead_temperature: "hot", urgency: "high",
    escalation_needed: false, escalation_to: "none", region: "Alibaug", party_total: null, budget_per_night_inr: null,
    objection_types: [], owner: "agent",
    next_action: "Send the payment link now with the ₹5,000 refundable pet deposit and meal terms spelled out.",
    note: "Dates, party size and villa are never stated. The model should list them as missing, not invent them.",
  },
  T04: {
    conversation_type: "new_enquiry", intent: "browsing", lead_temperature: "cold", urgency: "low",
    escalation_needed: false, escalation_to: "none", region: "Coorg", party_total: 6, budget_per_night_inr: null,
    objection_types: ["timing"], owner: "agent",
    next_action: "Send March price ranges for 6 guests on WhatsApp. Do not call. The guest said they will call.",
    accept: { objection_types: ["[]"] },
    note: "Trap: the agent promised a February call that the guest declined. A good output respects the guest.",
  },
  T05: {
    conversation_type: "in_stay_issue", intent: "service_complaint", lead_temperature: "not_a_lead", urgency: "high",
    escalation_needed: true, escalation_to: "ops", region: "Goa", party_total: null, budget_per_night_inr: null,
    objection_types: ["service_quality"], owner: "ops",
    next_action: "Caretaker fixes or replaces the master bedroom AC tonight; manager calls tomorrow about partial refund for AC and pool.",
    accept: { escalation_to: ["manager"], owner: ["manager"] },
    note: "Two escalations in one: ops tonight, manager tomorrow. Either is acceptable as the primary.",
  },
  T06: {
    conversation_type: "new_enquiry", intent: "comparing_options", lead_temperature: "warm", urgency: "medium",
    escalation_needed: false, escalation_to: "none", region: "Lonavala", party_total: 25, budget_per_night_inr: null,
    objection_types: [], owner: "agent",
    next_action: "Email a cluster of adjacent Lonavala villas for 25 guests, 2 nights in November, with a GST invoice sample. Chase if no requirements in 2 days.",
    accept: { lead_temperature: ["hot"], intent: ["ready_to_book", "browsing"], escalation_needed: ["true"], escalation_to: ["manager"] },
    note: "High-value referral with a flexible budget. Some teams would route this to a manager; we chose not to in v1.",
  },
  T07: {
    conversation_type: "price_objection", intent: "browsing", lead_temperature: "cold", urgency: "medium",
    escalation_needed: false, escalation_to: "none", region: "Alibaug", party_total: null, budget_per_night_inr: null,
    objection_types: ["price"], owner: "agent",
    next_action: "Today, offer weekday dates that qualify for the 20% offer or a cheaper Alibaug villa for 14–16 Nov.",
    accept: { conversation_type: ["new_enquiry"], urgency: ["low", "high"], objection_types: ["price,policy"] },
    note: "Lost-ish lead with near dates. Win-back is cheap, so urgency is medium, not low.",
  },
  T08: {
    conversation_type: "new_enquiry", intent: "ready_to_book", lead_temperature: "hot", urgency: "high",
    escalation_needed: false, escalation_to: "none", region: "Goa", party_total: null, budget_per_night_inr: null,
    objection_types: ["price"], owner: "agent",
    next_action: "Place a hold on the villa for 30 Dec–3 Jan and send the advance payment link now; check payment before end of day.",
    note: "₹85k/night is the agent's quote, not the guest's budget. Budget should be null.",
  },
  T09: {
    conversation_type: "payment_issue", intent: "payment_problem", lead_temperature: "hot", urgency: "high",
    escalation_needed: true, escalation_to: "payments", region: "Coorg", party_total: null, budget_per_night_inr: null,
    objection_types: ["availability"], owner: "payments",
    next_action: "Put a manual hold on the villa today and escalate to payments with the guest's bank SMS so the booking is confirmed or refunded.",
    accept: { lead_temperature: ["not_a_lead"], escalation_to: ["manager"], owner: ["agent", "manager"], objection_types: ["[]"] },
    note: "Money is debited but no booking exists, so revenue is at risk. Treated as hot.",
  },
  T10: {
    conversation_type: "new_enquiry", intent: "ready_to_book", lead_temperature: "hot", urgency: "medium",
    escalation_needed: false, escalation_to: "none", region: "Lonavala", party_total: 12, budget_per_night_inr: null,
    objection_types: ["policy"], owner: "agent",
    next_action: "Send both no-curfew villas with the ₹25k deposit terms and ask for dates.",
    accept: { lead_temperature: ["warm"], urgency: ["high"] },
  },
};
