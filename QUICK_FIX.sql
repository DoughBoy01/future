-- ============================================================================
-- QUICK FIX - Camp Organizer Setup
-- Copy and paste this into Supabase SQL Editor and run it
-- ============================================================================

-- 1. Add missing column
ALTER TABLE camps ADD COLUMN IF NOT EXISTS camp_address TEXT;

-- 2. Check your camp organizer email and find an organisation
-- Look at the results below and note the organisation ID you want to use
SELECT 'Your camp organizer:' as info, email, organisation_id FROM profiles WHERE role = 'camp_organizer';
SELECT 'Available organisations:' as info, id, name FROM organisations WHERE active = true;

-- 3. EDIT THIS SECTION - Replace with your values, then uncomment and run
/*
DO $$
DECLARE
    v_email TEXT := 'your-camp-organizer@email.com'; -- REPLACE THIS
    v_org_id UUID := 'paste-organisation-id-here';    -- REPLACE THIS
    v_profile_id UUID;
BEGIN
    -- Get profile ID
    SELECT id INTO v_profile_id FROM profiles WHERE email = v_email AND role = 'camp_organizer';

    -- Update profile
    UPDATE profiles SET organisation_id = v_org_id WHERE id = v_profile_id;

    -- Create org member record
    INSERT INTO organisation_members (organisation_id, profile_id, role, status, joined_at)
    VALUES (v_org_id, v_profile_id, 'owner', 'active', NOW())
    ON CONFLICT (organisation_id, profile_id) DO UPDATE SET status = 'active', role = 'owner';

    RAISE NOTICE '✅ Done! Sign out and sign back in.';
END $$;
*/
