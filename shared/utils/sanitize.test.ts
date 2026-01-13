import { describe, it, expect } from 'vitest'
import { sanitizeSearchQuery, sanitizeRedirectPath } from './sanitize'

describe('sanitizeSearchQuery', () => {
  it('passes through normal strings', () => {
    expect(sanitizeSearchQuery('hello')).toBe('hello')
    expect(sanitizeSearchQuery('John Doe')).toBe('John Doe')
    expect(sanitizeSearchQuery('test123')).toBe('test123')
  })

  it('escapes percent signs', () => {
    expect(sanitizeSearchQuery('50%')).toBe('50\\%')
    expect(sanitizeSearchQuery('%test%')).toBe('\\%test\\%')
  })

  it('escapes underscores', () => {
    expect(sanitizeSearchQuery('user_name')).toBe('user\\_name')
    expect(sanitizeSearchQuery('_test_')).toBe('\\_test\\_')
  })

  it('escapes backslashes', () => {
    expect(sanitizeSearchQuery('path\\to\\file')).toBe('path\\\\to\\\\file')
    expect(sanitizeSearchQuery('test\\')).toBe('test\\\\')
  })

  it('handles combined special characters', () => {
    expect(sanitizeSearchQuery('50% off_sale\\')).toBe('50\\% off\\_sale\\\\')
  })

  it('handles empty string', () => {
    expect(sanitizeSearchQuery('')).toBe('')
  })
})

describe('sanitizeRedirectPath', () => {
  it('allows valid internal paths', () => {
    expect(sanitizeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(sanitizeRedirectPath('/invoices/123')).toBe('/invoices/123')
    expect(sanitizeRedirectPath('/settings?tab=profile')).toBe('/settings?tab=profile')
  })

  it('rejects empty or invalid input', () => {
    expect(sanitizeRedirectPath('')).toBe('/dashboard')
    expect(sanitizeRedirectPath(null as unknown as string)).toBe('/dashboard')
    expect(sanitizeRedirectPath(undefined as unknown as string)).toBe('/dashboard')
  })

  it('rejects protocol-relative URLs', () => {
    expect(sanitizeRedirectPath('//evil.com')).toBe('/dashboard')
    expect(sanitizeRedirectPath('//evil.com/path')).toBe('/dashboard')
  })

  it('rejects URLs with protocols', () => {
    expect(sanitizeRedirectPath('http://evil.com')).toBe('/dashboard')
    expect(sanitizeRedirectPath('https://evil.com')).toBe('/dashboard')
    expect(sanitizeRedirectPath('javascript://alert(1)')).toBe('/dashboard')
    expect(sanitizeRedirectPath('/path?url=http://evil.com')).toBe('/dashboard')
  })

  it('rejects backslash-based bypasses', () => {
    expect(sanitizeRedirectPath('/\\evil.com')).toBe('/dashboard')
  })

  it('rejects null bytes', () => {
    expect(sanitizeRedirectPath('/path\0')).toBe('/dashboard')
    expect(sanitizeRedirectPath('/path\0evil')).toBe('/dashboard')
  })

  it('rejects paths not starting with /', () => {
    expect(sanitizeRedirectPath('dashboard')).toBe('/dashboard')
    expect(sanitizeRedirectPath('evil.com/path')).toBe('/dashboard')
  })

  it('trims whitespace', () => {
    expect(sanitizeRedirectPath('  /dashboard  ')).toBe('/dashboard')
    expect(sanitizeRedirectPath('\t/settings\n')).toBe('/settings')
  })

  it('uses custom fallback', () => {
    expect(sanitizeRedirectPath('', '/home')).toBe('/home')
    expect(sanitizeRedirectPath('//evil.com', '/login')).toBe('/login')
  })
})
