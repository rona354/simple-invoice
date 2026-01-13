export async function generateInvoiceNumber(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<string> {
  const year = new Date().getFullYear()

  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${year}-01-01`)

  if (error) {
    throw new Error(`Failed to generate invoice number: ${error.message}`)
  }

  const seq = (count ?? 0) + 1
  return `INV-${year}-${seq.toString().padStart(4, '0')}`
}

export function calculateDueDate(paymentTerms: number = 30): string {
  const date = new Date()
  date.setDate(date.getDate() + paymentTerms)
  return date.toISOString().split('T')[0]
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'paid' || status === 'cancelled') {
    return false
  }

  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return due < today
}

export function getInvoiceDisplayStatus(
  status: string,
  dueDate: string | null
): string {
  if (isOverdue(dueDate, status) && status === 'sent') {
    return 'overdue'
  }
  return status
}
