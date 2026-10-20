/* eslint-disable @typescript-eslint/no-explicit-any */
import { type InterceptionHandler } from "@mozaik-ai/core"
import { saveMessage } from "./auditor"

const MAX_TOOL_CALLS_PER_TURN = 6

// Ovde upiši imena alata koje želiš da zabraniš, npr. "delete_product".
const BLOCKED_TOOLS = new Set<string>([])

export function createToolGuard(userId: string): InterceptionHandler {
  let calls = 0

  return {
    isSatisfiedBy(transition) {
      return transition.nextStateId === "function_call"
    },

    async handle(transition) {
      if (transition.nextStateId !== "function_call") return transition

      const { call, inferenceInput } = transition.input as any
      calls++

      let reason: string | null = null
      if (BLOCKED_TOOLS.has(call.name)) {
        reason = `Alat "${call.name}" nije dozvoljen.`
      } else if (calls > MAX_TOOL_CALLS_PER_TURN) {
        reason = "Previše poziva alata u jednom zahtevu."
      }

      if (!reason) return transition

      console.warn(`[ToolGuard] blokiran poziv: ${call.name} (${reason})`)
      void saveMessage(userId, "tool", `BLOKIRANO: ${call.name} (${reason})`)

      // Alat ostaje u listi, ali mu je invoke zamenjen porukom o blokadi,
      // pa model dobija objašnjenje umesto rezultata.
      const tools = (inferenceInput.tools ?? []).map((t: any) =>
        t.name === call.name
          ? { ...t, invoke: async () => ({ blocked: true, message: reason }) }
          : t,
      )

      return {
        ...transition,
        input: { call, inferenceInput: { ...inferenceInput, tools } },
      } as typeof transition
    },
  }
}