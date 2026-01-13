import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { InvoiceWithProfile } from '../types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  businessInfo: {
    textAlign: 'right',
    maxWidth: 200,
  },
  businessName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    color: '#111827',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metaColumn: {
    maxWidth: '45%',
  },
  metaLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 10,
    marginBottom: 8,
  },
  clientSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colDescription: {
    flex: 3,
  },
  colQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  colRate: {
    flex: 1,
    textAlign: 'right',
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginLeft: 'auto',
    width: 200,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    color: '#6b7280',
  },
  totalValue: {
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#111827',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    color: '#374151',
  },
  notesText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})

interface InvoicePdfProps {
  invoice: InvoiceWithProfile
}

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

export function InvoicePdf({ invoice }: InvoicePdfProps) {
  const { profile } = invoice

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {profile.logo_url && (
              <Image src={profile.logo_url} style={styles.logo} />
            )}
          </View>
          <View style={styles.businessInfo}>
            {profile.business_name && (
              <Text style={styles.businessName}>{profile.business_name}</Text>
            )}
            {profile.business_address && <Text>{profile.business_address}</Text>}
            {(profile.business_city || profile.business_postal_code) && (
              <Text>
                {[profile.business_city, profile.business_postal_code]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            )}
            {profile.business_country && <Text>{profile.business_country}</Text>}
            {profile.business_email && <Text>{profile.business_email}</Text>}
            {profile.business_phone && <Text>{profile.business_phone}</Text>}
            {profile.tax_id && (
              <Text>
                {profile.tax_id_label}: {profile.tax_id}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.invoiceTitle}>INVOICE</Text>

        <View style={styles.metaSection}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issue_date)}</Text>
            {invoice.due_date && (
              <>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>
                  {formatDate(invoice.due_date)}
                </Text>
              </>
            )}
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.clientName}>{invoice.client_name}</Text>
            {invoice.client_address && <Text>{invoice.client_address}</Text>}
            {invoice.client_email && <Text>{invoice.client_email}</Text>}
            {invoice.client_phone && <Text>{invoice.client_phone}</Text>}
            {invoice.client_tax_id && <Text>Tax ID: {invoice.client_tax_id}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>
                {item.description}
                {item.unit ? ` (${item.unit})` : ''}
              </Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colRate}>
                {formatCurrency(item.unit_price_cents, invoice.currency)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount_cents, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal_cents, invoice.currency)}
            </Text>
          </View>
          {invoice.discount_cents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount
                {invoice.discount_type === 'percentage'
                  ? ` (${invoice.discount_value}%)`
                  : ''}
              </Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(invoice.discount_cents, invoice.currency)}
              </Text>
            </View>
          )}
          {invoice.tax_cents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.tax_cents, invoice.currency)}
              </Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total_cents, invoice.currency)}
            </Text>
          </View>
        </View>

        {invoice.payment_instructions && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Payment Instructions</Text>
            <Text style={styles.notesText}>{invoice.payment_instructions}</Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {invoice.footer && (
          <Text style={styles.footer}>{invoice.footer}</Text>
        )}
      </Page>
    </Document>
  )
}
