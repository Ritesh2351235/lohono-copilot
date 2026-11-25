// Runs before anything leaves our servers. The model never needs a phone
// number or booking ID to tag a lead, so we strip them and keep a count.
const RULES: { label: string; re: RegExp }[] = [
  { label: "EMAIL", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { label: "PHONE", re: /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g },
  { label: "BOOKING_ID", re: /\b[A-Z]{2}-[A-Z0-9]{4,}\b/g },
  { label: "TXN_ID", re: /\b(?:UTR|TXN|txn|utr)[\s:#-]*[A-Z0-9]{6,}\b/g },
  { label: "CARD", re: /\b(?:\d[ -]?){13,16}\b/g },
];

export function redact(text: string) {
  let out = text;
  const found: Record<string, number> = {};
  for (const { label, re } of RULES) {
    out = out.replace(re, () => {
      found[label] = (found[label] ?? 0) + 1;
      return `[${label}]`;
    });
  }
  return { text: out, found };
}
