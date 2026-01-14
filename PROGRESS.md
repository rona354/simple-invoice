# Development Progress Tracker

> **Purpose:** Track implementation progress across sessions

---

## Quick Resume

```
Resume Simple Invoice development.

Workspace: /Users/royan.fauzan/Developer/rona354/simple-invoice/

Current phase: Post-Launch (v1.4) - Complete
Next task: Deploy changes to production

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
| **Phase** | Post-Launch (v1.4) |
| **Progress** | Security Hardening |
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
