import { createRateLimiter } from './client'

export const loginLimiter = createRateLimiter({
  requests: 5,
  window: '1 m',
  prefix: 'login',
})

export const signupLimiter = createRateLimiter({
  requests: 5,
  window: '1 h',
  prefix: 'signup',
})

export const passwordResetLimiter = createRateLimiter({
  requests: 3,
  window: '1 h',
  prefix: 'password-reset',
})

export const emailLimiter = createRateLimiter({
  requests: 10,
  window: '1 h',
  prefix: 'email',
})

export const emailDailyLimiter = createRateLimiter({
  requests: 50,
  window: '24 h',
  prefix: 'email-daily',
})
