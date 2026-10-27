export type StockUpdateProposalStatus = "pending" | "approved" | "rejected" | "error"

export interface StockUpdateProposal {
  action: "PROPOSE_UPDATE"
  productId: string
  productName: string
  sku?: string | null
  oldQuantity: number
  newQuantity: number
  reason: string
}

export interface StockUpdateProposalEvent extends StockUpdateProposal {
  proposalId: string
}

export function isStockUpdateProposal(value: unknown): value is StockUpdateProposal {
  if (!value || typeof value !== "object") return false
  const proposal = value as Record<string, unknown>
  const sku = proposal.sku

  return (
    proposal.action === "PROPOSE_UPDATE" &&
    typeof proposal.productId === "string" &&
    proposal.productId.length > 0 &&
    typeof proposal.productName === "string" &&
    proposal.productName.length > 0 &&
    (sku === undefined || sku === null || typeof sku === "string") &&
    typeof proposal.oldQuantity === "number" &&
    Number.isInteger(proposal.oldQuantity) &&
    proposal.oldQuantity >= 0 &&
    typeof proposal.newQuantity === "number" &&
    Number.isInteger(proposal.newQuantity) &&
    proposal.newQuantity >= 0 &&
    typeof proposal.reason === "string"
  )
}

export function isStockUpdateProposalEvent(value: unknown): value is StockUpdateProposalEvent {
  if (!isStockUpdateProposal(value)) return false
  return typeof (value as StockUpdateProposalEvent).proposalId === "string"
}
