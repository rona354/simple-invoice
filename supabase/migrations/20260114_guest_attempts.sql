-- Guest attempts table for abuse prevention and conversion tracking
CREATE TABLE IF NOT EXISTS guest_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  invoice_id UUID NOT NULL UNIQUE,

  created_at TIMESTAMPTZ DEFAULT now(),
  pdf_generated_at TIMESTAMPTZ,

  converted_user_id UUID REFERENCES auth.users(id),
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_attempts_fingerprint ON guest_attempts(fingerprint);
CREATE INDEX IF NOT EXISTS idx_guest_attempts_ip ON guest_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_guest_attempts_created ON guest_attempts(created_at);

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_guest_limit(
  p_fingerprint TEXT,
  p_ip TEXT
) RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  fingerprint_count INT;
  ip_count_24h INT;
BEGIN
  SELECT COUNT(*) INTO fingerprint_count
  FROM guest_attempts
  WHERE fingerprint = p_fingerprint
    AND pdf_generated_at IS NOT NULL;

  IF fingerprint_count > 0 THEN
    RETURN QUERY SELECT false, 'fingerprint_limit'::TEXT;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO ip_count_24h
  FROM guest_attempts
  WHERE ip_address = p_ip
    AND pdf_generated_at IS NOT NULL
    AND pdf_generated_at > now() - INTERVAL '24 hours';

  IF ip_count_24h >= 3 THEN
    RETURN QUERY SELECT false, 'ip_rate_limit'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
