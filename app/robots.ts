import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/invoices/', '/settings/'],
    },
    sitemap: 'https://simple-invoice-chi.vercel.app/sitemap.xml',
  }
}
