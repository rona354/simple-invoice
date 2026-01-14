-- Security migration: RLS policies and performance indexes
-- Created: 2026-01-15
-- Applied: 2026-01-15

-- =============================================================================
-- DROP EXISTING POLICIES (idempotent)
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
DROP POLICY IF EXISTS "Anyone can view invoice by public_id" ON invoices;
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role only for guest_attempts" ON guest_attempts;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_attempts ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- INVOICES POLICIES
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view invoice by public_id"
  ON invoices FOR SELECT
  USING (public_id IS NOT NULL);

-- CLIENTS POLICIES
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- GUEST_ATTEMPTS POLICY (service role only)
CREATE POLICY "Service role only for guest_attempts"
  ON guest_attempts FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- INVOICES TABLE
-- For public invoice viewing (high priority - user-facing)
CREATE INDEX IF NOT EXISTS idx_invoices_public_id
  ON invoices(public_id);

-- For dashboard listing with status filter and sorting
CREATE INDEX IF NOT EXISTS idx_invoices_user_status_created
  ON invoices(user_id, status, created_at DESC);

-- For yearly invoice counting
CREATE INDEX IF NOT EXISTS idx_invoices_user_created
  ON invoices(user_id, created_at);

-- CLIENTS TABLE
-- For client listing and autocomplete
CREATE INDEX IF NOT EXISTS idx_clients_user_name
  ON clients(user_id, name);

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
-- DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Anyone can view invoice by public_id" ON invoices;
-- DROP POLICY IF EXISTS "Users can view own clients" ON clients;
-- DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
-- DROP POLICY IF EXISTS "Users can update own clients" ON clients;
-- DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Service role only for guest_attempts" ON guest_attempts;
-- DROP INDEX IF EXISTS idx_invoices_public_id;
-- DROP INDEX IF EXISTS idx_invoices_user_status_created;
-- DROP INDEX IF EXISTS idx_invoices_user_created;
-- DROP INDEX IF EXISTS idx_clients_user_name;
