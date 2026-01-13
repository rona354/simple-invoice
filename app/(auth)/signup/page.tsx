import { Metadata } from 'next'
import { SignupForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Sign Up - Simple Invoice',
  description: 'Create a new Simple Invoice account',
}

export default function SignupPage() {
  return (
    <div>
      <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Create your account
      </h2>
      <SignupForm />
    </div>
  )
}
