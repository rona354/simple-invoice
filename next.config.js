/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async rewrites() {
    return [
      {
        source: '/free-invoice-generator',
        destination: '/',
      },
    ]
  },
}

module.exports = nextConfig
