# Simple Invoice

A lightweight invoice generator for freelancers and small businesses. Create professional invoices, send them via email, and track payment status.

## Features

- Create and manage invoices with line items
- Professional PDF generation
- Send invoices via email with one click
- Public invoice links for clients
- Multi-currency support (USD, EUR, GBP, IDR, etc.)
- Client management with autocomplete
- Customizable business profile
- Google OAuth sign-in

## Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **PDF:** @react-pdf/renderer
- **Email:** Resend
- **Hosting:** Vercel

## Quick Start

```bash
# Clone the repository
git clone https://github.com/rona354/simple-invoice.git
cd simple-invoice

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Fill in your credentials (see Environment Variables below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | No | Resend API key for email sending |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL (localhost for dev) |

## Project Structure

```
simple-invoice/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── (dashboard)/        # Protected dashboard pages
│   ├── api/                # API routes
│   └── i/[publicId]/       # Public invoice view
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── client/             # Client management
│   ├── email/              # Email sending
│   ├── invoice/            # Invoice CRUD & PDF
│   └── profile/            # User profile
└── shared/                 # Shared code
    ├── components/ui/      # UI components
    ├── config/             # App configuration
    ├── errors/             # Error handling
    ├── hooks/              # React hooks
    ├── layout/             # Layout components
    ├── lib/                # External integrations
    ├── types/              # TypeScript types
    └── utils/              # Utility functions
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Lint code
npm run lint
```

## Deployment

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Add environment variables in project settings
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Update Supabase redirect URLs in dashboard

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations (see `PROGRESS.md` Session 9 for SQL)
3. Create a `logos` storage bucket with public access
4. Configure Google OAuth in Authentication > Providers

## License

MIT
