export async function generateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side'
  }

  const components = [
    navigator.language,
    navigator.hardwareConcurrency?.toString() ?? 'unknown',
    `${screen.width}x${screen.height}`,
    screen.colorDepth?.toString() ?? 'unknown',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset().toString(),
    navigator.maxTouchPoints?.toString() ?? '0',
    navigator.platform ?? 'unknown',
  ]

  const raw = components.join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(raw)

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}

export function generateInvoiceId(): string {
  return crypto.randomUUID()
}
