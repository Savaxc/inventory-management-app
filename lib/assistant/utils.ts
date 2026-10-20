/* eslint-disable @typescript-eslint/no-explicit-any */

/** Tekst finalnog odgovora iz model.answer payload-a. */
export function extractAnswerText(payload: any): string {
  const answer = payload?.answer ?? payload
  const content = answer?.content ?? answer
  if (typeof content === "string") return content
  if (typeof content?.text === "string") return content.text
  if (Array.isArray(content)) {
    return content.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  }
  if (typeof answer?.text === "string") return answer.text
  return ""
}

/** Tekstualni delta iz inference.stream payload-a (inner provider event). */
export function extractTextDelta(inner: any): string {
  if (!inner) return ""

  // OpenAI Responses format: { type: "response.output_text.delta", payload: { delta } }
  if (typeof inner.type === "string" && inner.type.endsWith("output_text.delta")) {
    const p = inner.payload ?? inner.data ?? {}
    return typeof p.delta === "string" ? p.delta : ""
  }

  // Chat completions format (DeepSeek): chunk je sam payload, choices je na vrhu
  const chunk = inner.payload ?? inner.data ?? inner
  const content = chunk?.choices?.[0]?.delta?.content
  return typeof content === "string" ? content : ""
}

export function safeStringify(value: unknown, max = 500): string {
  try {
    return JSON.stringify(value).slice(0, max)
  } catch {
    return String(value).slice(0, max)
  }
}