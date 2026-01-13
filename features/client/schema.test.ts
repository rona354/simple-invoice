import { describe, it, expect } from 'vitest'
import { clientFormSchema, clientIdSchema, clientSearchSchema } from './schema'

describe('clientFormSchema', () => {
  it('validates minimal client', () => {
    const result = clientFormSchema.safeParse({
      name: 'Acme Corp',
    })
    expect(result.success).toBe(true)
  })

  it('validates full client', () => {
    const result = clientFormSchema.safeParse({
      name: 'Acme Corp',
      email: 'acme@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      postal_code: '10001',
      tax_id: 'TAX123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = clientFormSchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Client name is required')
    }
  })

  it('rejects invalid email', () => {
    const result = clientFormSchema.safeParse({
      name: 'Acme Corp',
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })

  it('allows empty string for email', () => {
    const result = clientFormSchema.safeParse({
      name: 'Acme Corp',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('allows missing optional fields', () => {
    const result = clientFormSchema.safeParse({
      name: 'Acme Corp',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBeUndefined()
      expect(result.data.phone).toBeUndefined()
    }
  })
})

describe('clientIdSchema', () => {
  it('validates UUID', () => {
    const result = clientIdSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = clientIdSchema.safeParse({
      id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty id', () => {
    const result = clientIdSchema.safeParse({
      id: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('clientSearchSchema', () => {
  it('validates search with defaults', () => {
    const result = clientSearchSchema.safeParse({
      query: 'acme',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(10)
    }
  })

  it('validates search with custom limit', () => {
    const result = clientSearchSchema.safeParse({
      query: 'acme',
      limit: 25,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(25)
    }
  })

  it('rejects empty query', () => {
    const result = clientSearchSchema.safeParse({
      query: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects limit over 50', () => {
    const result = clientSearchSchema.safeParse({
      query: 'test',
      limit: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects limit under 1', () => {
    const result = clientSearchSchema.safeParse({
      query: 'test',
      limit: 0,
    })
    expect(result.success).toBe(false)
  })
})
