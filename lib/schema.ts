import { z } from "zod";

// The contract between the model and the product. Every field the UI shows
// comes from here. Nullable (not optional) so the model must say "unknown"
// explicitly instead of silently skipping a field.

export const CONVERSATION_TYPES = [
  "new_enquiry",
  "booking_change",
  "in_stay_issue",
  "payment_issue",
  "price_objection",
  "other",
] as const;

export const INTENTS = [
  "ready_to_book",
  "comparing_options",
  "browsing",
  "change_or_cancel",
  "service_complaint",
  "payment_problem",
] as const;

export const TEMPERATURES = ["hot", "warm", "cold", "not_a_lead"] as const;
export const URGENCY = ["high", "medium", "low"] as const;
export const OWNERS = ["agent", "manager", "ops", "payments"] as const;
export const OBJECTION_TYPES = ["price", "policy", "competition", "availability", "service_quality", "timing"] as const;
export const REGIONS = ["Goa", "Lonavala", "Alibaug", "Coorg", "unknown"] as const;
export const CONFIDENCE = ["high", "medium", "low"] as const;

export const AnalysisSchema = z.object({
  summary: z.string().describe("One or two plain sentences an agent could read in five seconds."),
  conversation_type: z.enum(CONVERSATION_TYPES),
  intent: z.enum(INTENTS).describe("What the guest is trying to do right now."),
  lead_temperature: z
    .enum(TEMPERATURES)
    .describe("hot = will likely book within 48h if we act; warm = real interest, no deadline; cold = no near-term purchase; not_a_lead = existing booking or service matter."),
  urgency: z.enum(URGENCY).describe("How fast Lohono must act, regardless of lead value."),
  respond_within: z.string().describe('Concrete deadline, e.g. "within 1 hour", "today", "before 9pm tonight", "this week".'),
  urgency_reason: z.string(),
  region: z.enum(REGIONS),
  sub_location: z.string().nullable().describe('e.g. "North Goa". Null if not stated.'),
  stay: z.object({
    check_in: z.string().nullable().describe("As stated, e.g. '28 Dec'. Never invent a year."),
    check_out: z.string().nullable(),
    nights: z.number().int().nullable(),
    timing_text: z.string().nullable().describe("Vague timing if no dates, e.g. 'March', 'next weekend'."),
  }),
  party: z.object({
    adults: z.number().int().nullable(),
    children: z.number().int().nullable(),
    total: z.number().int().nullable().describe("Total guests. Null if not stated. If the guest gave an estimate, use it and lower confidence."),
    pets: z.string().nullable(),
    occasion: z.string().nullable().describe("e.g. corporate offsite, bachelorette, New Year."),
  }),
  budget: z.object({
    per_night_inr: z.number().nullable().describe("Guest's stated budget per night in INR. 60k = 60000. Null if the guest never stated a budget. A price quoted by the agent is NOT the guest's budget."),
    quoted_per_night_inr: z.number().nullable().describe("Price the agent quoted, if any."),
    flexibility: z.enum(["hard_cap", "flexible", "unknown"]),
  }),
  requirements: z.array(z.string()).describe("Concrete must-haves, e.g. pool, chef, pet friendly, GST invoice."),
  objections: z
    .array(z.object({ type: z.enum(OBJECTION_TYPES), detail: z.string(), resolved: z.boolean() }))
    .describe("Reasons the guest might not book or is unhappy. Empty if none."),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  next_best_action: z.object({
    action: z.string().describe("One imperative sentence, specific to this guest."),
    owner: z.enum(OWNERS),
    due: z.string(),
  }),
  escalation: z.object({
    needed: z.boolean(),
    to: z.enum(["manager", "ops", "payments", "none"]),
    reason: z.string().nullable(),
  }),
  risk_flags: z
    .array(z.enum(["public_review_threat", "refund_request", "compensation_request", "money_debited_unconfirmed", "competitor_deadline", "policy_exception_needed", "high_value_group", "repeat_guest"]))
    .describe("Only flags supported by the transcript."),
  missing_info: z.array(z.string()).describe("What the agent should ask next to move this forward."),
  evidence: z
    .array(z.object({ field: z.string(), quote: z.string() }))
    .describe("Exact short quotes from the transcript that justify intent, urgency, budget, party size and escalation."),
  confidence: z.object({
    intent: z.enum(CONFIDENCE),
    urgency: z.enum(CONFIDENCE),
    budget: z.enum(CONFIDENCE),
    party: z.enum(CONFIDENCE),
  }),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
