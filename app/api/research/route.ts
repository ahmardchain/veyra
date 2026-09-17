import { reviewInput, parseReview, REVIEW_SYSTEM } from "@/lib/ai-review";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
function config() {
  // Explicit opt-in: does not retry the old rejected subsidy credential.
  const apiKey = process.env.RESEARCH_API_KEY?.trim();
  const base = process.env.RESEARCH_BASE_URL?.trim().replace(/\/$/, "");
  const model = process.env.RESEARCH_MODEL?.trim();
  if (!apiKey || !base || !model) return null;
  try { if (new URL(base).protocol !== "https:") return null; } catch { return null; }
  return { apiKey, base, model };
}
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const c = config();
  return reply({ configured: !!c, model: c?.model ?? null });
}
export async function POST(request: Request) {
  const c = config();
  if (!c) return reply({ error: "AI review is not connected. This brief uses the rule engine." }, 503);
  if (Number(request.headers.get("content-length")) > 24000) return reply({ error: "Research request is too long." }, 413);
  let input;
  try {
    const body = await request.text();
    if (body.length > 24000) return reply({ error: "Research request is too long." }, 413);
    input = reviewInput.parse(JSON.parse(body));
  } catch { return reply({ error: "Supply a question, event packet, valid asset and size." }, 400); }
  try {
    const response = await fetch(`${c.base}/chat/completions`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(45000),
      headers: { Authorization: `Bearer ${c.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: c.model, stream: false, max_tokens: 1600, temperature: 0.2, messages: [{ role: "system", content: REVIEW_SYSTEM }, { role: "user", content: JSON.stringify(input) }] }),
    });
    if (!response.ok) {
      const error = response.status === 401 || response.status === 403 ? "The AI provider rejected its credentials. The rule-based brief is still available." : response.status === 429 ? "The AI provider is busy or its quota is exhausted. Try later." : `The AI provider returned HTTP ${response.status}. The rule-based brief is still available.`;
      return reply({ error }, 502);
    }
    const raw = await response.text();
    if (!raw.trim()) return reply({ error: "The AI provider returned an empty response. The rule-based brief is still available." }, 502);
    const envelope = JSON.parse(raw);
    const content = envelope?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return reply({ error: "The AI provider returned an unsupported response format." }, 502);
    const review = parseReview(content, input.eventPacket);
    return reply({ review: { ...review, model: c.model, generatedAt: Date.now() } });
  } catch (error) {
    const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return reply({ error: timeout ? "AI review timed out. The rule-based brief is still available." : "AI review could not be validated. The rule-based brief is still available." }, 502);
  }
}
