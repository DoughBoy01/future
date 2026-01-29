-- Add onboarding tracking fields to profiles table
-- Tracks progress through the camp owner onboarding wizard

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_step TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add helpful comments
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding wizard';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in onboarding: welcome, organization, first_camp, completed';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'When the user completed the full onboarding process';

-- Add check constraint for valid onboarding steps
ALTER TABLE profiles
ADD CONSTRAINT check_onboarding_step
CHECK (onboarding_step IS NULL OR onboarding_step IN ('welcome', 'organization', 'first_camp', 'completed'));

-- Create index for filtering incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed, role)
WHERE role = 'camp_organizer';

-- Create a function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_step(
  p_profile_id UUID,
  p_step TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validate step
  IF p_step NOT IN ('welcome', 'organization', 'first_camp', 'completed') THEN
    RAISE EXCEPTION 'Invalid onboarding step: %', p_step;
  END IF;

  -- Update profile
  UPDATE profiles
  SET
    onboarding_step = p_step,
    onboarding_completed = (p_step = 'completed'),
    onboarding_completed_at = CASE WHEN p_step = 'completed' THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_onboarding_step(UUID, TEXT) IS 'Updates the onboarding progress for a camp organizer profile';

-- Create a function to get incomplete onboarding users (for admin analytics)
CREATE OR REPLACE FUNCTION get_incomplete_onboarding_stats()
RETURNS TABLE (
  step TEXT,
  count BIGINT,
  avg_days_since_signup NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(p.onboarding_step, 'not_started') AS step,
    COUNT(*) AS count,
    ROUND(AVG(EXTRACT(EPOCH FROM (now() - p.created_at)) / 86400), 2) AS avg_days_since_signup
  FROM profiles p
  WHERE p.role = 'camp_organizer'
    AND p.onboarding_completed = false
  GROUP BY p.onboarding_step
  ORDER BY step;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_incomplete_onboarding_stats() IS 'Returns statistics on camp organizers with incomplete onboarding';
