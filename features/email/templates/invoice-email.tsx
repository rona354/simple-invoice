import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { createTranslator, getLocaleFromString } from '@/shared/i18n'

interface InvoiceEmailTemplateProps {
  invoiceNumber: string
  clientName: string
  amount: string
  dueDate: string | null
  publicUrl: string
  senderName: string
  language?: string
}

export function InvoiceEmailTemplate({
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  publicUrl,
  senderName,
  language = 'en',
}: InvoiceEmailTemplateProps) {
  const locale = getLocaleFromString(language)
  const t = createTranslator(locale)

  const previewText = t('email.preview', { invoiceNumber, amount })

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {t('invoice.title')} {invoiceNumber}
          </Heading>

          <Text style={paragraph}>{t('email.greeting', { clientName })}</Text>

          <Text style={paragraph}>
            {t('email.body', { senderName, amount })}
          </Text>

          {dueDate && (
            <Text style={paragraph}>
              <strong>{t('email.dueDateLabel')}</strong> {dueDate}
            </Text>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={publicUrl}>
              {t('email.viewInvoice')}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            {t('email.footer', { senderName })}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '5px',
  maxWidth: '600px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#111827',
  padding: '17px 0 0',
}

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
}

const buttonContainer = {
  padding: '20px 0',
}

const button = {
  backgroundColor: '#111827',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '15px',
  lineHeight: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}
