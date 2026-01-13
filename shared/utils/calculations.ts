export interface LineItemInput {
  quantity: number
  unit_price: number
}

export interface InvoiceTotals {
  subtotalCents: number
  discountCents: number
  taxCents: number
  totalCents: number
}

export function calculateLineItemAmount(
  quantity: number,
  unitPrice: number
): number {
  return Math.round(quantity * unitPrice * 100)
}

export function calculateSubtotal(items: LineItemInput[]): number {
  return items.reduce(
    (sum, item) => sum + calculateLineItemAmount(item.quantity, item.unit_price),
    0
  )
}

export function calculateDiscount(
  subtotalCents: number,
  discountType: 'fixed' | 'percentage',
  discountValue: number
): number {
  if (discountValue <= 0) return 0

  if (discountType === 'percentage') {
    return Math.round(subtotalCents * (discountValue / 100))
  }

  return Math.round(discountValue * 100)
}

export function calculateTax(
  amountCents: number,
  taxRate: number
): number {
  if (taxRate <= 0) return 0
  return Math.round(amountCents * (taxRate / 100))
}

export function calculateInvoiceTotals(
  items: LineItemInput[],
  taxRate: number = 0,
  discountType: 'fixed' | 'percentage' = 'fixed',
  discountValue: number = 0
): InvoiceTotals {
  const subtotalCents = calculateSubtotal(items)
  const discountCents = calculateDiscount(subtotalCents, discountType, discountValue)
  const afterDiscount = subtotalCents - discountCents
  const taxCents = calculateTax(afterDiscount, taxRate)
  const totalCents = afterDiscount + taxCents

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
  }
}
