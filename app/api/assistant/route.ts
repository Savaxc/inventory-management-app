/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server"
import { createHuman, SituationSpecification, type SituationContext } from "@mozaik-ai/core"
import { rt, agentFor, resetAgent } from "@/lib/assistant/runtime"
import { createToolGuard } from "@/lib/assistant/guard"
import { extractAnswerText, extractTextDelta } from "@/lib/assistant/utils"

export const runtime = "nodejs"

const MODEL = process.env.ASSISTANT_MODEL ?? "deepseek-v4-flash"
const IDLE_TIMEOUT_MS = 60_000
const DEBUG = process.env.ASSISTANT_DEBUG === "1"

class FromAgent extends SituationSpecification {
  constructor(private agentId: string) {
    super()
  }
  isSatisfiedBy({ event }: SituationContext) {
    return (
      event.producerId === this.agentId &&
      (event.type === "inference.stream" ||
        event.type === "function_call.started" ||
        event.type === "model.answer")
    )
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response("Unauthorized", { status: 401 })

  const body = await req.json().catch(() => null)
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  if (!message) return new Response("Bad request", { status: 400 })

  const agent = await agentFor(userId)
  const enc = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      let buffered = "" // tekst streamovan od poslednjeg poziva alata
      let timer: ReturnType<typeof setTimeout> | undefined

      const send = (type: string, data: unknown) => {
        if (closed) return
        try {
          controller.enqueue(enc.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
        }
      }

      const finish = () => {
        if (closed) return
        closed = true
        if (timer) clearTimeout(timer)
        rt.leave(listener)
        try {
          controller.close()
        } catch {
          /* već zatvoren */
        }
      }

      // runLoop je fire-and-forget, pa greške (npr. pogrešno ime modela) ne stižu
      // do try/catch-a. Ovaj tajmer ih hvata kao "nema događaja predugo".
      const armTimer = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          send("answer", "Asistent nije odgovorio na vreme. Pokušaj ponovo.")
          finish()
        }, IDLE_TIMEOUT_MS)
      }

      const listener = createHuman({
        name: `ui-${userId}-${crypto.randomUUID()}`,
        capabilities: [],
        handlers: [
          {
            specification: new FromAgent(agent.getId()),
            processor: {
              apply({ event }) {
                if (closed) return
                armTimer()
                const p = event.payload as any

                switch (event.type) {
                  case "inference.stream": {
                    const delta = extractTextDelta(p)
                    if (delta) {
                      buffered += delta
                      send("delta", delta)
                    } else if (DEBUG) {
                      console.log("[assistant] nepoznat stream chunk:", JSON.stringify(p)?.slice(0, 300))
                    }
                    break
                  }
                  case "function_call.started":
                    buffered = ""
                    send("tool", p?.call?.name ?? "alat")
                    break
                  case "model.answer":
                    send("answer", extractAnswerText(p) || buffered || "Odgovor je uspešno generisan.")
                    finish()
                    break
                }
              },
            },
          },
        ],
      })

      rt.join(listener)
      armTimer()
      req.signal.addEventListener("abort", finish)

      try {
        rt.runLoop(
          agent.getId(),
          message,
          {
            model: MODEL,
            context: agent.getMemory().getContext(),
            tools: agent.getTools(),
            streaming: true,
          },
          createToolGuard(userId),
        )
      } catch (err) {
        console.error("Greška pri pokretanju runLoop-a:", err)
        send("answer", "Došlo je do greške u AI asistentu.")
        finish()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return new Response("Unauthorized", { status: 401 })
  await resetAgent(userId)
  return new Response(null, { status: 204 })
}