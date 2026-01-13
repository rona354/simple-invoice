# Implementation Checklist

> Track progress across sessions. Update status as you go.

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed
- [-] Skipped/Not needed

---

## Phase 1: Foundation (Week 1)

### Day 1-2: Project Setup
- [ ] `npx create-next-app@latest invoice-simple --typescript --tailwind --app --src-dir=false`
- [ ] Configure `tailwind.config.js`
- [ ] Setup folder structure (see PLAN.md)
- [ ] Create Supabase project at supabase.com
- [ ] Copy env variables to `.env.local`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install react-hook-form @hookform/resolvers zod
  npm install @react-pdf/renderer
  npm install resend
  ```
- [ ] Create `lib/supabase/client.ts`
- [ ] Create `lib/supabase/server.ts`
- [ ] Test Supabase connection

### Day 3-4: Authentication
- [ ] Enable Email auth in Supabase dashboard
- [ ] Create `app/(auth)/layout.tsx`
- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Create `app/(auth)/signup/page.tsx`
- [ ] Create `app/(auth)/callback/route.ts`
- [ ] Create `middleware.ts` for auth protection
- [ ] Run database migration (profiles table + trigger)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test protected routes

### Day 5-7: Core Invoice Form
- [ ] Create `types/invoice.ts`
- [ ] Create `lib/validations/invoice.ts` (zod schemas)
- [ ] Create `lib/utils/format.ts` (currency, date)
- [ ] Create `lib/utils/calculations.ts` (totals)
- [ ] Create `components/ui/input.tsx`
- [ ] Create `components/ui/button.tsx`
- [ ] Create `components/ui/textarea.tsx`
- [ ] Create `components/invoice/line-item-row.tsx`
- [ ] Create `components/invoice/invoice-totals.tsx`
- [ ] Create `components/invoice/invoice-form.tsx`
- [ ] Create `app/(dashboard)/invoices/new/page.tsx`
- [ ] Test form validation
- [ ] Test auto-calculations
- [ ] Test add/remove line items

---

## Phase 2: PDF & Storage (Week 2)

### Day 8-9: PDF Generation
- [ ] Create `components/invoice/invoice-pdf.tsx`
- [ ] Create `components/invoice/invoice-preview.tsx`
- [ ] Implement PDF download button
- [ ] Test PDF output quality
- [ ] Test currency formatting in PDF
- [ ] Test with different locales

### Day 10-11: Dashboard
- [ ] Create `app/(dashboard)/layout.tsx`
- [ ] Create `components/layout/sidebar.tsx`
- [ ] Create `components/layout/header.tsx`
- [ ] Create `components/invoice/invoice-card.tsx`
- [ ] Create `components/invoice/invoice-status.tsx`
- [ ] Create `app/(dashboard)/dashboard/page.tsx`
- [ ] Implement status filter tabs
- [ ] Implement search
- [ ] Test empty state
- [ ] Test with multiple invoices

### Day 12-14: Invoice CRUD
- [ ] Create `lib/actions/invoices.ts`
- [ ] Implement `createInvoice` action
- [ ] Implement `getInvoices` action
- [ ] Implement `getInvoice` action
- [ ] Implement `updateInvoice` action
- [ ] Implement `deleteInvoice` action
- [ ] Implement `duplicateInvoice` action
- [ ] Implement `updateInvoiceStatus` action
- [ ] Create `app/(dashboard)/invoices/[id]/page.tsx`
- [ ] Create `app/(dashboard)/invoices/[id]/edit/page.tsx`
- [ ] Test create flow
- [ ] Test edit flow
- [ ] Test duplicate flow
- [ ] Test status changes

---

## Phase 3: Polish & Deploy (Week 3)

### Day 15-16: Settings
- [ ] Create `lib/validations/profile.ts`
- [ ] Create `lib/actions/profile.ts`
- [ ] Create `components/settings/profile-form.tsx`
- [ ] Create `components/settings/logo-upload.tsx`
- [ ] Create Supabase storage bucket "logos"
- [ ] Create `app/(dashboard)/settings/page.tsx`
- [ ] Test profile save
- [ ] Test logo upload
- [ ] Test defaults application

### Day 17-18: Email
- [ ] Create Resend account
- [ ] Verify sending domain (or use Resend test domain)
- [ ] Create `app/api/send-invoice/route.ts`
- [ ] Create email template
- [ ] Create `components/invoice/send-dialog.tsx`
- [ ] Test email delivery
- [ ] Test invoice status update on send

### Day 19-21: Polish & Deploy
- [ ] Mobile responsive testing (all pages)
- [ ] Fix any layout issues
- [ ] Add loading states (skeletons)
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Create Vercel account
- [ ] Connect GitHub repo
- [ ] Add environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Test production build
- [ ] Test all flows in production

---

## Phase 4: Enhancement (Post-Launch)

### Public Invoice Links
- [ ] Create `app/i/[publicId]/page.tsx`
- [ ] Test public access
- [ ] Track "viewed" status

### Payment Reminders
- [ ] Create reminder email template
- [ ] Create cron job (Vercel cron or Supabase)
- [ ] Implement reminder logic

### Client Autocomplete
- [ ] Create clients table migration
- [ ] Create `lib/actions/clients.ts`
- [ ] Create `components/client/client-autocomplete.tsx`
- [ ] Integrate with invoice form

---

## Bug Fixes & Issues

| Issue | Status | Notes |
|-------|--------|-------|
| | | |
| | | |
| | | |

---

## Session Notes

### Session 1 (Date: ______)
```
What was done:

What's next:

Blockers:
```

### Session 2 (Date: ______)
```
What was done:

What's next:

Blockers:
```

### Session 3 (Date: ______)
```
What was done:

What's next:

Blockers:
```

---

## Quick Commands

```bash
# Start dev
cd invoice-simple && npm run dev

# Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Deploy
vercel --prod

# Check logs
vercel logs
```
