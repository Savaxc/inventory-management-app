'use client'

import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  Package,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react"
import type {
  StockUpdateProposal,
  StockUpdateProposalStatus,
} from "@/lib/assistant/proposals"

interface StockUpdateApprovalCardProps {
  proposal: StockUpdateProposal
  status: StockUpdateProposalStatus
  error?: string
  isSubmitting: boolean
  onApprove: () => void
  onReject: () => void
}

const STATUS_BADGES: Record<
  StockUpdateProposalStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Čeka odobrenje",
    className: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Odobreno",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Odbijeno",
    className: "bg-gray-100 text-gray-500",
  },
  error: {
    label: "Greška",
    className: "bg-red-100 text-red-700",
  },
}

export function StockUpdateApprovalCard({
  proposal,
  status,
  error,
  isSubmitting,
  onApprove,
  onReject,
}: StockUpdateApprovalCardProps) {
  const badge = STATUS_BADGES[status]
  const delta = proposal.newQuantity - proposal.oldQuantity
  const canDecide = status === "pending" || status === "error"

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-purple-50 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <div className="shrink-0 rounded-lg bg-purple-100 p-1.5 text-purple-700">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-900">
              AI predlaže izmenu zaliha
            </p>
            <p className="text-[10px] leading-snug text-gray-500">
              Primenjuje se samo nakon tvoje potvrde.
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div className="flex items-center gap-2">
          <div className="shrink-0 rounded-lg bg-gray-100 p-1.5 text-gray-500">
            <Package className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-900">
              {proposal.productName}
            </p>
            <p className="truncate text-[10px] text-gray-400">
              {proposal.sku || "Bez SKU šifre"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wide text-gray-400">Sada</p>
            <p className="text-lg font-semibold text-gray-700">
              {proposal.oldQuantity}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-purple-400" />
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wide text-purple-500">
              Novo
            </p>
            <p className="text-lg font-semibold text-purple-700">
              {proposal.newQuantity}
            </p>
          </div>
          {delta !== 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                delta > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-2.5 py-2">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Razlog
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600">
            {proposal.reason || "Nije naveden razlog."}
          </p>
        </div>

        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-[11px] font-medium text-purple-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Primenjujem izmenu...
          </div>
        ) : canDecide ? (
          <div className="space-y-2">
            {status === "error" && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error || "Izmena nije primenjena. Pokušaj ponovo."}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApprove}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:scale-[0.98]"
              >
                {status === "error" ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {status === "error" ? "Pokušaj ponovo" : "Odobri"}
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              >
                <X className="h-3.5 w-3.5" />
                Odbij
              </button>
            </div>
          </div>
        ) : status === "approved" ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            Odobreno — zaliha je ažurirana.
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
            <X className="h-4 w-4 shrink-0" />
            Predlog je odbijen. Zaliha nije promenjena.
          </div>
        )}
      </div>
    </div>
  )
}
