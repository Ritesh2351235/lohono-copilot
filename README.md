# Lohono Copilot

Prototype for the Lohono AI product case: an after-conversation assistant that reads a sales or support transcript and returns a structured record (intent, lead temperature, urgency, trip details, objections, next step, escalation) for the agent to confirm and the manager to triage.

- `lib/prompt.ts`: system prompt and user message
- `lib/schema.ts`: output schema (Zod, enforced as structured output)
- `lib/redact.ts`: personal-data redaction before the model call
- `lib/labels.ts`: hand labels for the 10 samples; `lib/eval.ts` scores against them
- `data/snapshot.json`: the model run shown in the app (Gemini 2.5 Flash via Vercel AI Gateway)
- `app/api/analyze`: analyze one transcript; `app/api/batch`: run all 10

Run locally: `npm install && npm run dev`. Needs AI Gateway auth (`vercel env pull` or `AI_GATEWAY_API_KEY`). Set `MODEL_ID` to swap models.
