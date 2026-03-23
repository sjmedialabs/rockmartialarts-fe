/**
 * Human-readable payment source for admin/student UIs.
 * Registration uses Razorpay while the API stores payment_method as digital_wallet.
 */
const METHOD_LABELS: Record<string, string> = {
  digital_wallet: "Razorpay",
  credit_card: "Credit card",
  debit_card: "Debit card",
  upi: "UPI",
  net_banking: "Net banking",
  cash: "Cash",
  bank_transfer: "Bank transfer",
}

export function formatPaymentSourceLabel(payment: {
  payment_method?: string
  notes?: string
  transaction_id?: string
}): string {
  const notes = String(payment.notes ?? "")
  if (/razorpay/i.test(notes)) return "Razorpay"
  const tid = String(payment.transaction_id ?? "")
  if (tid.startsWith("pay_")) return "Razorpay"
  const method = String(payment.payment_method ?? "").toLowerCase()
  if (method === "digital_wallet") return "Razorpay"
  if (METHOD_LABELS[method]) return METHOD_LABELS[method]
  if (method) return method.replace(/_/g, " ")
  if (tid) return `Ref: ${tid}`
  return "Unknown"
}
