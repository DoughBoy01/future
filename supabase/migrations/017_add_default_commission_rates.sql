-- Migration: Add default commission rates to organisations
-- This allows admins to set a default commission rate per organization,
-- which can be overridden at the camp level

-- Add default_commission_rate column to organisations
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS default_commission_rate NUMERIC(5,4) DEFAULT 0.15 CHECK (default_commission_rate >= 0 AND default_commission_rate <= 1);

-- Add comment for clarity
COMMENT ON COLUMN organisations.default_commission_rate IS 'Default commission rate for all camps under this organization (0.15 = 15%). Can be overridden per camp.';

-- Update existing organisations to have the default rate
UPDATE organisations
SET default_commission_rate = 0.15
WHERE default_commission_rate IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_organisations_default_commission_rate ON organisations(default_commission_rate);

-- Add audit fields for tracking commission rate changes
ALTER TABLE camps
ADD COLUMN IF NOT EXISTS commission_rate_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS commission_rate_updated_by UUID REFERENCES profiles(id);

COMMENT ON COLUMN camps.commission_rate IS 'Commission rate for this specific camp (0.15 = 15%). If NULL, uses organisation default_commission_rate.';
COMMENT ON COLUMN camps.commission_rate_updated_at IS 'When the commission rate was last changed';
COMMENT ON COLUMN camps.commission_rate_updated_by IS 'Admin who last changed the commission rate';

-- Create function to get effective commission rate for a camp
-- Returns camp-specific rate if set, otherwise organization default
CREATE OR REPLACE FUNCTION get_effective_commission_rate(camp_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  camp_rate NUMERIC;
  org_rate NUMERIC;
BEGIN
  -- Get camp's commission rate and organization's default rate
  SELECT
    c.commission_rate,
    o.default_commission_rate
  INTO camp_rate, org_rate
  FROM camps c
  JOIN organisations o ON c.organisation_id = o.id
  WHERE c.id = camp_id;

  -- Return camp rate if set, otherwise org rate, otherwise 0.15
  RETURN COALESCE(camp_rate, org_rate, 0.15);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_effective_commission_rate IS 'Get the effective commission rate for a camp (camp-specific or organization default)';

-- Create view for commission rate audit
CREATE OR REPLACE VIEW commission_rate_history AS
SELECT
  cr.id,
  cr.camp_id,
  cr.commission_rate,
  cr.effective_date,
  cr.end_date,
  cr.set_by,
  cr.notes,
  cr.created_at,
  c.name as camp_name,
  o.name as organisation_name,
  p.email as set_by_email
FROM camp_commission_rates cr
JOIN camps c ON cr.camp_id = c.id
JOIN organisations o ON c.organisation_id = o.id
LEFT JOIN profiles p ON cr.set_by = p.id
ORDER BY cr.created_at DESC;

COMMENT ON VIEW commission_rate_history IS 'Historical view of all commission rate changes';

-- Grant permissions
GRANT SELECT ON commission_rate_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_effective_commission_rate TO authenticated;
