import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { GuestInvoice } from './types'
import { calculateInvoiceTotals } from '@/shared/utils'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

const COLORS = {
  accent: { r: 37, g: 99, b: 235 },
  text: { r: 17, g: 24, b: 39 },
  textSecondary: { r: 75, g: 85, b: 99 },
  muted: { r: 156, g: 163, b: 175 },
  bgSubtle: { r: 249, g: 250, b: 251 },
  bgBlue: { r: 239, g: 246, b: 255 },
  border: { r: 229, g: 231, b: 235 },
  borderDark: { r: 17, g: 24, b: 39 },
} as const

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function renderGuestInvoiceToBuffer(invoice: GuestInvoice): Buffer {
  const doc = new jsPDF()

  const itemsForCalc = invoice.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))
  const totals = calculateInvoiceTotals(itemsForCalc, invoice.tax_rate, 'fixed', 0)

  let y = 0

  // Guest mode watermark bar (light red background, dark red text)
  doc.setFillColor(254, 226, 226) // light red bg (like red-100)
  doc.rect(0, 0, PAGE_WIDTH, 14, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(153, 27, 27) // dark red text (like red-800)
  doc.text('simple-invoice-chi.vercel.app guest mode', PAGE_WIDTH / 2, 9, { align: 'center' })

  y = 14 + MARGIN

  // === HEADER SECTION ===
  const headerStartY = y

  // Left side: From (Business) Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(invoice.from.name, MARGIN, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)

  if (invoice.from.address) {
    const addressLines = doc.splitTextToSize(invoice.from.address, 80)
    doc.text(addressLines, MARGIN, y)
    y += addressLines.length * 4
  }
  if (invoice.from.email) {
    y += 1
    doc.text(invoice.from.email, MARGIN, y)
    y += 4
  }
  if (invoice.from.phone) {
    doc.text(invoice.from.phone, MARGIN, y)
    y += 4
  }

  // Right side: Invoice Title & Meta
  let rightY = headerStartY
  const rightX = PAGE_WIDTH - MARGIN

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text('INVOICE', rightX, rightY, { align: 'right' })
  rightY += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)
  doc.text(invoice.number, rightX, rightY, { align: 'right' })
  rightY += 10

  doc.setFontSize(9)
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text('Issue Date', rightX - 35, rightY)
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.setFont('helvetica', 'bold')
  doc.text(formatDate(invoice.date), rightX, rightY, { align: 'right' })
  rightY += 5

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text('Due Date', rightX - 35, rightY)
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.setFont('helvetica', 'bold')
  doc.text(formatDate(invoice.due_date), rightX, rightY, { align: 'right' })

  y = Math.max(y, rightY) + 15

  // Separator line
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 8

  const billToStartY = y

  // Bill To (left)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text('BILL TO', MARGIN, y)
  y += 5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(invoice.to.name, MARGIN, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)

  if (invoice.to.address) {
    const addressLines = doc.splitTextToSize(invoice.to.address, 80)
    doc.text(addressLines, MARGIN, y)
    y += addressLines.length * 4
  }
  if (invoice.to.email) {
    y += 1
    doc.text(invoice.to.email, MARGIN, y)
    y += 4
  }

  // Amount Due Box (right)
  const boxWidth = 70
  const boxHeight = 28
  const boxX = PAGE_WIDTH - MARGIN - boxWidth
  const boxY = billToStartY - 2

  doc.setFillColor(COLORS.bgSubtle.r, COLORS.bgSubtle.g, COLORS.bgSubtle.b)
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text('AMOUNT DUE', boxX + boxWidth / 2, boxY + 6, { align: 'center' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(formatCurrency(totals.totalCents, invoice.currency), boxX + boxWidth / 2, boxY + 15, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text(`Due ${formatDate(invoice.due_date)}`, boxX + boxWidth / 2, boxY + 22, { align: 'center' })

  y = Math.max(y, boxY + boxHeight) + 8

  // Separator line
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 10

  // === LINE ITEMS TABLE ===
  const tableData = invoice.items.map((item) => [
    item.description,
    String(item.quantity),
    formatCurrency(Math.round(item.unit_price * 100), invoice.currency),
    formatCurrency(Math.round(item.quantity * item.unit_price * 100), invoice.currency),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData.length > 0 ? tableData : [['No items', '', '', '']],
    theme: 'plain',
    styles: {
      cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
      fontSize: 9,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [COLORS.bgSubtle.r, COLORS.bgSubtle.g, COLORS.bgSubtle.b],
      textColor: [COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 22, halign: 'center', textColor: [COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b] },
      2: { cellWidth: 32, halign: 'right', textColor: [COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b] },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: [COLORS.border.r, COLORS.border.g, COLORS.border.b],
    tableLineWidth: 0.2,
    didDrawCell: (data) => {
      if (data.section === 'head') {
        doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
        doc.setLineWidth(0.3)
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
      }
    },
  })

  const lastAutoTable = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
  y = (lastAutoTable?.finalY ?? y + 50) + 15

  // === TOTALS SECTION ===
  const totalsX = PAGE_WIDTH - MARGIN - 80
  const valuesX = PAGE_WIDTH - MARGIN

  doc.setFontSize(9)
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text('Subtotal', totalsX, y)
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(formatCurrency(totals.subtotalCents, invoice.currency), valuesX, y, { align: 'right' })
  y += 6

  if (totals.taxCents > 0) {
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(`Tax (${invoice.tax_rate}%)`, totalsX, y)
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
    doc.text(formatCurrency(totals.taxCents, invoice.currency), valuesX, y, { align: 'right' })
    y += 6
  }

  // Total line
  y += 2
  doc.setDrawColor(COLORS.borderDark.r, COLORS.borderDark.g, COLORS.borderDark.b)
  doc.setLineWidth(0.5)
  doc.line(totalsX - 5, y, valuesX, y)
  y += 6

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text('Total', totalsX, y)
  doc.setFontSize(13)
  doc.text(formatCurrency(totals.totalCents, invoice.currency), valuesX, y, { align: 'right' })
  y += 20

  // === NOTES SECTION ===
  if (invoice.notes) {
    const contentLines = doc.splitTextToSize(invoice.notes, CONTENT_WIDTH - 16)
    const noteBoxHeight = 12 + contentLines.length * 4 + 8

    doc.setFillColor(COLORS.bgSubtle.r, COLORS.bgSubtle.g, COLORS.bgSubtle.b)
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, noteBoxHeight, 2, 2, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text('NOTES', MARGIN + 8, y + 8)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)
    doc.text(contentLines, MARGIN + 8, y + 16)
  }


  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
