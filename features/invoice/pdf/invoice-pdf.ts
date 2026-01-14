import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { InvoiceWithProfile } from '../types'
import { createTranslator, getLocaleFromString, type Locale } from '@/shared/i18n'
import { getLanguageLocale, getCurrencyLocale } from '@/shared/utils'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
const FOOTER_MARGIN = 25

const COLORS = {
  accent: { r: 37, g: 99, b: 235 },
  text: { r: 17, g: 24, b: 39 },
  textSecondary: { r: 75, g: 85, b: 99 },
  muted: { r: 156, g: 163, b: 175 },
  danger: { r: 220, g: 38, b: 38 },
  success: { r: 5, g: 150, b: 105 },
  bgSubtle: { r: 249, g: 250, b: 251 },
  bgBlue: { r: 239, g: 246, b: 255 },
  border: { r: 229, g: 231, b: 235 },
  borderDark: { r: 17, g: 24, b: 39 },
} as const

function formatCurrency(cents: number, currency: string): string {
  const locale = getCurrencyLocale(currency)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDate(dateString: string, language: Locale): string {
  const locale = getLanguageLocale(language)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

function checkPageOverflow(doc: jsPDF, y: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + requiredSpace > pageHeight - FOOTER_MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

export async function renderInvoiceToBuffer(invoice: InvoiceWithProfile, locale?: Locale): Promise<Buffer> {
  const doc = new jsPDF()
  const { profile } = invoice

  const language = locale || getLocaleFromString(invoice.language)
  const t = createTranslator(language)

  const isPaid = invoice.status === 'paid'
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid

  let y = 0

  // Accent bar at top
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
  doc.rect(0, 0, PAGE_WIDTH, 4, 'F')
  y = 4 + MARGIN

  // === HEADER SECTION ===
  const headerStartY = y

  // Left side: Business Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  if (profile.business_name) {
    doc.text(profile.business_name, MARGIN, y)
    y += 5
  }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)

  if (profile.business_address) {
    doc.text(profile.business_address, MARGIN, y)
    y += 4
  }
  if (profile.business_city || profile.business_postal_code) {
    const cityLine = [profile.business_city, profile.business_postal_code].filter(Boolean).join(', ')
    doc.text(cityLine, MARGIN, y)
    y += 4
  }
  if (profile.business_country) {
    doc.text(profile.business_country, MARGIN, y)
    y += 4
  }
  if (profile.business_email) {
    y += 2
    doc.text(profile.business_email, MARGIN, y)
    y += 4
  }
  if (profile.business_phone) {
    doc.text(profile.business_phone, MARGIN, y)
    y += 4
  }
  if (profile.tax_id) {
    y += 2
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(`${profile.tax_id_label}: ${profile.tax_id}`, MARGIN, y)
    y += 4
  }

  // Right side: Invoice Title & Meta
  let rightY = headerStartY
  const rightX = PAGE_WIDTH - MARGIN

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(t('invoice.title'), rightX, rightY, { align: 'right' })
  rightY += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)
  doc.text(invoice.invoice_number, rightX, rightY, { align: 'right' })
  rightY += 10

  doc.setFontSize(9)
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text(t('invoice.issueDate'), rightX - 35, rightY)
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.setFont('helvetica', 'bold')
  doc.text(formatDate(invoice.issue_date, language), rightX, rightY, { align: 'right' })
  rightY += 5

  if (invoice.due_date) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(t('invoice.dueDate'), rightX - 35, rightY)
    if (isOverdue) {
      doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b)
    } else {
      doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
    }
    doc.setFont('helvetica', 'bold')
    doc.text(formatDate(invoice.due_date, language), rightX, rightY, { align: 'right' })
    rightY += 5
  }

  y = Math.max(y, rightY) + 10

  // === BILL TO + AMOUNT DUE SECTION ===
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
  doc.text(t('invoice.billTo'), MARGIN, y)
  y += 5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(invoice.client_name, MARGIN, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)

  if (invoice.client_address) {
    const addressLines = doc.splitTextToSize(invoice.client_address, 80)
    doc.text(addressLines, MARGIN, y)
    y += addressLines.length * 4
  }
  if (invoice.client_email) {
    y += 1
    doc.text(invoice.client_email, MARGIN, y)
    y += 4
  }
  if (invoice.client_phone) {
    doc.text(invoice.client_phone, MARGIN, y)
    y += 4
  }
  if (invoice.client_tax_id) {
    y += 1
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(`${t('invoice.clientTaxId')}: ${invoice.client_tax_id}`, MARGIN, y)
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
  doc.text(isPaid ? t('invoice.amountPaid') : t('invoice.amountDue'), boxX + boxWidth / 2, boxY + 6, { align: 'center' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  if (isPaid) {
    doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b)
  } else {
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  }
  doc.text(formatCurrency(invoice.total_cents, invoice.currency), boxX + boxWidth / 2, boxY + 15, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  if (isPaid && invoice.paid_date) {
    doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b)
    doc.text(`${t('invoice.paid')} ${formatDate(invoice.paid_date, language)}`, boxX + boxWidth / 2, boxY + 22, { align: 'center' })
  } else if (invoice.due_date) {
    if (isOverdue) {
      doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b)
      doc.text(t('invoice.overdue'), boxX + boxWidth / 2, boxY + 22, { align: 'center' })
    } else {
      doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
      doc.text(`${t('invoice.due')} ${formatDate(invoice.due_date, language)}`, boxX + boxWidth / 2, boxY + 22, { align: 'center' })
    }
  }

  y = Math.max(y, boxY + boxHeight) + 8

  // Separator line
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 10

  // === LINE ITEMS TABLE ===
  const tableData = invoice.items.map((item) => [
    item.description + (item.unit ? ` (${item.unit})` : ''),
    String(item.quantity),
    formatCurrency(item.unit_price_cents, invoice.currency),
    formatCurrency(item.amount_cents, invoice.currency),
  ])

  autoTable(doc, {
    startY: y,
    head: [[t('invoice.description'), t('invoice.quantity'), t('invoice.rate'), t('invoice.amount')]],
    body: tableData.length > 0 ? tableData : [[t('invoice.noItems'), '', '', '']],
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [COLORS.muted.r, COLORS.muted.g, COLORS.muted.b],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3, bottom: 6, left: 0, right: 0 },
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
      fontSize: 10,
      cellPadding: { top: 4, bottom: 4, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center', textColor: [COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b] },
      2: { cellWidth: 30, halign: 'right', textColor: [COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b] },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: [COLORS.border.r, COLORS.border.g, COLORS.border.b],
    tableLineWidth: 0.3,
    didDrawCell: (data) => {
      if (data.section === 'head') {
        doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
        doc.setLineWidth(0.5)
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
      }
    },
  })

  const lastAutoTable = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
  y = (lastAutoTable?.finalY ?? y + 50) + 15

  y = checkPageOverflow(doc, y, 50)

  // === TOTALS SECTION ===
  const totalsX = PAGE_WIDTH - MARGIN - 80
  const valuesX = PAGE_WIDTH - MARGIN

  doc.setFontSize(9)
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
  doc.text(t('invoice.subtotal'), totalsX, y)
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.text(formatCurrency(invoice.subtotal_cents, invoice.currency), valuesX, y, { align: 'right' })
  y += 6

  if (invoice.discount_cents > 0) {
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    const discountLabel = invoice.discount_type === 'percentage'
      ? t('invoice.discountPercent', { value: invoice.discount_value })
      : t('invoice.discount')
    doc.text(discountLabel, totalsX, y)
    doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b)
    doc.text(`-${formatCurrency(invoice.discount_cents, invoice.currency)}`, valuesX, y, { align: 'right' })
    y += 6
  }

  if (invoice.tax_cents > 0) {
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(t('invoice.taxPercent', { value: invoice.tax_rate }), totalsX, y)
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
    doc.text(formatCurrency(invoice.tax_cents, invoice.currency), valuesX, y, { align: 'right' })
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
  doc.text(t('invoice.total'), totalsX, y)
  doc.setFontSize(13)
  doc.text(formatCurrency(invoice.total_cents, invoice.currency), valuesX, y, { align: 'right' })
  y += 20

  // === NOTES SECTIONS ===
  doc.setFont('helvetica', 'normal')

  if (invoice.payment_instructions) {
    y = checkPageOverflow(doc, y, 30)
    const contentLines = doc.splitTextToSize(invoice.payment_instructions, CONTENT_WIDTH - 16)
    const boxHeight = 12 + contentLines.length * 4 + 8

    doc.setFillColor(COLORS.bgBlue.r, COLORS.bgBlue.g, COLORS.bgBlue.b)
    doc.setDrawColor(219, 234, 254)
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxHeight, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(29, 78, 216)
    doc.text(t('invoice.paymentInstructions'), MARGIN + 8, y + 8)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 58, 138)
    doc.text(contentLines, MARGIN + 8, y + 16)

    y += boxHeight + 8
  }

  if (invoice.notes) {
    y = checkPageOverflow(doc, y, 30)
    const contentLines = doc.splitTextToSize(invoice.notes, CONTENT_WIDTH - 16)
    const boxHeight = 12 + contentLines.length * 4 + 8

    doc.setFillColor(COLORS.bgSubtle.r, COLORS.bgSubtle.g, COLORS.bgSubtle.b)
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxHeight, 2, 2, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(t('invoice.notes'), MARGIN + 8, y + 8)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textSecondary.r, COLORS.textSecondary.g, COLORS.textSecondary.b)
    doc.text(contentLines, MARGIN + 8, y + 16)

    y += boxHeight + 8
  }

  if (invoice.terms) {
    y = checkPageOverflow(doc, y, 25)
    const contentLines = doc.splitTextToSize(invoice.terms, CONTENT_WIDTH)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(t('invoice.termsAndConditions'), MARGIN, y)
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(contentLines, MARGIN, y)
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  if (invoice.footer) {
    doc.setFontSize(8)
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.text(invoice.footer, PAGE_WIDTH / 2, pageHeight - 12, { align: 'center' })
  }

  // Branding footer
  const brandY = pageHeight - 8
  const brandX = PAGE_WIDTH - MARGIN
  doc.setFillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b)
  doc.roundedRect(brandX - 28, brandY - 5, 28, 7, 1, 1, 'F')
  doc.setFontSize(5)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('SI', brandX - 25, brandY, { align: 'left' })
  doc.setFontSize(5)
  doc.text('Simple Invoice', brandX - 20, brandY, { align: 'left' })

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
