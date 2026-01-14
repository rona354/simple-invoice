const CURRENCY_LOCALE_MAP: Record<string, string> = {
  IDR: 'id-ID',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  SGD: 'en-SG',
  MYR: 'ms-MY',
  AUD: 'en-AU',
  CAD: 'en-CA',
  CNY: 'zh-CN',
  INR: 'en-IN',
  KRW: 'ko-KR',
  THB: 'th-TH',
  VND: 'vi-VN',
  PHP: 'en-PH',
}

export function getCurrencyLocale(currency: string): string {
  return CURRENCY_LOCALE_MAP[currency] ?? 'en-US'
}

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  id: 'id-ID',
}

export function getLanguageLocale(language: string): string {
  return LANGUAGE_LOCALE_MAP[language] ?? 'en-US'
}

export function formatCurrency(
  cents: number,
  currency: string = 'USD',
  locale?: string
): string {
  const effectiveLocale = locale ?? getCurrencyLocale(currency)
  return new Intl.NumberFormat(effectiveLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDate(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatPercent(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function centsToDollars(cents: number): number {
  return cents / 100
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}
