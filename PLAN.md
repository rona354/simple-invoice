# Simple Invoice Generator — Master Plan

> **Project Codename:** InvoiceSimple
> **Created:** 2026-01-13
> **Status:** Planning Complete, Ready for Implementation
> **Target:** $0 cost webapp for freelancers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [Features Specification](#4-features-specification)
5. [UI/UX Specification](#5-uiux-specification)
6. [Global Invoice Standards](#6-global-invoice-standards)
7. [Project Structure](#7-project-structure)
8. [Implementation Phases](#8-implementation-phases)
9. [API & Server Actions](#9-api--server-actions)
10. [Component Specifications](#10-component-specifications)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment](#12-deployment)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Project Overview

### Vision
"Invoice in 60 seconds. Get paid faster."

### Problem Statement
- 71% freelancers experience late payments
- Existing tools are bloated with accounting features
- Simple invoicing shouldn't require a learning curve

### Target Users
- Freelancers (developers, designers, writers)
- Solo consultants
- Small service businesses
- Tutors, photographers, contractors

### Core Value Proposition
1. Create invoice in under 60 seconds
2. Professional PDF output
3. Zero cost to start
4. No accounting bloat

### Anti-Goals (What We Won't Build)
- Full accounting suite
- Time tracking
- Project management
- Bank connections
- Team collaboration
- CRM features
- Inventory management

---

## 2. Tech Stack

### Production Stack ($0/month)

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│  Next.js 14+ (App Router, TypeScript)                       │
│  ├── react-hook-form (forms)                                │
│  ├── zod (validation)                                       │
│  ├── @react-pdf/renderer (PDF generation, client-side)      │
│  ├── Tailwind CSS (styling)                                 │
│  └── Native Intl APIs (currency/date formatting)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
│  Supabase (FREE tier)                                       │
│  ├── PostgreSQL database (500MB limit)                      │
│  ├── Auth (50,000 MAU limit)                                │
│  ├── Storage (1GB for logos)                                │
│  └── Row Level Security                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       EMAIL                                  │
│  Resend (FREE tier: 3,000 emails/month)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       HOSTING                                │
│  Vercel (FREE tier)                                         │
│  - Automatic deployments                                    │
│  - Edge functions                                           │
│  - Preview deployments                                      │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies (package.json)

```json
{
  "name": "invoice-simple",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "supabase db push",
    "db:generate": "supabase gen types typescript --local > types/database.ts"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@react-pdf/renderer": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "resend": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Free Tier Limits Reference

| Service | Limit | Sufficient For |
|---------|-------|----------------|
| Vercel | 100GB bandwidth/mo | ~50,000 users |
| Supabase DB | 500MB | ~100,000 invoices |
| Supabase Auth | 50,000 MAU | More than enough |
| Supabase Storage | 1GB | ~10,000 logos |
| Resend | 3,000 emails/mo | ~100 invoices/day |

---

## 3. Database Schema

### Full Schema (Supabase/PostgreSQL)

```sql
-- ===========================================
-- PROFILES TABLE
-- User business information
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Business Info
  business_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_city TEXT,
  business_country TEXT,
  business_postal_code TEXT,

  -- Tax Info
  tax_id TEXT,
  tax_id_label TEXT DEFAULT 'Tax ID',

  -- Branding
  logo_url TEXT,

  -- Defaults
  default_currency TEXT DEFAULT 'USD',
  default_payment_terms INTEGER DEFAULT 30,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  default_notes TEXT,
  default_payment_instructions TEXT,

  -- Locale
  locale TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'MMM DD, YYYY',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CLIENTS TABLE (Optional - for autocomplete)
-- ===========================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  tax_id TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INVOICES TABLE (Core)
-- ===========================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Invoice Identification
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),

  -- Client Info (denormalized for invoice record)
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  client_tax_id TEXT,

  -- Line Items (JSONB for flexibility)
  items JSONB NOT NULL DEFAULT '[]',
  /*
  Structure:
  [
    {
      "id": "uuid",
      "description": "Web Design Services",
      "quantity": 10,
      "unit": "hours",
      "unit_price_cents": 7500,
      "amount_cents": 75000,
      "tax_rate": 0
    }
  ]
  */

  -- Amounts (stored in cents to avoid float issues)
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,

  -- Currency
  currency TEXT DEFAULT 'USD' CHECK (length(currency) = 3),

  -- Dates
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  sent_date TIMESTAMPTZ,
  viewed_date TIMESTAMPTZ,

  -- Additional
  notes TEXT,
  payment_instructions TEXT,
  terms TEXT,
  footer TEXT,

  -- Public Access
  public_id TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  public_url TEXT GENERATED ALWAYS AS ('/i/' || public_id) STORED,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_public_id ON invoices(public_id);
CREATE UNIQUE INDEX idx_invoices_user_number ON invoices(user_id, invoice_number);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(user_id, name);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Clients: users can only access their own
CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL
  USING (auth.uid() = user_id);

-- Invoices: users can only access their own
CREATE POLICY "Users can manage own invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id);

-- Public invoice viewing (for shared links)
CREATE POLICY "Anyone can view public invoices"
  ON invoices FOR SELECT
  USING (public_id IS NOT NULL);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- STORAGE BUCKET (for logos)
-- ===========================================
-- Run in Supabase Dashboard > Storage
-- Create bucket: 'logos'
-- Set policy: authenticated users can upload to their own folder
```

### TypeScript Types

```typescript
// types/invoice.ts

export interface Profile {
  id: string;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_city: string | null;
  business_country: string | null;
  business_postal_code: string | null;
  tax_id: string | null;
  tax_id_label: string;
  logo_url: string | null;
  default_currency: string;
  default_payment_terms: number;
  default_tax_rate: number;
  default_notes: string | null;
  default_payment_instructions: string | null;
  locale: string;
  date_format: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unit_price_cents: number;
  amount_cents: number;
  tax_rate?: number;
}

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;

  // Client (denormalized)
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  client_tax_id: string | null;

  // Line items
  items: LineItem[];

  // Amounts (in cents)
  subtotal_cents: number;
  discount_cents: number;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;

  // Currency
  currency: string;

  // Dates
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  sent_date: string | null;
  viewed_date: string | null;

  // Additional
  notes: string | null;
  payment_instructions: string | null;
  terms: string | null;
  footer: string | null;

  // Public access
  public_id: string;
  public_url: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// Form types (for react-hook-form)
export interface InvoiceFormData {
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_tax_id?: string;
  items: Omit<LineItem, 'id' | 'amount_cents'>[];
  tax_rate: number;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  due_date: string;
  currency: string;
  notes?: string;
  payment_instructions?: string;
}

// Invoice with profile (for PDF generation)
export interface InvoiceWithProfile extends Invoice {
  profile: Profile;
}
```

---

## 4. Features Specification

### MVP Features (Phase 1)

| Feature | Priority | Status |
|---------|----------|--------|
| User authentication | P0 | Pending |
| Business profile setup | P0 | Pending |
| Create invoice | P0 | Pending |
| Edit invoice | P0 | Pending |
| Delete invoice | P0 | Pending |
| Invoice list/dashboard | P0 | Pending |
| PDF generation (client-side) | P0 | Pending |
| PDF download | P0 | Pending |
| Invoice status management | P0 | Pending |
| Mobile responsive UI | P0 | Pending |

### Phase 2 Features

| Feature | Priority | Status |
|---------|----------|--------|
| Send invoice via email | P1 | Pending |
| Duplicate invoice | P1 | Pending |
| Client autocomplete | P1 | Pending |
| Multiple currencies | P1 | Pending |
| Public invoice link | P1 | Pending |
| Mark as paid (1-click) | P1 | Pending |

### Phase 3 Features

| Feature | Priority | Status |
|---------|----------|--------|
| Payment reminders | P2 | Pending |
| Invoice templates (2-3) | P2 | Pending |
| Basic reporting | P2 | Pending |
| Export to CSV | P2 | Pending |
| Recurring invoices | P2 | Pending |

### Out of Scope (Never)

- Payment processing (Stripe integration)
- Full accounting
- Time tracking
- Project management
- Team/multi-user
- Inventory management
- Bank connections

---

## 5. UI/UX Specification

### Design Principles

1. **Speed first** — Every action in minimum clicks
2. **Pre-fill aggressively** — User edits, not creates from scratch
3. **Single page forms** — No wizards, use collapsible sections
4. **WYSIWYG PDF** — Preview matches output exactly
5. **Mobile = view/send** — Don't optimize mobile for creation

### Page Structure

```
/                       → Landing page (marketing)
/login                  → Auth: Login
/signup                 → Auth: Signup
/dashboard              → Invoice list (main app)
/invoices/new           → Create invoice
/invoices/[id]          → View invoice
/invoices/[id]/edit     → Edit invoice
/settings               → Business profile
/settings/templates     → Invoice templates (Phase 3)
/i/[publicId]           → Public invoice view
```

### Invoice Form Layout

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Invoices                        [Save Draft] [Send ▼]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────┐    ┌──────────────────────────┐ │
│  │ YOUR BUSINESS            │    │ INVOICE DETAILS          │ │
│  │ [Logo placeholder]       │    │ Invoice #: INV-2026-0001 │ │
│  │ Business Name            │    │ Date: Jan 13, 2026       │ │
│  │ business@email.com       │    │ Due: Feb 12, 2026   [✏️] │ │
│  │ [Edit in Settings]       │    │ Currency: USD       [✏️] │ │
│  └──────────────────────────┘    └──────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ BILL TO                                                   │ │
│  │ ┌────────────────────────────────────────────────────┐   │ │
│  │ │ Client Name *                                      │   │ │
│  │ └────────────────────────────────────────────────────┘   │ │
│  │ ┌──────────────────────┐ ┌──────────────────────────┐   │ │
│  │ │ Email                │ │ Address                  │   │ │
│  │ └──────────────────────┘ └──────────────────────────┘   │ │
│  │ ▸ Add Tax ID (optional)                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ LINE ITEMS                                                │ │
│  │ ┌──────────────────────┬───────┬──────────┬──────────┬─┐ │ │
│  │ │ Description          │ Qty   │ Rate     │ Amount   │×│ │ │
│  │ ├──────────────────────┼───────┼──────────┼──────────┼─┤ │ │
│  │ │ Web Design Services  │ 10    │ $75.00   │ $750.00  │×│ │ │
│  │ ├──────────────────────┼───────┼──────────┼──────────┼─┤ │ │
│  │ │ [+ Add line item]    │       │          │          │ │ │ │
│  │ └──────────────────────┴───────┴──────────┴──────────┴─┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ▸ Discount (optional)                                     │ │
│  │ ▸ Tax (optional)                                          │ │
│  │ ▸ Notes (optional)                                        │ │
│  │ ▸ Payment Instructions (optional)                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                              Subtotal      $750.00        │ │
│  │                              Discount      -$0.00         │ │
│  │                              Tax (0%)      $0.00          │ │
│  │                              ─────────────────────        │ │
│  │                              TOTAL         $750.00        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [Preview PDF]           [Download PDF]      [Send Invoice]│ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Invoice List (Dashboard)

```
┌────────────────────────────────────────────────────────────────┐
│ Invoices                                    [+ New Invoice]    │
├────────────────────────────────────────────────────────────────┤
│ [All] [Draft] [Sent] [Paid] [Overdue]          🔍 Search...   │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ INV-2026-0003  │ Client C  │ $1,200  │ ● Paid    │ Jan 10 │ │
│ │ INV-2026-0002  │ Client B  │ $750    │ ○ Sent    │ Jan 08 │ │
│ │ INV-2026-0001  │ Client A  │ $500    │ ◐ Draft   │ Jan 05 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ Showing 3 of 3 invoices                                        │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Views

```
Dashboard (Mobile):
┌─────────────────────────┐
│ ☰  Invoices    [+ New]  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ INV-2026-0003       │ │
│ │ Client C            │ │
│ │ $1,200    ● Paid    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ INV-2026-0002       │ │
│ │ Client B            │ │
│ │ $750      ○ Sent    │ │
│ └─────────────────────┘ │
└─────────────────────────┘

Invoice View (Mobile):
┌─────────────────────────┐
│ ← Back        ⋮ Menu    │
├─────────────────────────┤
│   [PDF Preview Area]    │
│                         │
├─────────────────────────┤
│ [Mark Paid] [Send] [⬇️] │
└─────────────────────────┘
```

### Color Palette

```css
:root {
  /* Primary */
  --primary: #2563eb;        /* Blue 600 */
  --primary-hover: #1d4ed8;  /* Blue 700 */

  /* Status colors */
  --status-draft: #6b7280;   /* Gray 500 */
  --status-sent: #f59e0b;    /* Amber 500 */
  --status-paid: #10b981;    /* Emerald 500 */
  --status-overdue: #ef4444; /* Red 500 */

  /* Neutral */
  --bg: #ffffff;
  --bg-secondary: #f9fafb;   /* Gray 50 */
  --border: #e5e7eb;         /* Gray 200 */
  --text: #111827;           /* Gray 900 */
  --text-secondary: #6b7280; /* Gray 500 */
}
```

---

## 6. Global Invoice Standards

### Required Fields by Region

| Field | US | EU | UK | ID | SG | AU | JP |
|-------|----|----|----|----|----|----|---|
| Invoice # | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Date | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Seller Name | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Seller Address | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Seller Tax ID | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Buyer Name | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Buyer Tax ID | ○ | B2B | B2B | ✓ | B2B | ○ | ✓ |
| Line Items | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tax Rate | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tax Amount | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Total | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Legend: ✓ = Required, ○ = Optional, B2B = Required for B2B only

### Tax ID Formats

| Country | Type | Format | Example | Regex |
|---------|------|--------|---------|-------|
| EU | VAT | CC + 8-12 chars | DE123456789 | `^[A-Z]{2}[A-Z0-9]{8,12}$` |
| UK | VAT | GB + 9 digits | GB123456789 | `^GB[0-9]{9}$` |
| US | EIN | XX-XXXXXXX | 12-3456789 | `^[0-9]{2}-[0-9]{7}$` |
| Indonesia | NPWP | 16 digits | 1234567890123456 | `^[0-9]{16}$` |
| Singapore | UEN | 9-10 chars | 12345678A | `^[0-9]{8,9}[A-Z]$` |
| Australia | ABN | 11 digits | 12345678901 | `^[0-9]{11}$` |
| Japan | T + 13 | T + 13 digits | T1234567890123 | `^T[0-9]{13}$` |

### Tax Rates Reference

| Country | Standard | Reduced | Notes |
|---------|----------|---------|-------|
| Germany | 19% | 7% | |
| France | 20% | 5.5%, 10% | |
| UK | 20% | 5%, 0% | |
| US | 0-10%+ | Varies | State-dependent |
| Indonesia | 11% | - | PPN (effective rate) |
| Singapore | 9% | - | GST |
| Australia | 10% | 0% | GST |
| Japan | 10% | 8% | Consumption tax |

### Number Formatting by Locale

```typescript
// lib/utils/format.ts

export function formatCurrency(
  cents: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

// Examples:
// formatCurrency(150000, 'USD', 'en-US')  → "$1,500.00"
// formatCurrency(150000, 'EUR', 'de-DE')  → "1.500,00 €"
// formatCurrency(150000, 'IDR', 'id-ID')  → "Rp 1.500"
// formatDate(new Date(), 'en-US')         → "Jan 13, 2026"
// formatDate(new Date(), 'de-DE')         → "13. Jan. 2026"
```

### Invoice Number Generation

```typescript
// lib/utils/invoice-number.ts

export async function generateInvoiceNumber(
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const year = new Date().getFullYear();

  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${year}-01-01`);

  if (error) throw error;

  const seq = (count ?? 0) + 1;
  return `INV-${year}-${seq.toString().padStart(4, '0')}`;
}

// Output: INV-2026-0001, INV-2026-0002, etc.
```

---

## 7. Project Structure

```
invoice-simple/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles
│   │
│   ├── (auth)/
│   │   ├── layout.tsx                # Auth layout (centered)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts              # OAuth callback
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout (sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Invoice list
│   │   ├── invoices/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create invoice
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # View invoice
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit invoice
│   │   └── settings/
│   │       └── page.tsx              # Business profile
│   │
│   ├── i/
│   │   └── [publicId]/
│   │       └── page.tsx              # Public invoice view
│   │
│   └── api/
│       ├── send-invoice/
│       │   └── route.ts              # Email sending
│       └── webhooks/
│           └── route.ts              # Future: payment webhooks
│
├── components/
│   ├── invoice/
│   │   ├── invoice-form.tsx          # Main invoice form
│   │   ├── line-items.tsx            # Line items editor
│   │   ├── line-item-row.tsx         # Single line item
│   │   ├── invoice-totals.tsx        # Subtotal, tax, total
│   │   ├── invoice-preview.tsx       # Live PDF preview
│   │   ├── invoice-pdf.tsx           # PDF template
│   │   ├── invoice-card.tsx          # List item card
│   │   ├── invoice-status.tsx        # Status badge
│   │   └── invoice-actions.tsx       # Action buttons
│   │
│   ├── client/
│   │   ├── client-form.tsx           # Client info section
│   │   └── client-autocomplete.tsx   # Client search
│   │
│   ├── settings/
│   │   ├── profile-form.tsx          # Business profile
│   │   └── logo-upload.tsx           # Logo uploader
│   │
│   ├── ui/                           # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── spinner.tsx
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── footer.tsx
│   │
│   └── providers/
│       ├── supabase-provider.tsx
│       └── toast-provider.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   │
│   ├── actions/
│   │   ├── invoices.ts               # Invoice CRUD
│   │   ├── clients.ts                # Client CRUD
│   │   ├── profile.ts                # Profile CRUD
│   │   └── email.ts                  # Email actions
│   │
│   ├── utils/
│   │   ├── format.ts                 # Currency, date, number
│   │   ├── calculations.ts           # Invoice math
│   │   ├── invoice-number.ts         # Number generation
│   │   └── cn.ts                     # Class name helper
│   │
│   └── validations/
│       ├── invoice.ts                # Invoice schemas
│       ├── client.ts                 # Client schemas
│       └── profile.ts                # Profile schemas
│
├── hooks/
│   ├── use-invoice-form.ts           # Form state management
│   ├── use-invoice-calculations.ts   # Auto-calculate totals
│   ├── use-debounce.ts               # Debounce hook
│   └── use-local-storage.ts          # localStorage hook
│
├── types/
│   ├── invoice.ts                    # Invoice types
│   ├── database.ts                   # Supabase generated types
│   └── index.ts                      # Re-exports
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── config.toml
│
├── .env.local.example
├── .env.local                        # Local env (gitignored)
├── middleware.ts                     # Auth middleware
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)

#### Day 1-2: Project Setup
- [ ] Initialize Next.js with TypeScript
- [ ] Setup Tailwind CSS
- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Setup ESLint & Prettier
- [ ] Create basic folder structure

#### Day 3-4: Authentication
- [ ] Setup Supabase Auth
- [ ] Create login page
- [ ] Create signup page
- [ ] Setup auth middleware
- [ ] Create profile on signup (trigger)
- [ ] Test auth flow

#### Day 5-7: Core Invoice Form
- [ ] Build invoice form component
- [ ] Implement line items editor
- [ ] Add/remove line items
- [ ] Auto-calculate subtotal
- [ ] Form validation with zod
- [ ] Save draft functionality

### Phase 2: PDF & Storage (Week 2)

#### Day 8-9: PDF Generation
- [ ] Setup @react-pdf/renderer
- [ ] Create PDF template component
- [ ] Implement client-side generation
- [ ] PDF download button
- [ ] PDF preview modal

#### Day 10-11: Dashboard
- [ ] Invoice list page
- [ ] Status badges
- [ ] Filter by status
- [ ] Search invoices
- [ ] Pagination (if needed)

#### Day 12-14: Invoice CRUD
- [ ] Create invoice (Server Action)
- [ ] Read invoice (detail page)
- [ ] Update invoice
- [ ] Delete invoice (soft delete?)
- [ ] Duplicate invoice
- [ ] Status management

### Phase 3: Polish & Deploy (Week 3)

#### Day 15-16: Settings
- [ ] Business profile form
- [ ] Logo upload (Supabase Storage)
- [ ] Default values (currency, terms)
- [ ] Preview changes

#### Day 17-18: Email
- [ ] Setup Resend
- [ ] Create email template
- [ ] Send invoice API route
- [ ] Update invoice status on send

#### Day 19-21: Polish & Deploy
- [ ] Mobile responsive testing
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Deploy to Vercel
- [ ] Test production

### Phase 4: Enhancement (Week 4+)

- [ ] Public invoice links
- [ ] Payment reminders
- [ ] Client autocomplete
- [ ] Multiple templates
- [ ] Basic analytics
- [ ] Export to CSV

---

## 9. API & Server Actions

### Invoice Actions

```typescript
// lib/actions/invoices.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { invoiceFormSchema } from '@/lib/validations/invoice';
import { generateInvoiceNumber } from '@/lib/utils/invoice-number';
import { calculateInvoiceTotals } from '@/lib/utils/calculations';

// Types
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// CREATE
export async function createInvoice(
  formData: z.infer<typeof invoiceFormSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate
    const validated = invoiceFormSchema.parse(formData);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(user.id, supabase);

    // Calculate totals
    const totals = calculateInvoiceTotals(
      validated.items,
      validated.tax_rate,
      validated.discount_type,
      validated.discount_value
    );

    // Insert
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        invoice_number: invoiceNumber,
        status: 'draft',
        client_name: validated.client_name,
        client_email: validated.client_email || null,
        client_address: validated.client_address || null,
        client_tax_id: validated.client_tax_id || null,
        items: validated.items.map((item, index) => ({
          id: crypto.randomUUID(),
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: Math.round(item.unit_price * 100),
          amount_cents: Math.round(item.quantity * item.unit_price * 100),
        })),
        subtotal_cents: totals.subtotalCents,
        discount_type: validated.discount_type,
        discount_value: validated.discount_value,
        discount_cents: totals.discountCents,
        tax_rate: validated.tax_rate,
        tax_cents: totals.taxCents,
        total_cents: totals.totalCents,
        currency: validated.currency,
        due_date: validated.due_date,
        notes: validated.notes || null,
        payment_instructions: validated.payment_instructions || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true, data: { id: data.id } };

  } catch (error) {
    console.error('createInvoice error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// READ (List)
export async function getInvoices(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params?.search) {
    query = query.or(
      `client_name.ilike.%${params.search}%,invoice_number.ilike.%${params.search}%`
    );
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { invoices: data, count };
}

// READ (Single)
export async function getInvoice(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

// UPDATE
export async function updateInvoice(
  id: string,
  formData: Partial<z.infer<typeof invoiceFormSchema>>
): Promise<ActionResult> {
  try {
    const supabase = createClient();

    // Recalculate if items changed
    let totals = {};
    if (formData.items) {
      totals = calculateInvoiceTotals(
        formData.items,
        formData.tax_rate || 0,
        formData.discount_type || 'fixed',
        formData.discount_value || 0
      );
    }

    const { error } = await supabase
      .from('invoices')
      .update({
        ...formData,
        ...totals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard');
    revalidatePath(`/invoices/${id}`);
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// UPDATE STATUS
export async function updateInvoiceStatus(
  id: string,
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
): Promise<ActionResult> {
  try {
    const supabase = createClient();

    const updateData: Record<string, unknown> = { status };

    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString();
    } else if (status === 'sent') {
      updateData.sent_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard');
    revalidatePath(`/invoices/${id}`);
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// DELETE
export async function deleteInvoice(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// DUPLICATE
export async function duplicateInvoice(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();

    // Get original
    const { data: original, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Get user for new invoice number
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const newNumber = await generateInvoiceNumber(user.id, supabase);

    // Create copy
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: original.user_id,
        invoice_number: newNumber,
        status: 'draft',
        client_name: original.client_name,
        client_email: original.client_email,
        client_address: original.client_address,
        client_tax_id: original.client_tax_id,
        items: original.items,
        subtotal_cents: original.subtotal_cents,
        discount_type: original.discount_type,
        discount_value: original.discount_value,
        discount_cents: original.discount_cents,
        tax_rate: original.tax_rate,
        tax_cents: original.tax_cents,
        total_cents: original.total_cents,
        currency: original.currency,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        notes: original.notes,
        payment_instructions: original.payment_instructions,
      })
      .select('id')
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true, data: { id: data.id } };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Email API Route

```typescript
// app/api/send-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    const supabase = createClient();

    // Get invoice with profile
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`*, profile:profiles(*)`)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    if (!invoice.client_email) {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400 }
      );
    }

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: `${invoice.profile.business_name} <invoices@yourdomain.com>`,
      to: invoice.client_email,
      subject: `Invoice ${invoice.invoice_number} from ${invoice.profile.business_name}`,
      html: `
        <h1>Invoice ${invoice.invoice_number}</h1>
        <p>Hi ${invoice.client_name},</p>
        <p>Please find your invoice attached.</p>
        <p><strong>Amount Due:</strong> $${(invoice.total_cents / 100).toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${invoice.due_date}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/i/${invoice.public_id}">
          View Invoice Online
        </a></p>
        <p>Thank you for your business!</p>
        <p>${invoice.profile.business_name}</p>
      `,
    });

    if (emailError) throw emailError;

    // Update invoice status
    await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_date: new Date().toISOString()
      })
      .eq('id', invoiceId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
```

---

## 10. Component Specifications

### Invoice Form Component

```typescript
// components/invoice/invoice-form.tsx
'use client'

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { createInvoice, updateInvoice } from '@/lib/actions/invoices';
import { Invoice, Profile } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils/format';
import { LineItemRow } from './line-item-row';
import { InvoiceTotals } from './invoice-totals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit_price: z.number().min(0, 'Price must be positive'),
});

const invoiceFormSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email().optional().or(z.literal('')),
  client_address: z.string().optional(),
  client_tax_id: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item required'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_type: z.enum(['fixed', 'percentage']).default('fixed'),
  discount_value: z.number().min(0).default(0),
  due_date: z.string(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  payment_instructions: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  profile: Profile;
  invoice?: Invoice; // For edit mode
}

export function InvoiceForm({ profile, invoice }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default due date: 30 days from now
  const defaultDueDate = new Date(
    Date.now() + (profile.default_payment_terms || 30) * 24 * 60 * 60 * 1000
  ).toISOString().split('T')[0];

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice ? {
      client_name: invoice.client_name,
      client_email: invoice.client_email || '',
      client_address: invoice.client_address || '',
      client_tax_id: invoice.client_tax_id || '',
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price_cents / 100,
      })),
      tax_rate: invoice.tax_rate,
      discount_type: invoice.discount_type,
      discount_value: invoice.discount_value,
      due_date: invoice.due_date,
      currency: invoice.currency,
      notes: invoice.notes || '',
      payment_instructions: invoice.payment_instructions || '',
    } : {
      client_name: '',
      client_email: '',
      client_address: '',
      client_tax_id: '',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
      tax_rate: profile.default_tax_rate || 0,
      discount_type: 'fixed',
      discount_value: 0,
      due_date: defaultDueDate,
      currency: profile.default_currency || 'USD',
      notes: profile.default_notes || '',
      payment_instructions: profile.default_payment_instructions || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Watch for auto-calculations
  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('tax_rate');
  const watchedDiscountType = form.watch('discount_type');
  const watchedDiscountValue = form.watch('discount_value');
  const watchedCurrency = form.watch('currency');

  // Calculate totals
  const subtotalCents = watchedItems.reduce((sum, item) => {
    return sum + Math.round((item.quantity || 0) * (item.unit_price || 0) * 100);
  }, 0);

  const discountCents = watchedDiscountType === 'percentage'
    ? Math.round(subtotalCents * (watchedDiscountValue / 100))
    : Math.round(watchedDiscountValue * 100);

  const afterDiscount = subtotalCents - discountCents;
  const taxCents = Math.round(afterDiscount * (watchedTaxRate / 100));
  const totalCents = afterDiscount + taxCents;

  async function onSubmit(data: InvoiceFormData) {
    setIsSubmitting(true);
    try {
      if (invoice) {
        const result = await updateInvoice(invoice.id, data);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createInvoice(data);
        if (!result.success) throw new Error(result.error);
      }
      // Redirect handled by action
    } catch (error) {
      console.error(error);
      // Show toast error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Client Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Bill To</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Client Name *"
            {...form.register('client_name')}
            error={form.formState.errors.client_name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...form.register('client_email')}
          />
          <Textarea
            label="Address"
            {...form.register('client_address')}
            className="md:col-span-2"
          />
        </div>
      </section>

      {/* Line Items Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Line Items</h2>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Rows */}
          {fields.map((field, index) => (
            <LineItemRow
              key={field.id}
              index={index}
              register={form.register}
              remove={() => fields.length > 1 && remove(index)}
              currency={watchedCurrency}
              locale={profile.locale}
            />
          ))}

          {/* Add Item Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
          >
            + Add Item
          </Button>
        </div>
      </section>

      {/* Totals Section */}
      <InvoiceTotals
        subtotalCents={subtotalCents}
        discountCents={discountCents}
        taxRate={watchedTaxRate}
        taxCents={taxCents}
        totalCents={totalCents}
        currency={watchedCurrency}
        locale={profile.locale}
      />

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
```

### PDF Template Component

```typescript
// components/invoice/invoice-pdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { InvoiceWithProfile } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils/format';

// Register fonts (optional - for custom fonts)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  businessInfo: {
    marginTop: 8,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  invoiceDates: {
    marginTop: 12,
    fontSize: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colDescription: { width: '50%' },
  colQty: { width: '15%', textAlign: 'right' },
  colRate: { width: '17.5%', textAlign: 'right' },
  colAmount: { width: '17.5%', textAlign: 'right' },
  totalsSection: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    width: 200,
  },
  totalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 16,
    color: '#6b7280',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    width: 200,
    borderTopWidth: 2,
    borderTopColor: '#111827',
    marginTop: 4,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 16,
    fontWeight: 'bold',
    fontSize: 12,
  },
  grandTotalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerSection: {
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithProfile;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { profile } = invoice;
  const locale = profile.locale || 'en-US';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {profile.logo_url && (
              <Image src={profile.logo_url} style={styles.logo} />
            )}
            <View style={styles.businessInfo}>
              <Text style={{ fontWeight: 'bold' }}>{profile.business_name}</Text>
              {profile.business_address && (
                <Text style={{ color: '#6b7280' }}>{profile.business_address}</Text>
              )}
              {profile.business_email && (
                <Text style={{ color: '#6b7280' }}>{profile.business_email}</Text>
              )}
              {profile.tax_id && (
                <Text style={{ color: '#6b7280' }}>
                  {profile.tax_id_label}: {profile.tax_id}
                </Text>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={styles.invoiceDates}>
              <Text>Issue Date: {formatDate(invoice.issue_date, locale)}</Text>
              {invoice.due_date && (
                <Text>Due Date: {formatDate(invoice.due_date, locale)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.client_name}</Text>
          {invoice.client_email && (
            <Text style={{ color: '#6b7280' }}>{invoice.client_email}</Text>
          )}
          {invoice.client_address && (
            <Text style={{ color: '#6b7280' }}>{invoice.client_address}</Text>
          )}
          {invoice.client_tax_id && (
            <Text style={{ color: '#6b7280' }}>Tax ID: {invoice.client_tax_id}</Text>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>
                {formatCurrency(item.unit_price_cents, invoice.currency, locale)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount_cents, invoice.currency, locale)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal_cents, invoice.currency, locale)}
            </Text>
          </View>

          {invoice.discount_cents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount
                {invoice.discount_type === 'percentage' &&
                  ` (${invoice.discount_value}%)`
                }
              </Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(invoice.discount_cents, invoice.currency, locale)}
              </Text>
            </View>
          )}

          {invoice.tax_rate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.tax_cents, invoice.currency, locale)}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total_cents, invoice.currency, locale)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {invoice.payment_instructions && (
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Payment Instructions</Text>
              <Text style={styles.footerText}>{invoice.payment_instructions}</Text>
            </View>
          )}

          {invoice.notes && (
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Notes</Text>
              <Text style={styles.footerText}>{invoice.notes}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
```

---

## 11. Testing Strategy

### Unit Tests (Vitest)

```typescript
// __tests__/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals } from '@/lib/utils/calculations';

describe('calculateInvoiceTotals', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { quantity: 2, unit_price: 50 },
      { quantity: 1, unit_price: 100 },
    ];
    const result = calculateInvoiceTotals(items, 0, 'fixed', 0);
    expect(result.subtotalCents).toBe(20000); // $200.00
  });

  it('applies percentage discount', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 0, 'percentage', 10);
    expect(result.discountCents).toBe(1000); // $10.00
    expect(result.totalCents).toBe(9000); // $90.00
  });

  it('applies fixed discount', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 0, 'fixed', 15);
    expect(result.discountCents).toBe(1500); // $15.00
    expect(result.totalCents).toBe(8500); // $85.00
  });

  it('calculates tax after discount', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 10, 'fixed', 10);
    // Subtotal: $100, Discount: $10, After discount: $90, Tax: $9
    expect(result.taxCents).toBe(900);
    expect(result.totalCents).toBe(9900); // $99.00
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/invoice-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates a simple invoice', async ({ page }) => {
    await page.click('text=New Invoice');
    await page.waitForURL('/invoices/new');

    // Fill client
    await page.fill('[name="client_name"]', 'Test Client');
    await page.fill('[name="client_email"]', 'client@example.com');

    // Add line item
    await page.fill('[name="items.0.description"]', 'Web Design');
    await page.fill('[name="items.0.quantity"]', '10');
    await page.fill('[name="items.0.unit_price"]', '75');

    // Check total
    await expect(page.locator('[data-testid="total"]')).toContainText('$750.00');

    // Submit
    await page.click('text=Create Invoice');

    // Should redirect to invoice view
    await page.waitForURL(/\/invoices\/[\w-]+/);
    await expect(page.locator('h1')).toContainText('INV-');
  });

  test('downloads PDF', async ({ page }) => {
    await page.goto('/invoices/new');

    // Fill minimum required fields
    await page.fill('[name="client_name"]', 'PDF Test Client');
    await page.fill('[name="items.0.description"]', 'Service');
    await page.fill('[name="items.0.quantity"]', '1');
    await page.fill('[name="items.0.unit_price"]', '100');

    // Click download
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download PDF');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf/i);
  });
});
```

---

## 12. Deployment

### Environment Variables

```bash
# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod
```

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "RESEND_API_KEY": "@resend_api_key"
  }
}
```

### Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test authentication flow
- [ ] Test invoice creation
- [ ] Test PDF download
- [ ] Test email sending
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up alerts

---

## 13. Future Roadmap

### v1.1 (After Launch)
- [ ] Recurring invoices
- [ ] Payment reminders (automated)
- [ ] Client management (dedicated page)
- [ ] Invoice search improvements
- [ ] Bulk actions (mark paid, delete)

### v1.2
- [ ] Multiple invoice templates
- [ ] Custom branding colors
- [ ] PDF attachments in email
- [ ] Invoice expiry warnings

### v2.0 (If Traction)
- [ ] Payment integration (Stripe)
- [ ] Client portal
- [ ] Basic reporting/analytics
- [ ] Multi-currency with exchange rates
- [ ] Team features (maybe)

### Never
- Full accounting
- Inventory management
- Complex project management
- Enterprise features

---

## Quick Reference

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter

# Database
npm run db:migrate       # Push migrations to Supabase
npm run db:generate      # Generate TypeScript types

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
```

### Key Files

| File | Purpose |
|------|---------|
| `app/invoices/new/page.tsx` | Create invoice page |
| `components/invoice/invoice-form.tsx` | Main form component |
| `components/invoice/invoice-pdf.tsx` | PDF template |
| `lib/actions/invoices.ts` | Server actions |
| `lib/utils/calculations.ts` | Invoice math |
| `lib/utils/format.ts` | Currency/date formatting |
| `supabase/migrations/*.sql` | Database schema |

### Status Reference

| Status | Color | Meaning |
|--------|-------|---------|
| `draft` | Gray | Not sent yet |
| `sent` | Amber | Sent to client |
| `viewed` | Blue | Client opened |
| `paid` | Green | Payment received |
| `overdue` | Red | Past due date |
| `cancelled` | Gray | Voided |

---

**Last Updated:** 2026-01-13
**Version:** 1.0.0
