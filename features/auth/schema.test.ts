import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema, resetPasswordSchema, updatePasswordSchema } from './schema'

describe('loginSchema', () => {
  it('validates valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address')
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const validSignup = {
    email: 'user@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  }

  it('validates valid signup', () => {
    const result = signupSchema.safeParse(validSignup)
    expect(result.success).toBe(true)
  })

  it('rejects short password', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 8 characters')
    }
  })

  it('rejects password without uppercase', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('uppercase')
    }
  })

  it('rejects password without lowercase', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'PASSWORD123',
      confirmPassword: 'PASSWORD123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('lowercase')
    }
  })

  it('rejects password without number', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'Password',
      confirmPassword: 'Password',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('number')
    }
  })

  it('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: 'DifferentPassword123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'))
      expect(confirmError?.message).toBe('Passwords do not match')
    }
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('validates valid email', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

describe('updatePasswordSchema', () => {
  const validUpdate = {
    password: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  }

  it('validates valid password update', () => {
    const result = updatePasswordSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
  })

  it('applies same password rules as signup', () => {
    const weakPassword = updatePasswordSchema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(weakPassword.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'NewPassword123',
      confirmPassword: 'DifferentPassword123',
    })
    expect(result.success).toBe(false)
  })
})
