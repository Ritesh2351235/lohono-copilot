export type Turn = { speaker: "Agent" | "Guest"; text: string };
export type Transcript = { id: string; region: string; turns: Turn[] };

const t = (speaker: Turn["speaker"], text: string): Turn => ({ speaker, text });

// Appendix A of the brief, verbatim. All synthetic.
export const TRANSCRIPTS: Transcript[] = [
  {
    id: "T01", region: "Goa",
    turns: [
      t("Agent", "Hello, Lohono villas, how can I help?"),
      t("Guest", "Hi, we are 8 adults and 2 kids looking for a villa in North Goa for 28 Dec to 2 Jan. Needs a pool and a chef."),
      t("Agent", "We have a few. Budget?"),
      t("Guest", "Around 60k a night max."),
      t("Agent", "I'll share options on WhatsApp."),
      t("Guest", "Please do it today, we're comparing with two other places and deciding by tomorrow."),
    ],
  },
  {
    id: "T02", region: "Lonavala",
    turns: [
      t("Guest", "I booked a villa for next weekend but my plan changed. Can I get a refund?"),
      t("Agent", "Let me check the policy. Which booking ID?"),
      t("Guest", "LX-XXXX."),
      t("Agent", "It is within 7 days, so cancellation is non-refundable but you can reschedule once."),
      t("Guest", "That's unfair, I'll post about this online."),
      t("Agent", "I'm sorry sir, I will escalate to my manager."),
    ],
  },
  {
    id: "T03", region: "Alibaug",
    turns: [
      t("Guest", "Is the villa pet friendly? We have a golden retriever."),
      t("Agent", "Yes, pets allowed with a deposit."),
      t("Guest", "How much?"),
      t("Agent", "Rs 5000 refundable."),
      t("Guest", "Okay. What about the caretaker, is food included?"),
      t("Agent", "Breakfast included, other meals on request."),
      t("Guest", "Fine, send me the payment link."),
    ],
  },
  {
    id: "T04", region: "Coorg",
    turns: [
      t("Guest", "Hi I just want to know prices, not booking now. Maybe in March."),
      t("Agent", "Sure, for how many people?"),
      t("Guest", "Not sure yet, maybe 6."),
      t("Agent", "I will call you in February."),
      t("Guest", "No need, I'll call you."),
    ],
  },
  {
    id: "T05", region: "Goa",
    turns: [
      t("Guest", "The AC in the master bedroom is not working and it's 11pm. We checked in today."),
      t("Agent", "I'm sorry, I will inform the caretaker now."),
      t("Guest", "This is the second problem, the pool was also dirty on arrival."),
      t("Agent", "I will arrange a fix tonight and a compensation discussion tomorrow."),
      t("Guest", "I expect a partial refund."),
    ],
  },
  {
    id: "T06", region: "Lonavala",
    turns: [
      t("Guest", "Hi, I got your number from a friend who stayed in your Lonavala villa. We want a corporate offsite for 25 people, 2 nights, in November."),
      t("Agent", "We can do multiple villas next to each other."),
      t("Guest", "Great, can you invoice with GST in company name?"),
      t("Agent", "Yes. Please email requirements."),
      t("Guest", "Will do, our budget is flexible if the property is good."),
    ],
  },
  {
    id: "T07", region: "Alibaug",
    turns: [
      t("Guest", "I saw a 20 percent discount on Instagram for Alibaug. Does that apply to my dates, 14 to 16 Nov?"),
      t("Agent", "Let me check. That offer is for weekdays only."),
      t("Guest", "My dates are Sat-Mon."),
      t("Agent", "Then it is not applicable."),
      t("Guest", "Okay, forget it, too expensive then."),
    ],
  },
  {
    id: "T08", region: "Goa",
    turns: [
      t("Guest", "We stayed with you last year, loved it. Same villa available for New Year?"),
      t("Agent", "Checking. Yes, 30 Dec to 3 Jan is available."),
      t("Guest", "Price?"),
      t("Agent", "85k per night, 4 nights."),
      t("Guest", "That's up from last year."),
      t("Agent", "Peak season."),
      t("Guest", "Hold it for me, I'll pay the advance tonight."),
    ],
  },
  {
    id: "T09", region: "Coorg",
    turns: [
      t("Guest", "Payment failed twice on the app, money got deducted though."),
      t("Agent", "Can you share the transaction ID?"),
      t("Guest", "I don't have it, only SMS from the bank."),
      t("Agent", "I will raise it with the payments team, it takes 5 to 7 days."),
      t("Guest", "I need the booking confirmed today, the villa will go to someone else."),
    ],
  },
  {
    id: "T10", region: "Lonavala",
    turns: [
      t("Guest", "Looking for something for a bachelorette party, 12 girls, with loud music allowed."),
      t("Agent", "Our villas have noise restrictions after 10pm."),
      t("Guest", "That's a problem. Any villa without restrictions?"),
      t("Agent", "Two properties, but they require a higher security deposit."),
      t("Guest", "How high?"),
      t("Agent", "25k."),
      t("Guest", "Fine, send details."),
    ],
  },
];

export const toText = (tr: Transcript) => tr.turns.map((x) => `${x.speaker}: ${x.text}`).join("\n");

export function firstGuestLine(tr: Transcript) {
  return tr.turns.find((x) => x.speaker === "Guest")?.text ?? tr.turns[0].text;
}
