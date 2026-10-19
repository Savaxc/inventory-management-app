/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { createHuman, SituationSpecification, type SituationContext } from "@mozaik-ai/core";
import { rt, agentFor } from "@/lib/assistant/runtime";

export const runtime = "nodejs";

class FromAgent extends SituationSpecification {
  constructor(private agentId: string) { super(); }
  isSatisfiedBy({ event }: SituationContext) {
    return event.producerId === this.agentId &&
      (event.type === "function_call.started" || event.type === "model.answer" || event.type === "inference.delta");
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { message } = await req.json();
  const agent = agentFor(userId);
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (type: string, data: unknown) =>
        controller.enqueue(enc.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));

      const listener = createHuman({
        name: `ui-${userId}`,
        capabilities: [],
        handlers: [{
          specification: new FromAgent(agent.getId()),
          processor: {
            apply({ event }) {
              const p = event.payload as any;
              console.log("Mozaik Event:", event.type, JSON.stringify(p, null, 2));

              if (event.type === "function_call.started") {
                send("tool", p.call?.name);
              }
              if (event.type === "inference.delta") {
                if (p.delta?.content) {
                  send("answer", p.delta.content);
                }
              }
              if (event.type === "model.answer") {
                const text = p.answer?.content?.text || p.content?.text || "Odgovor je uspešno generisan.";
                send("answer", text);
                rt.leave(listener);
                controller.close();
              }
            },
          },
        }],
      });
      rt.join(listener);

      try {
        rt.runLoop(agent.getId(), message, {
          model: "deepseek-flash",
          context: agent.getMemory().getContext(),
          tools: agent.getTools(),
        });
      } catch (err) {
        console.error("Greška pri pokretanju runLoop-a:", err);
        send("answer", "Došlo je do greške u AI asistentu.");
        rt.leave(listener);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 
      "Content-Type": "text/event-stream", 
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    },
  });
}