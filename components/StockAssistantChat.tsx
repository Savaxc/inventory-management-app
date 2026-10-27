'use client'

import { useState, useEffect, useRef } from "react"
import { Bot, X, Send, Trash2, Sparkles } from "lucide-react"
import { confirmStockUpdate } from "@/app/actions/stock"
import { StockUpdateApprovalCard } from "@/components/stock-update-approval-card"
import {
  isStockUpdateProposal,
  type StockUpdateProposal,
  type StockUpdateProposalStatus,
} from "@/lib/assistant/proposals"

interface TextMessage {
  role: "user" | "assistant" | "tool"
  content: string
}

interface ProposalMessage {
  role: "proposal"
  id: string
  proposal: StockUpdateProposal
  status: StockUpdateProposalStatus
  error?: string
}

type Message = TextMessage | ProposalMessage

const STORAGE_KEY = "stock_app_assistant_messages"

const TOOL_LABELS: Record<string, string> = {
  find_products: "Pretražujem proizvode",
  get_low_stock: "Proveravam zalihe na izmaku",
  get_inventory_summary: "Računam sumu zaliha",
  get_recent_activity: "Čitam dnevnik aktivnosti",
  generate_restock_plan: "Pripremam plan dopune",
  propose_stock_update: "Pripremam predlog izmene zaliha",
}

function isProposalStatus(value: unknown): value is StockUpdateProposalStatus {
  return (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "error"
  )
}

function normalizeStoredMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item): Message[] => {
    if (!item || typeof item !== "object") return []
    const message = item as Record<string, unknown>

    if (
      (message.role === "user" ||
        message.role === "assistant" ||
        message.role === "tool") &&
      typeof message.content === "string"
    ) {
      return [{ role: message.role, content: message.content }]
    }

    if (
      message.role === "proposal" &&
      typeof message.id === "string" &&
      isStockUpdateProposal(message.proposal) &&
      isProposalStatus(message.status)
    ) {
      return [
        {
          role: "proposal",
          id: message.id,
          proposal: message.proposal,
          status: message.status,
          error: typeof message.error === "string" ? message.error : undefined,
        },
      ]
    }

    return []
  })
}

export function StockAssistantChat() {
  const [isOpen, setIsOpen] = useState(false)
  // Početno stanje je isto na serveru i klijentu (prazan niz) da ne bi bilo hydration greške
  const [messages, setMessages] = useState<Message[]>([])
  const [hydrated, setHydrated] = useState(false)

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Učitavanje istorije iz localStorage (samo na klijentu, posle hidratacije)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setMessages(normalizeStoredMessages(JSON.parse(saved)))
      }
    } catch (e) {
      console.error("Greška pri učitavanju istorije poruka:", e)
    }
    setHydrated(true)
  }, [])

  // Čuvanje u localStorage (tek kad je učitavanje završeno)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.error("Greška pri čuvanju istorije poruka:", e)
    }
  }, [messages, hydrated])

  // Automatsko skrolovanje na najnoviju poruku
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const clearChat = () => {
    setMessages([])
    setApprovingId(null)
    localStorage.removeItem(STORAGE_KEY)
    // Briše i serversku memoriju (agent u RAM-u + istorija u bazi)
    fetch("/api/assistant", { method: "DELETE" }).catch((e) =>
      console.error("Greška pri brisanju memorije asistenta:", e),
    )
  }

  const setProposalStatus = (
    id: string,
    status: StockUpdateProposalStatus,
    error?: string,
  ) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.role === "proposal" && message.id === id
          ? { ...message, status, error }
          : message,
      ),
    )
  }

  const handleApprove = async (message: ProposalMessage) => {
    if (
      approvingId ||
      (message.status !== "pending" && message.status !== "error")
    ) {
      return
    }

    setApprovingId(message.id)
    setProposalStatus(message.id, "pending")

    try {
      const result = await confirmStockUpdate(
        message.proposal.productId,
        message.proposal.newQuantity,
        message.proposal.reason,
        message.proposal.oldQuantity,
      )

      if (result.success) {
        setProposalStatus(message.id, "approved")
      } else {
        setProposalStatus(message.id, "error", result.error)
      }
    } catch (err) {
      console.error("Greška pri odobravanju izmene zaliha:", err)
      setProposalStatus(
        message.id,
        "error",
        "Izmena nije primenjena. Pokušaj ponovo.",
      )
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = (message: ProposalMessage) => {
    if (
      approvingId ||
      (message.status !== "pending" && message.status !== "error")
    ) {
      return
    }

    setProposalStatus(message.id, "rejected")
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      })

      if (!res.ok || !res.body) throw new Error("Greška u komunikaciji sa asistentom.")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split("\n\n")
        buffer = blocks.pop() || ""

        for (const block of blocks) {
          const trimmed = block.trim()
          if (!trimmed) continue

          // Tip događaja se resetuje za svaki SSE blok
          let currentEventType = ""

          for (const subLine of trimmed.split("\n")) {
            if (subLine.startsWith("event: ")) {
              currentEventType = subLine.replace("event: ", "").trim()
            } else if (subLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(subLine.replace("data: ", ""))

                if (currentEventType === "tool") {
                  const toolName = String(data)
                  const toolLabel =
                    TOOL_LABELS[toolName] ?? `Izvršavam alat: ${toolName}`

                  setMessages((prev) => {
                    const last = prev[prev.length - 1]
                    const base =
                      last?.role === "assistant" && last.content === ""
                        ? prev.slice(0, -1)
                        : prev
                    return [
                      ...base,
                      { role: "tool", content: `${toolLabel}...` },
                      { role: "assistant", content: "" },
                    ]
                  })
                } else if (currentEventType === "proposal") {
                  if (!isStockUpdateProposal(data)) continue

                  const raw = data as unknown as Record<string, unknown>
                  const proposalId =
                    typeof raw.proposalId === "string" && raw.proposalId
                      ? raw.proposalId
                      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

                  const proposal: StockUpdateProposal = {
                    action: data.action,
                    productId: data.productId,
                    productName: data.productName,
                    sku: data.sku ?? null,
                    oldQuantity: data.oldQuantity,
                    newQuantity: data.newQuantity,
                    reason: data.reason,
                  }

                  setMessages((prev) => {
                    if (
                      prev.some(
                        (message) =>
                          message.role === "proposal" &&
                          message.id === proposalId,
                      )
                    ) {
                      return prev
                    }

                    const last = prev[prev.length - 1]
                    const base =
                      last?.role === "assistant" && last.content === ""
                        ? prev.slice(0, -1)
                        : prev

                    return [
                      ...base,
                      {
                        role: "proposal",
                        id: proposalId,
                        proposal,
                        status: "pending",
                      },
                      { role: "assistant", content: "" },
                    ]
                  })
                } else if (currentEventType === "delta") {
                  // Streaming: dopisuj tekst u poslednju poruku asistenta
                  setMessages((prev) => {
                    const copy = [...prev]
                    const last = copy[copy.length - 1]
                    if (last?.role === "assistant") {
                      copy[copy.length - 1] = {
                        ...last,
                        content: last.content + String(data),
                      }
                    } else {
                      copy.push({ role: "assistant", content: String(data) })
                    }
                    return copy
                  })
                } else if (currentEventType === "answer") {
                  // Finalni tekst zamenjuje ono što je stiglo kroz delta događaje
                  setMessages((prev) => {
                    const copy = [...prev]
                    const last = copy[copy.length - 1]
                    if (last?.role === "assistant") {
                      copy[copy.length - 1] = {
                        role: "assistant",
                        content: String(data),
                      }
                    } else {
                      copy.push({ role: "assistant", content: String(data) })
                    }
                    return copy
                  })
                }
              } catch (err) {
                console.error("Greška pri parsiranju SSE data:", err)
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Došlo je do greške pri obradi zahteva." },
      ])
    } finally {
      setLoading(false)
      // Ukloni eventualne prazne balončiće (npr. prekinut stream)
      setMessages((prev) =>
        prev.filter(
          (message) =>
            !(message.role === "assistant" && message.content === ""),
        ),
      )
    }
  }

  const lastMessage = messages[messages.length - 1]
  const showThinking =
    loading && !(lastMessage?.role === "assistant" && lastMessage.content)
  const hasPendingApproval = messages.some(
    (message) => message.role === "proposal" && message.status === "pending",
  )

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Stock Asistent</h3>
                <p className="text-[10px] text-purple-100">Mozaik AI (DeepSeek)</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  title="Očisti razgovor"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-purple-100 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-purple-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 my-auto pt-16">
                <Bot className="w-10 h-10 mx-auto mb-2 text-purple-300" />
                <p className="font-medium text-gray-600 text-sm mb-1">Zdravo! Kako mogu da pomognem?</p>
                <p className="text-[11px] px-4">Pitaj me npr. &quot;Koji proizvodi su na izmaku?&quot; ili &quot;Prikaži sumu zaliha&quot;.</p>
              </div>
            )}

            {messages.map((m, idx) => {
              if (m.role === "proposal") {
                return (
                  <div key={m.id} className="w-full">
                    <StockUpdateApprovalCard
                      proposal={m.proposal}
                      status={m.status}
                      error={m.error}
                      isSubmitting={approvingId === m.id}
                      onApprove={() => handleApprove(m)}
                      onReject={() => handleReject(m)}
                    />
                  </div>
                )
              }

              return (
                <div
                  key={`${m.role}-${idx}`}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      m.role === "user"
                        ? "bg-purple-600 text-white rounded-br-none shadow-sm"
                        : m.role === "tool"
                        ? "bg-gray-200/80 text-gray-600 italic text-[11px] text-center w-full py-1.5"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              )
            })}
            {showThinking && (
              <div className="flex items-center space-x-2 text-purple-600 text-[11px] bg-white border border-purple-100 p-2.5 rounded-xl w-max shadow-sm">
                <Bot className="w-4 h-4 animate-bounce text-purple-600" />
                <span>Asistent analizira podatke...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Postavi pitanje..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Dugme (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none ring-4 ring-purple-100 active:scale-95"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-6 h-6" />
            {/* Indikator ako ima poruka / predloga koji čeka odobrenje */}
            {messages.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                  hasPendingApproval
                    ? "bg-amber-400 animate-pulse"
                    : "bg-green-500"
                }`}
              ></span>
            )}
          </>
        )}
      </button>
    </div>
  )
}
