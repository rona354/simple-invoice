-- Add language column to invoices table for i18n PDF generation
-- Default to 'en' (English) for existing and new invoices

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

-- Add check constraint for valid languages
ALTER TABLE invoices
ADD CONSTRAINT invoices_language_check
CHECK (language IN ('en', 'id'));

-- Create index for potential filtering by language
CREATE INDEX IF NOT EXISTS idx_invoices_language ON invoices(language);

-- Comment for documentation
COMMENT ON COLUMN invoices.language IS 'Language code for PDF generation (en=English, id=Indonesian)';
