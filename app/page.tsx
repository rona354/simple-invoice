import Link from 'next/link'
import { Button } from '@/shared/components/ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Simple Invoice
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-gray-50 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Invoicing made simple
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Create professional invoices in seconds. Track payments, send reminders,
                and get paid faster. No complex setup required.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg">Start Free</Button>
                </Link>
                <Link href="/login" className="text-sm font-semibold text-gray-900">
                  Sign in <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Everything you need to get paid
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Simple, powerful tools to manage your invoicing workflow
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Quick Invoice Creation"
                description="Create professional invoices in under a minute. Add line items, taxes, and discounts with ease."
              />
              <FeatureCard
                title="Client Management"
                description="Save client information for faster invoicing. Auto-complete makes repeat invoices a breeze."
              />
              <FeatureCard
                title="PDF Generation"
                description="Generate beautiful PDF invoices ready to send. Download or email directly to clients."
              />
              <FeatureCard
                title="Payment Tracking"
                description="Track invoice statuses from draft to paid. Never lose sight of outstanding payments."
              />
              <FeatureCard
                title="Email Delivery"
                description="Send invoices directly via email. Clients get a link to view and download their invoice."
              />
              <FeatureCard
                title="Multi-Currency"
                description="Support for multiple currencies. Invoice clients in their preferred currency."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Simple Invoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}
