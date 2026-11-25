import { analyze } from "@/lib/analyze";

export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { transcript?: string; region?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Send JSON with a transcript field." }, { status: 400 });
  }
  const transcript = (body.transcript ?? "").trim();
  if (transcript.length < 20) return Response.json({ error: "Paste a longer conversation. At least a couple of lines are needed." }, { status: 400 });
  if (transcript.length > 12000) return Response.json({ error: "That conversation is over 12,000 characters. Trim it and try again." }, { status: 413 });
  try {
    return Response.json(await analyze(transcript, body.region || undefined));
  } catch (e) {
    console.error(e);
    return Response.json({ error: "The model did not return a valid record. Try again, or check the AI Gateway setup." }, { status: 502 });
  }
}
