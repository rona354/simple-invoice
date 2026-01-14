-- Add invoice_data column to store full guest invoice for public sharing
ALTER TABLE guest_attempts
ADD COLUMN IF NOT EXISTS invoice_data JSONB;

-- Add index for faster lookups by invoice_id
CREATE INDEX IF NOT EXISTS idx_guest_attempts_invoice_id ON guest_attempts(invoice_id);
