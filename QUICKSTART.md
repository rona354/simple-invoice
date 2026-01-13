# Quick Start Guide

> Reference ini untuk memulai development session baru.

---

## 1. Project Init (First Time Only)

```bash
# Create project
npx create-next-app@latest invoice-simple \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd invoice-simple

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install @react-pdf/renderer
npm install resend
```

---

## 2. Environment Setup

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Supabase Client Setup

### Browser Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client
```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

---

## 4. Database Quick Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_email TEXT,
  business_address TEXT,
  logo_url TEXT,
  default_currency TEXT DEFAULT 'USD',
  default_payment_terms INTEGER DEFAULT 30,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  locale TEXT DEFAULT 'en-US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  public_id TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. Key Utility Functions

### Currency Formatting
```typescript
// lib/utils/format.ts
export function formatCurrency(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
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
```

### Invoice Calculations
```typescript
// lib/utils/calculations.ts
interface LineItem {
  quantity: number;
  unit_price: number;
}

export function calculateInvoiceTotals(
  items: LineItem[],
  taxRate: number = 0,
  discountType: 'fixed' | 'percentage' = 'fixed',
  discountValue: number = 0
) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price * 100),
    0
  );

  const discountCents =
    discountType === 'percentage'
      ? Math.round(subtotalCents * (discountValue / 100))
      : Math.round(discountValue * 100);

  const afterDiscount = subtotalCents - discountCents;
  const taxCents = Math.round(afterDiscount * (taxRate / 100));
  const totalCents = afterDiscount + taxCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
  };
}
```

---

## 6. Invoice Number Generation

```typescript
// lib/utils/invoice-number.ts
import { SupabaseClient } from '@supabase/supabase-js';

export async function generateInvoiceNumber(
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const year = new Date().getFullYear();

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${year}-01-01`);

  const seq = (count ?? 0) + 1;
  return `INV-${year}-${seq.toString().padStart(4, '0')}`;
}
```

---

## 7. Zod Schemas

```typescript
// lib/validations/invoice.ts
import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().min(0.01),
  unit_price: z.number().min(0),
});

export const invoiceFormSchema = z.object({
  client_name: z.string().min(1, 'Required'),
  client_email: z.string().email().optional().or(z.literal('')),
  client_address: z.string().optional(),
  items: z.array(lineItemSchema).min(1),
  tax_rate: z.number().min(0).max(100).default(0),
  due_date: z.string(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
```

---

## 8. Server Action Template

```typescript
// lib/actions/invoices.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createInvoice(
  formData: InvoiceFormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // ... implementation

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

---

## 9. PDF Component Structure

```typescript
// components/invoice/invoice-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  // ... more styles
});

export function InvoicePDF({ invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header, Items, Totals, Footer */}
      </Page>
    </Document>
  );
}
```

### PDF Download Button
```typescript
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './invoice-pdf';

async function downloadPDF(invoice) {
  const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoice_number}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 10. Common Issues & Solutions

### PDF Not Rendering
```bash
# @react-pdf/renderer needs specific React version
npm install react@18 react-dom@18
```

### Supabase Auth Not Working
```typescript
// Make sure middleware.ts exists at root
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### TypeScript Errors with Supabase
```bash
# Generate types
npx supabase gen types typescript --project-id YOUR_ID > types/database.ts
```

---

## Resume Session Prompt

Copy this to continue development:

```
Saya sedang build Simple Invoice Generator.

Files:
- Plan lengkap: ~/invoice-generator-plan/PLAN.md
- Checklist: ~/invoice-generator-plan/CHECKLIST.md
- Quick ref: ~/invoice-generator-plan/QUICKSTART.md

Tech stack: Next.js 14 (App Router), TypeScript, Supabase, @react-pdf/renderer, Tailwind

Progress terakhir: [UPDATE INI]

Yang perlu dikerjakan selanjutnya: [UPDATE INI]
```

---

## Useful Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [React PDF Docs](https://react-pdf.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Resend](https://resend.com/docs)
