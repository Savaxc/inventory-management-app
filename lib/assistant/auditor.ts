/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createHuman,
  SituationSpecification,
  type SituationContext,
  type SituationHandler,
} from "@mozaik-ai/core"
import { extractAnswerText, safeStringify } from "./utils"
import { prisma } from "../db"

export async function saveMessage(userId: string, role: "user" | "assistant" | "tool", content: string) {
  if (!content.trim()) return
  try {
    await prisma.assistantMessage.create({
      data: { userId, role, content: content.slice(0, 8000) },
    })
  } catch (e) {
    console.error("[Auditor] upis nije uspeo:", e)
  }
}

/** Poklapa događaj datog tipa, ali samo ako ga je proizveo naš korisnički agent. */
class WhenAgentEvent extends SituationSpecification {
  constructor(
    private type: string,
    private ownerOf: (producerId: string) => string | undefined,
  ) {
    super()
  }
  isSatisfiedBy({ event }: SituationContext) {
    return event.type === this.type && this.ownerOf(event.producerId) !== undefined
  }
}

export function createAuditor(ownerOf: (producerId: string) => string | undefined) {
  const handlers: SituationHandler[] = [
    {
      // Poruka korisnika
      specification: new WhenAgentEvent("context_update.started", ownerOf),
      processor: {
        apply({ event }) {
          const userId = ownerOf(event.producerId)
          const p = event.payload as any
          if (userId) void saveMessage(userId, "user", String(p?.content ?? ""))
        },
      },
    },
    {
      // Poziv alata
      specification: new WhenAgentEvent("function_call.started", ownerOf),
      processor: {
        apply({ event }) {
          const userId = ownerOf(event.producerId)
          const p = event.payload as any
          if (userId) {
            void saveMessage(userId, "tool", `${p?.call?.name ?? "alat"} ${safeStringify(p?.call)}`)
          }
        },
      },
    },
    {
      // Odgovor asistenta
      specification: new WhenAgentEvent("model.answer", ownerOf),
      processor: {
        apply({ event }) {
          const userId = ownerOf(event.producerId)
          if (userId) void saveMessage(userId, "assistant", extractAnswerText(event.payload))
        },
      },
    },
  ]

  return createHuman({ name: "Auditor", capabilities: [], handlers })
}