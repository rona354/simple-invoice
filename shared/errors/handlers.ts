import { ZodError } from 'zod'
import { AppError, ValidationError } from './app-error'
import type { ActionResult } from '@/shared/types/common'

export function handleActionError<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues: error.issues,
    }
  }

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      issues: error.issues,
    }
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    }
  }

  console.error('Unexpected error:', error)

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  }
}
