import { z } from "zod";
import { AnalysisSchema } from "@/lib/schema";
import { MODEL_ID, PROMPT_VERSION, SYSTEM_PROMPT, userPrompt } from "@/lib/prompt";

export const metadata = { title: "Prompt and schema — Lohono Copilot" };

function Block({ title, sub, children }: { title: string; sub: string; children: string }) {
  return (
    <section className="mb-10">
      <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-[-0.015em]">{title}</h2>
      <p className="mt-0.5 max-w-[68ch] text-[14px] text-ink-2">{sub}</p>
      <pre className="mt-3 max-h-[560px] overflow-auto rounded-[14px] bg-[#1d1d1f] p-5 font-mono text-[12.5px] leading-[1.6] text-[#f5f5f7] whitespace-pre-wrap">{children}</pre>
    </section>
  );
}

export default function PromptPage() {
  const schema = JSON.stringify(z.toJSONSchema(AnalysisSchema), null, 2);
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="large-title">Prompt and schema</h1>
      <p className="mt-1 max-w-[64ch] text-[14px] text-ink-2">
        Exactly what runs on every conversation. One model call, no tools, temperature 0, output forced into the schema below. Prompt {PROMPT_VERSION}, model {MODEL_ID} through Vercel AI Gateway.
      </p>

      <dl className="my-8 grid gap-px overflow-hidden rounded-[14px] bg-hairline text-[14px] sm:grid-cols-2">
        {[
          ["Why one call", "Fields depend on each other (urgency explains the next step). One call keeps them consistent and costs a fraction of a cent."],
          ["Why a strict schema", "The CRM and the manager queue read these fields directly. Enums stop the model inventing new tags; nullable fields force an explicit “not stated”."],
          ["Why evidence quotes", "Every key field must point to words in the transcript. The UI highlights them, so an agent can verify in seconds and spot guesses."],
          ["Why redact first", "The model doesn’t need phone numbers or booking IDs to tag a lead, so they never leave Lohono’s systems."],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-4">
            <dt className="font-semibold">{k}</dt>
            <dd className="mt-0.5 text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>

      <Block title="System prompt" sub="Rules 2, 5 and 7 target the traps in the sample set: an agent’s quote that isn’t the guest’s budget (T08), service issues that aren’t sales leads (T02, T05) and a guest who turned down a callback (T04).">
        {SYSTEM_PROMPT}
      </Block>
      <Block title="User message" sub="The region comes from the CRM record, not the transcript, since guests rarely say it.">
        {userPrompt("Agent: Hello, Lohono villas, how can I help?\nGuest: …", "Goa")}
      </Block>
      <Block title="Output schema (JSON Schema, generated from Zod)" sub="Passed to the model as a structured-output constraint and validated again on our side before anything is shown.">
        {schema}
      </Block>
    </div>
  );
}
