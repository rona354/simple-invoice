import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://simple-invoice-chi.vercel.app'),
  title: {
    default: 'Free Invoice Generator | Simple Invoice',
    template: '%s | Simple Invoice',
  },
  description:
    'Create professional PDF invoices in minutes. Free invoice generator with no signup required. Perfect for freelancers and small businesses.',
  openGraph: {
    title: 'Free Invoice Generator | Simple Invoice',
    description: 'Create professional invoices in under 2 minutes. No signup required.',
    url: 'https://simple-invoice-chi.vercel.app',
    siteName: 'Simple Invoice',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator | Simple Invoice',
    description: 'Create professional invoices in under 2 minutes. No signup required.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Simple Invoice',
  description: 'Free invoice generator for freelancers and small businesses',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  url: 'https://simple-invoice-chi.vercel.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
