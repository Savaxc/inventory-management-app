import { defineRuntime, RuntimeState, createAgent, type Agent } from "@mozaik-ai/core"
import { stockTools } from "./tools"
import { createAuditor } from "./auditor"
import { prisma } from "../db"

class StockState extends RuntimeState {}

const INSTRUCTION = `Ti si inteligentni asistent za upravljanje zalihama u aplikaciji Stock.app.
Odgovaraj kratko, jasno i na jeziku korisnika. Brojke i stanje zaliha uzimaj isključivo iz alata.
Za bilo kakvu izmenu ili dopunu zaliha, obavezno koristi alat propose_stock_update i jasno reci korisniku da potvrdi izmenu.`

const HISTORY_LIMIT = 20
const HISTORY_CHARS = 600

type Store = {
  rt?: ReturnType<typeof defineRuntime<StockState>>
  agents?: Map<string, Promise<Agent>>
  owners?: Map<string, string> // agentId -> userId
  auditorJoined?: boolean
}

const g = globalThis as unknown as { __stock?: Store }
const store = (g.__stock ??= {})

export const rt = (store.rt ??= (() => {
  const r = defineRuntime<StockState>()
  r.initializeRuntime({ state: new StockState() })
  return r
})())

const agents = (store.agents ??= new Map<string, Promise<Agent>>())
const owners = (store.owners ??= new Map<string, string>())

// Auditor se pridružuje runtime-u samo jednom
if (!store.auditorJoined) {
  rt.join(createAuditor((producerId) => owners.get(producerId)))
  store.auditorJoined = true
}

async function loadHistory(userId: string): Promise<string | null> {
  const rows = await prisma.assistantMessage.findMany({
    where: { userId, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  })
  if (rows.length === 0) return null

  const lines = rows
    .reverse()
    .map((r) => `${r.role === "user" ? "Korisnik" : "Asistent"}: ${r.content.slice(0, HISTORY_CHARS)}`)
    .join("\n")

  return `Istorija prethodnog razgovora sa ovim korisnikom (samo kontekst; stanje zaliha uvek uzimaj iz alata, ne iz istorije):\n${lines}`
}

async function createUserAgent(userId: string): Promise<Agent> {
  const history = await loadHistory(userId)

  const agent = createAgent({
    name: "Stock asistent",
    capabilities: ["inference"],
    instruction: history ? `${INSTRUCTION}\n\n${history}` : INSTRUCTION,
    tools: stockTools(userId),
    handlers: [],
  })

  owners.set(agent.getId(), userId)
  rt.join(agent)
  return agent
}

export function agentFor(userId: string): Promise<Agent> {
  let p = agents.get(userId)
  if (!p) {
    p = createUserAgent(userId)
    agents.set(userId, p)
    p.catch(() => agents.delete(userId))
  }
  return p
}

/** Briše memoriju korisnika: agent iz RAM-a + istoriju iz baze. */
export async function resetAgent(userId: string) {
  const p = agents.get(userId)
  if (p) {
    try {
      const agent = await p
      rt.leave(agent)
      owners.delete(agent.getId())
    } catch {
      /* agent nije ni uspeo da se napravi */
    }
    agents.delete(userId)
  }
  await prisma.assistantMessage.deleteMany({ where: { userId } })
}