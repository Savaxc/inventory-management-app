'use client'

import { useState } from "react"

interface Message {
  role: "user" | "assistant" | "tool"
  content: string
  proposal?: {
    productId: string
    productName: string
    oldQuantity: number
    newQuantity: number
    reason: string
  }
}

export function StockAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

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
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        let currentEventType = ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          const lineParts = trimmed.split("\n")
          for (const subLine of lineParts) {
            if (subLine.startsWith("event: ")) {
              currentEventType = subLine.replace("event: ", "").trim()
            } else if (subLine.startsWith("data: ")) {
              try {
                const jsonStr = subLine.replace("data: ", "")
                const data = JSON.parse(jsonStr)

                if (currentEventType === "tool") {
                  setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: "tool", content: `Izvršavam alat: ${data}...` },
                    { role: "assistant", content: "" }
                  ])
                } else if (currentEventType === "answer" || typeof data === "string") {
                  setMessages((prev) => {
                    const copy = [...prev]
                    copy[copy.length - 1] = { role: "assistant", content: data }
                    return copy
                  })
                }
              } catch (e) {
                console.error("Greška pri parsiranju SSE data:", e)
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
    }
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white shadow-md p-4 max-w-md w-full">
      <div className="font-bold text-lg border-b pb-2 mb-3 flex items-center justify-between">
        <span>🤖 Stock Asistent</span>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-20">
            Pitaj me bilo šta o zalihama, npr. &quot;Šta mi je pri kraju?&quot;
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              m.role === "user"
                ? "bg-blue-50 text-blue-900 ml-8"
                : m.role === "tool"
                ? "bg-gray-100 text-gray-600 text-xs italic text-center"
                : "bg-gray-50 text-gray-800 mr-8 border"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-xs italic">Asistent razmišlja...</div>}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Unesi poruku..."
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Pošalji
        </button>
      </form>
    </div>
  )
}