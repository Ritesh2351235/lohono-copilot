// Reviewer notes on specific model misses, keyed "T01:field".
// Written after reading the batch run that ships in data/snapshot.json.
export const MISS_NOTES: Record<string, string> = {
  "T01:objection_types":
    "Caught the competitor deadline as a risk flag but didn't log competition as an objection, so objection reports would undercount it. Fix: define “comparing with other places” as a competition objection in the prompt.",
  "T05:owner":
    "Gave the job to the sales agent. At 11pm the AC fix belongs to the caretaker (ops) and the refund call to a manager. Fix: add owner rules by conversation type.",
  "T07:intent":
    "Read “forget it, too expensive” as comparing. I read it as a browser dropping out. Low stakes, but the same misreading led it to suggest marking the lead lost instead of a cheap win-back.",
  "T09:objection_types":
    "Tagged the 5–7 day refund wait as a timing objection; my label calls it an availability risk (the villa may go). Both are defensible, which says the objection taxonomy needs written definitions before labelling at scale.",
  "T10:intent":
    "The guest accepted a ₹25k deposit and said “send details”. I read that as ready to book; the model said comparing and warm. Under-calling heat here delays a likely booking.",
};

// Problems a per-field score doesn't catch, found by reading every output.
export const OTHER_FINDINGS: { title: string; body: string }[] = [
  { title: "Generic next steps", body: "T01’s step is “Share villa options on WhatsApp”, dropping the pool, chef, ₹60k cap and the decide-by-tomorrow deadline. T07 says to mark the lead lost. The tags are right more often than the advice is useful." },
  { title: "Small inventions", body: "T04 turns “maybe 6” people into 6 adults. T10 sets children to 0 when nobody mentioned children. Both break rule 1 (never guess) in ways a field score on totals doesn’t see." },
  { title: "Overconfident", body: "Urgency confidence is “high” on all 10, including the debatable T07. Self-reported confidence isn’t usable for routing yet; it would need calibrating against audits." },
  { title: "Evidence not always verbatim", body: "One T10 quote spans two speakers (“…after 10pm. Guest: That’s a problem.”), so it can’t be found in the transcript. A post-check that every quote exists verbatim would catch this." },
  { title: "Empty strings instead of null", body: "T04’s urgency reason is the string “null”, T10’s is empty. Cosmetic, but the schema should make the field nullable or require text." },
];

// How AI tools were used on this case, and where their output was corrected.
export const AI_USE: string[] = [
  "Claude (Anthropic) was used as a build partner: drafting this brief, the schema, the prompt, the app and a first pass of the hand labels.",
  "Hand labels were fixed before any model output was seen and were not changed afterwards. Defensible alternatives were recorded at the same time, not after.",
  "Corrected: the first draft gave each transcript a call or WhatsApp channel. The brief doesn’t say, so the field was removed.",
  "Corrected: the prompt page claimed certain rules came from “early runs”. There were no earlier runs; the text now says which sample each rule targets.",
  "Changed: the plan was Claude Haiku 5.5, but the free tier of Vercel AI Gateway blocks it, so the shipped run uses Gemini 2.5 Flash. The model is one environment variable.",
];
