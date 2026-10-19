import { defineRuntime, RuntimeState, createAgent, type Agent } from "@mozaik-ai/core";
import { stockTools } from "./tools";

class StockState extends RuntimeState {}

const g = globalThis as unknown as { __stockRt?: ReturnType<typeof defineRuntime<StockState>> };
export const rt = (g.__stockRt ??= (() => {
  const r = defineRuntime<StockState>();
  r.initializeRuntime({ state: new StockState() });
  return r;
})());

const agents = new Map<string, Agent>();

export function agentFor(userId: string): Agent {
  let agent = agents.get(userId);
  if (!agent) {
    agent = createAgent({
      name: "Stock asistent",
      capabilities: ["inference"],
      instruction: INSTRUCTION,
      tools: stockTools(userId),
      handlers: [],
    });
    rt.join(agent);
    agents.set(userId, agent);
  }
  return agent;
}

const INSTRUCTION = `Ti si inteligentni asistent za upravljanje zalihama u aplikaciji Stock.app.
Odgovaraj kratko, jasno i na jeziku korisnika. Brojke i stanje zaliha uzimaj isključivo iz alata.
Za bilo kakvu izmenu ili dopunu zaliha, obavezno koristi alat propose_stock_update i jasno reci korisniku da potvrdi izmenu.`;