# Clean Architecture Implementation Plan

> **Purpose:** Track architecture migration for Simple Invoice Generator
> **Created:** 2026-01-13
> **Approach:** Pragmatic Clean Architecture (Option A)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  app/ (Next.js App Router)                                      │
│  - Pages, layouts, API routes                                   │
│  - Delegates to features/                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FEATURES                                 │
│  features/{domain}/                                             │
│  - components/  → UI components for this feature                │
│  - actions.ts   → Server actions (thin, orchestration)          │
│  - service.ts   → Business logic                                │
│  - repository.ts → Data access abstraction                      │
│  - schema.ts    → Zod validations                               │
│  - types.ts     → Feature-specific types                        │
│  - hooks.ts     → Feature-specific React hooks                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SHARED                                  │
│  shared/                                                        │
│  - components/ui/  → Generic UI components                      │
│  - lib/            → Infrastructure (supabase, resend, pdf)     │
│  - utils/          → Pure utility functions                     │
│  - types/          → Shared type definitions                    │
│  - errors/         → Error classes                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target Folder Structure

```
invoice-simple/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   └── settings/page.tsx
│   ├── i/[publicId]/page.tsx
│   ├── api/
│   │   └── send-invoice/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── features/
│   ├── invoice/
│   │   ├── components/
│   │   │   ├── invoice-form.tsx
│   │   │   ├── invoice-card.tsx
│   │   │   ├── invoice-list.tsx
│   │   │   ├── invoice-status.tsx
│   │   │   ├── invoice-totals.tsx
│   │   │   ├── invoice-preview.tsx
│   │   │   ├── invoice-actions.tsx
│   │   │   ├── line-items.tsx
│   │   │   └── line-item-row.tsx
│   │   ├── pdf/
│   │   │   ├── invoice-pdf.tsx
│   │   │   └── pdf-download.tsx
│   │   ├── actions.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   ├── hooks.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   │
│   ├── client/
│   │   ├── components/
│   │   │   ├── client-form.tsx
│   │   │   └── client-autocomplete.tsx
│   │   ├── actions.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   ├── profile-form.tsx
│   │   │   └── logo-upload.tsx
│   │   ├── actions.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── actions.ts
│   │   ├── hooks.ts
│   │   └── index.ts
│   │
│   └── email/
│       ├── templates/
│       │   └── invoice-email.tsx
│       ├── service.ts
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       ├── checkbox.tsx
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── toast.tsx
│   │       ├── skeleton.tsx
│   │       ├── spinner.tsx
│   │       └── index.ts
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── index.ts
│   │   ├── resend/
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   └── pdf/
│   │       ├── renderer.ts
│   │       └── index.ts
│   │
│   ├── utils/
│   │   ├── format.ts
│   │   ├── calculations.ts
│   │   ├── cn.ts
│   │   └── index.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── handlers.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── common.ts
│   │   ├── database.ts
│   │   └── index.ts
│   │
│   └── hooks/
│       ├── use-debounce.ts
│       ├── use-local-storage.ts
│       └── index.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── config.toml
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
│
├── PLAN.md
├── CHECKLIST.md
├── QUICKSTART.md
├── ARCHITECTURE.md          ← This file
└── PROGRESS.md              ← Session tracking
```

---

## Implementation Phases

### Phase 1: Foundation Structure [Current]
Setup folder structure, shared utilities, infrastructure.

**Tasks:**
- [ ] Create folder structure
- [ ] Setup shared/lib/supabase/
- [ ] Setup shared/utils/
- [ ] Setup shared/errors/
- [ ] Setup shared/types/
- [ ] Create base UI components

**Files to create:**
```
shared/
├── lib/supabase/{client,server,middleware,index}.ts
├── utils/{format,calculations,cn,index}.ts
├── errors/{app-error,handlers,index}.ts
├── types/{common,index}.ts
└── components/ui/{button,input,index}.ts
```

---

### Phase 2: Invoice Feature Core
Implement invoice feature with repository pattern.

**Tasks:**
- [ ] Create features/invoice/types.ts
- [ ] Create features/invoice/schema.ts
- [ ] Create features/invoice/repository.ts
- [ ] Create features/invoice/service.ts
- [ ] Create features/invoice/actions.ts
- [ ] Create invoice components

**Dependency Chain:**
```
types.ts → schema.ts → repository.ts → service.ts → actions.ts
                                           ↓
                                    components/*.tsx
```

---

### Phase 3: Auth & Profile Features
Implement auth flow and profile management.

**Tasks:**
- [ ] Create features/auth/
- [ ] Create features/profile/
- [ ] Setup middleware integration
- [ ] Create auth components
- [ ] Create profile components

---

### Phase 4: PDF & Email Features
Implement PDF generation and email sending.

**Tasks:**
- [ ] Create shared/lib/pdf/
- [ ] Create features/invoice/pdf/
- [ ] Create features/email/
- [ ] Create email templates

---

### Phase 5: Client Feature & Integration
Implement client management and autocomplete.

**Tasks:**
- [ ] Create features/client/
- [ ] Integrate with invoice form
- [ ] Add client autocomplete

---

### Phase 6: Polish & App Pages
Connect features to Next.js pages.

**Tasks:**
- [ ] Create app/(auth)/ pages
- [ ] Create app/(dashboard)/ pages
- [ ] Create app/i/[publicId]/ page
- [ ] Add layout components
- [ ] Mobile responsive

---

## Layer Responsibilities

### Repository Layer
- Direct database access
- No business logic
- Returns raw data or throws RepositoryError
- One method per operation

### Service Layer
- Business logic orchestration
- Calls repository methods
- Handles calculations, validations
- Throws domain-specific errors

### Actions Layer
- Server Actions (Next.js)
- Authentication check
- Input validation (Zod)
- Delegates to service
- Handles revalidation
- Returns ActionResult

### Components Layer
- Pure presentation
- Receives data via props
- Calls actions for mutations
- Uses hooks for state

---

## Import Conventions

```typescript
// From app/ pages
import { InvoiceForm } from '@/features/invoice'
import { Button } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'

// From features/
import { invoiceRepository } from './repository'
import { Button } from '@/shared/components/ui'
import { AppError } from '@/shared/errors'

// From shared/ (no feature imports allowed)
import { createClient } from './supabase'
```

---

## Error Handling Pattern

```typescript
// shared/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// shared/errors/handlers.ts
export function handleActionError(error: unknown): ActionResult {
  if (error instanceof ZodError) {
    return { success: false, error: 'Validation failed', issues: error.issues }
  }
  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code }
  }
  console.error('Unexpected error:', error)
  return { success: false, error: 'An unexpected error occurred' }
}
```

---

## Testing Strategy

```
__tests__/
├── shared/
│   └── utils/
│       └── calculations.test.ts
├── features/
│   └── invoice/
│       ├── service.test.ts
│       └── repository.test.ts
└── e2e/
    └── invoice-creation.spec.ts
```

---

## Quick Reference

### Create New Feature
```bash
mkdir -p features/{name}/components
touch features/{name}/{actions,service,repository,schema,types,hooks,index}.ts
```

### Feature Index Export Pattern
```typescript
// features/invoice/index.ts
export * from './types'
export * from './schema'
export { invoiceService } from './service'
export { createInvoice, updateInvoice, deleteInvoice } from './actions'
export { InvoiceForm } from './components/invoice-form'
export { InvoiceCard } from './components/invoice-card'
```

---

**Next:** See PROGRESS.md for implementation tracking
