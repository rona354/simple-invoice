import { Metadata } from 'next'
import { LoginForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Sign In - Simple Invoice',
  description: 'Sign in to your Simple Invoice account',
}

export default function LoginPage() {
  return (
    <div>
      <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Sign in to your account
      </h2>
      <LoginForm />
    </div>
  )
}
