export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'IDR', 'SGD',
] as const

export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
] as const satisfies readonly { value: Currency; label: string }[]
