# Development Progress Tracker

> **Purpose:** Track implementation progress across sessions

---

## Quick Resume

```
Resume Simple Invoice development.

Workspace: /Users/royan.fauzan/Developer/rona354/simple-invoice/

Current phase: Post-Launch (v1.6) - i18n SSOT Refactor
Next task: Deploy to production

GitHub: https://github.com/rona354/simple-invoice
Live: https://simple-invoice-chi.vercel.app

Architecture: Pragmatic Clean Architecture
- features/{domain}/ → components, actions, service, repository, schema, types
- shared/ → lib, config, utils, errors, types, components/ui
- app/ → Next.js App Router pages and layouts
```

---

## Current Status

| Item | Value |
|------|-------|
| **Phase** | Post-Launch (v1.6) |
| **Progress** | i18n SSOT Refactor Complete |
| **Tests** | 150 passing |
| **Build** | Passing |
| **Blockers** | None |

---

## Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation Structure | Done |
| 2 | Invoice Feature Core | Done |
| 3 | Auth & Profile Features | Done |
| 4 | PDF & Email Features | Done |
| 5 | Client Feature | Done |
| 6 | App Pages & Polish | Done |
| 7 | Guest Mode (v1.1) | Done |
| 8 | SEO & Branding (v1.2) | Done |
| 9 | Google Search Console | Done |
| 10 | WhatsApp Send Feature | Done |
| 11 | Share PDF (Web Share API) | Done |
| 12 | Guest Mode: Share PDF & WhatsApp | Done |
| 13 | Security Hardening (v1.4) | Done |
| 14 | i18n - Indonesian/English (v1.5) | Done |
| 15 | i18n SSOT Refactor (v1.6) | Done |

---

## Post-Launch Checklist

**Google Search Console:**
- [x] Verify ownership (HTML file method)
- [x] Submit sitemap (3 pages indexed)
- [x] OG Image accessible

**Social Preview:**
- [x] Test on opengraph.xyz
- [x] OG Image renders correctly

**Directory Submissions:**
- [x] AlternativeTo (submitted, pending approval)
- [ ] Product Hunt (optional)
- [ ] SaaSHub (optional)

---

## Session 2026-01-14: i18n SSOT Refactor (v1.6)

**Issue:** Per-invoice language dropdown was redundant and confusing. Two language settings (UI toggle + form dropdown) violated Single Source of Truth principle.

**Solution:** Remove per-invoice language, use UI language for everything.

**Changes:**

1. **Removed "Bahasa Faktur" dropdown from forms:**
   - `features/invoice/components/invoice-form.tsx`
   - `features/guest/components/guest-invoice-creator.tsx`

2. **PDF now uses UI language (cookie):**
   - `app/api/invoices/[id]/pdf/route.ts` - reads `NEXT_LOCALE` cookie
   - `app/api/public/invoices/[publicId]/pdf/route.ts` - reads `NEXT_LOCALE` cookie
   - `app/api/guest/pdf/route.ts` - reads `NEXT_LOCALE` cookie
   - `app/api/guest/pdf/public/route.ts` - reads `NEXT_LOCALE` cookie

3. **Invoice display uses UI language:**
   - `features/invoice/components/invoice-display.tsx` - uses `useLocale()`
   - `features/guest/components/guest-invoice-display.tsx` - uses `useLocale()`

4. **Removed language field from schemas/types:**
   - `features/invoice/schema.ts`
   - `features/invoice/types.ts`
   - `features/invoice/hooks.ts`
   - `features/invoice/service.ts`
   - `features/guest/schema.ts`
   - `features/guest/types.ts`

5. **Fixed hardcoded copy in components:**
   - `signup-form.tsx` - now uses `useTranslations()`
   - `conversion-modal.tsx` - now uses `useTranslations()`
   - `guest-limit-reached.tsx` - now uses `useTranslations()`
   - `guest-whatsapp-send.tsx` - now uses `useTranslations()`
   - `guest-pdf-share.tsx` - now uses `useTranslations()`
   - `guest-pdf-download.tsx` - now uses `useTranslations()`

6. **Added new translation keys:**
   - `guest.creatingLink`, `guest.failedToCreateLink`, `guest.shareFailed`
   - `guest.downloadFailed`, `guest.failedToGeneratePdf`, `guest.sendViaWhatsApp`

**How it works now:**
- User switches language via header toggle (🇬🇧/🇮🇩)
- UI, invoice display, AND PDF all follow that setting
- Single source of truth - no confusion

**Database:** Column `invoices.language` still exists but is no longer used. Can be removed in future migration if desired.

---

## Session 2026-01-14: i18n Implementation (v1.5)

**Feature:** Dual-language support (Indonesian + English) for webapp and PDF invoices.

**Architecture Decisions:**
- Single UI toggle + per-invoice language override in form
- Date format follows invoice language (id-ID vs en-US)
- Currency format follows currency (IDR uses Indonesian format, USD uses English)
- Email language follows invoice language (recipient-focused)
- Default language: English

**Files Created:**
```
messages/en.json                    # English translations
messages/id.json                    # Indonesian translations
shared/i18n/config.ts               # Locale configuration
shared/i18n/translations.ts         # Translation utilities
shared/i18n/context.tsx             # LocaleProvider + hooks
shared/i18n/index.ts                # i18n exports
shared/components/language-switcher.tsx  # Language dropdown
supabase/migrations/20260115_invoice_language.sql  # DB migration
```

**Files Modified:**
```
app/layout.tsx                      # Add LocaleProvider
shared/layout/header.tsx            # Add LanguageSwitcher, use translations
shared/layout/sidebar.tsx           # Use translations for nav
shared/layout/mobile-nav.tsx        # Use translations for nav
shared/layout/navigation.ts         # Change name -> nameKey
shared/utils/format.ts              # Add getCurrencyLocale, getLanguageLocale
shared/utils/index.ts               # Export new formatting functions
features/invoice/types.ts           # Add language field
features/invoice/schema.ts          # Add language validation
features/invoice/hooks.ts           # Add language to defaults
features/invoice/pdf/invoice-pdf.ts # i18n for PDF labels
features/invoice/components/invoice-form.tsx  # Add PDF Language selector
features/guest/types.ts             # Add language field
features/guest/schema.ts            # Add language validation
features/guest/pdf.ts               # i18n for guest PDF labels
features/guest/components/guest-invoice-creator.tsx  # Add PDF Language selector
features/email/types.ts             # Add language param
features/email/service.ts           # Use translated subject
features/email/templates/invoice-email.tsx  # i18n for email body
```

**Database Migration:**
```sql
ALTER TABLE invoices ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE invoices ADD CONSTRAINT invoices_language_check CHECK (language IN ('en', 'id'));
```

**UI Changes:**
- Language switcher (flag + code) in header top-right
- PDF Language selector in invoice forms (Invoice Details section)
- Navigation labels now translated

**PDF Labels Translated:**
- INVOICE / FAKTUR
- Issue Date / Tanggal Terbit
- Due Date / Tanggal Jatuh Tempo
- BILL TO / TAGIHAN UNTUK
- AMOUNT DUE / JUMLAH TAGIHAN
- Subtotal, Tax, Total / Subtotal, Pajak, Total
- NOTES / CATATAN
- PAYMENT INSTRUCTIONS / INSTRUKSI PEMBAYARAN
- Description, Qty, Rate, Amount (table headers)

---

## Session 2026-01-15: Security Hardening

**Issue:** Database review by specialized agents identified critical security gaps.

**Findings (from 3 parallel agent reviews):**
1. **CRITICAL**: Middleware not executing (wrong filename)
2. **CRITICAL**: Missing RLS policies (not version-controlled)
3. **HIGH**: `getInvoices` not filtering by user_id

**Fixes Applied:**

1. **Middleware Fix:**
   - Renamed `proxy.ts` → `middleware.ts`
   - Renamed function `proxy` → `middleware`

2. **Security Migration Created:**
   ```
   supabase/migrations/20260115_security_rls_indexes.sql
   ```
   - RLS policies for `invoices`, `clients`, `profiles`, `guest_attempts`
   - Performance indexes: `idx_invoices_public_id`, `idx_invoices_user_status_created`, `idx_invoices_user_created`, `idx_clients_user_name`

3. **User Filter Fix:**
   - `actions.ts`: Pass `user.id` to `invoiceService.list()`
   - `service.ts`: Accept `userId` parameter
   - `repository.ts`: Add `.eq('user_id', userId)` filter

**Files Modified:**
```
middleware.ts                       # Renamed from proxy.ts, function renamed
features/invoice/actions.ts         # Pass user.id to service
features/invoice/service.ts         # Accept userId parameter
features/invoice/repository.ts      # Add user_id filter
```

**Files Created:**
```
supabase/migrations/20260115_security_rls_indexes.sql  # RLS + indexes
```

**Applied to Supabase:** Yes (2026-01-15)
- RLS enabled on all tables
- 4 performance indexes created

---

## Session 2026-01-14 (4): Guest Mode Share Features

**Feature:** Add Share PDF and WhatsApp buttons to guest mode

**Implementation:**
- Created guest-specific components (GuestWhatsAppSend, GuestPdfShare, GuestInvoiceDisplay, GuestPdfDownload)
- Added phone field to guest invoice form (Bill To section)
- WhatsApp: stores invoice to DB first, generates public URL, includes "View Invoice" link (same as signed-in mode)
- Share PDF: uses POST to /api/guest/pdf, then Web Share API
- Public view page at /g/[invoiceId] for shared guest invoices

**Database:**
```
supabase/migrations/20260114_guest_invoice_data.sql  # Add invoice_data JSONB column
```

**Files Created:**
```
features/guest/whatsapp.ts                           # Guest WhatsApp utilities
features/guest/components/guest-whatsapp-send.tsx    # WhatsApp button (async, stores first)
features/guest/components/guest-pdf-share.tsx        # Share PDF button
features/guest/components/guest-invoice-display.tsx  # Display component for public view
features/guest/components/guest-pdf-download.tsx     # PDF download for public view
app/api/guest/share/route.ts                         # Store invoice, return public URL
app/api/guest/pdf/public/route.ts                    # Generate PDF for public view
app/g/[invoiceId]/page.tsx                           # Public view page
```

**Files Modified:**
```
features/guest/schema.ts                      # Add to_phone field
features/guest/types.ts                       # Add phone to GuestInvoice.to
features/guest/components/index.ts            # Export new components
features/guest/index.ts                       # Export whatsapp module
features/guest/components/guest-invoice-creator.tsx # Add phone input + buttons
shared/lib/supabase/middleware.ts             # Add /g/ to public routes
```

**UI:**
- Phone input in Bill To section (after email, before address)
- WhatsApp and Share PDF buttons above Download button
- WhatsApp shows "Creating link..." while storing invoice

**Behavior (now identical to signed-in mode):**
- WhatsApp message includes "View Invoice: {public_url}"
- Recipient can click link to view invoice online at /g/{invoiceId}
- Public view has Download PDF button

---

## Session 2026-01-14 (3): Share PDF Feature (Web Share API)

**Feature:** Share PDF directly via native share sheet (WhatsApp, Telegram, etc.)

**Implementation:**
- Uses Web Share API (navigator.share with files)
- Falls back gracefully (button hidden if not supported)
- Browser support: ~92% (Chrome, Safari, Edge, mobile browsers)
- Firefox desktop: Not supported (button won't appear)

**Files Created:**
```
features/invoice/pdf/pdf-share.tsx   # Share PDF component
```

**Files Modified:**
```
features/invoice/pdf/index.ts        # Export PdfShare
features/invoice/index.ts            # Export PdfShare
app/(dashboard)/invoices/[id]/page.tsx # Add Share PDF button
```

**UI:** Share PDF button between WhatsApp and Download PDF buttons

---

## Session 2026-01-14 (2): WhatsApp Send Feature

**Feature:** Send invoice via WhatsApp button

**Implementation:**
- Uses wa.me click-to-chat links (free, no API)
- Pre-fills recipient from client_phone if available
- Message includes invoice number, amount, due date, public URL

**Files Created:**
```
features/invoice/whatsapp.ts         # Utility functions
features/invoice/components/whatsapp-send.tsx  # Button component
```

**Files Modified:**
```
features/invoice/components/index.ts  # Export WhatsAppSend
features/invoice/index.ts             # Export WhatsAppSend
app/(dashboard)/invoices/[id]/page.tsx # Add button to detail page
```

**UI:** Green WhatsApp button between Edit and Download PDF buttons

---

## Session 2026-01-14: Middleware & SEO Fixes

**Issues Fixed:**
1. Static files (.html, .xml, .txt, .webmanifest) blocked by middleware → redirect to /login
2. OG image route blocked by middleware

**Changes:**
```
middleware.ts (was proxy.ts, renamed in 2026-01-15 session)
- Added extensions to matcher exclusion: html, xml, txt, webmanifest

shared/lib/supabase/middleware.ts
- Added /opengraph-image to public routes
```

**Commits:**
- `fix: exclude .html files from middleware matcher`
- `fix: exclude xml, txt, webmanifest from middleware`
- `fix: allow public access to opengraph-image route`

---

## Quick Commands

```bash
npm run dev          # Start development
npm test             # Run tests
npm run build        # Build for production
```

---

## Links

- **GitHub:** https://github.com/rona354/simple-invoice
- **Live:** https://simple-invoice-chi.vercel.app
- **Supabase:** https://supabase.com/dashboard/project/hvifoflzxmpbkhbdclir
- **Google Search Console:** https://search.google.com/search-console?resource_id=https://simple-invoice-chi.vercel.app/
