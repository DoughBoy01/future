-- ============================================================================
-- COMPLETE FIX FOR CAMP ORGANIZER ISSUES
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Add missing camp_address column
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'camps'
        AND column_name = 'camp_address'
    ) THEN
        ALTER TABLE camps ADD COLUMN camp_address TEXT;
        COMMENT ON COLUMN camps.camp_address IS 'Complete physical address of the camp venue (optional)';
        RAISE NOTICE 'Added camp_address column';
    ELSE
        RAISE NOTICE 'camp_address column already exists';
    END IF;
END $$;

-- STEP 2: Check current camp organizers status
-- ============================================================================
SELECT
    '=== CURRENT CAMP ORGANIZERS ===' as info,
    p.id,
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.organisation_id,
    o.name as organisation_name,
    CASE
        WHEN p.organisation_id IS NULL THEN '❌ NO ORG ID'
        WHEN om.id IS NULL THEN '⚠️ NO ORG MEMBER RECORD'
        WHEN om.status != 'active' THEN '⚠️ NOT ACTIVE'
        ELSE '✅ OK'
    END as status
FROM profiles p
JOIN auth.users au ON au.id = p.id
LEFT JOIN organisations o ON o.id = p.organisation_id
LEFT JOIN organisation_members om ON om.profile_id = p.id AND om.organisation_id = p.organisation_id
WHERE p.role = 'camp_organizer'
ORDER BY p.created_at DESC;

-- STEP 3: Check available organisations
-- ============================================================================
SELECT
    '=== AVAILABLE ORGANISATIONS ===' as info,
    id,
    name,
    slug,
    contact_email,
    active,
    verified
FROM organisations
WHERE active = true
ORDER BY created_at DESC;

-- ============================================================================
-- OPTION A: If you have an organisation, link your camp organizer to it
-- ============================================================================
-- IMPORTANT: Replace these values before running:
--   - YOUR_CAMP_ORGANIZER_EMAIL: Your camp organizer's email from auth.users
--   - YOUR_ORGANISATION_ID: The organisation ID from the list above

/*
DO $$
DECLARE
    v_profile_id UUID;
    v_org_id UUID := 'YOUR_ORGANISATION_ID'; -- REPLACE THIS
    v_email TEXT := 'YOUR_CAMP_ORGANIZER_EMAIL'; -- REPLACE THIS
BEGIN
    -- Get the profile ID using auth.users email
    SELECT p.id INTO v_profile_id
    FROM profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE au.email = v_email AND p.role = 'camp_organizer';

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Camp organizer not found with email: %', v_email;
    END IF;

    RAISE NOTICE 'Found camp organizer with ID: %', v_profile_id;

    -- Update profile with organisation_id
    UPDATE profiles
    SET organisation_id = v_org_id
    WHERE id = v_profile_id;

    RAISE NOTICE 'Updated profile with organisation_id';

    -- Create or update organisation_members record
    INSERT INTO organisation_members (
        organisation_id,
        profile_id,
        role,
        status,
        joined_at
    ) VALUES (
        v_org_id,
        v_profile_id,
        'owner',
        'active',
        NOW()
    )
    ON CONFLICT (organisation_id, profile_id)
    DO UPDATE SET
        status = 'active',
        role = 'owner';

    RAISE NOTICE 'Created/updated organisation_members record';
    RAISE NOTICE '✅ Camp organizer successfully linked to organisation!';
END $$;
*/

-- ============================================================================
-- OPTION B: Create a new organisation and link camp organizer to it
-- ============================================================================
-- IMPORTANT: Replace YOUR_CAMP_ORGANIZER_EMAIL before running

/*
DO $$
DECLARE
    v_profile_id UUID;
    v_org_id UUID;
    v_email TEXT := 'YOUR_CAMP_ORGANIZER_EMAIL'; -- REPLACE THIS
BEGIN
    -- Get the profile ID using auth.users email
    SELECT p.id INTO v_profile_id
    FROM profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE au.email = v_email AND p.role = 'camp_organizer';

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Camp organizer not found with email: %', v_email;
    END IF;

    RAISE NOTICE 'Found camp organizer with ID: %', v_profile_id;

    -- Create new organisation
    INSERT INTO organisations (
        name,
        slug,
        contact_email,
        active,
        verified,
        onboarding_status
    ) VALUES (
        'My Camp Organisation',
        'my-camp-org-' || substr(md5(random()::text), 1, 8),
        v_email,
        true,
        true,
        'completed'
    )
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created organisation with ID: %', v_org_id;

    -- Update profile with organisation_id
    UPDATE profiles
    SET organisation_id = v_org_id
    WHERE id = v_profile_id;

    RAISE NOTICE 'Updated profile with organisation_id';

    -- Create organisation_members record
    INSERT INTO organisation_members (
        organisation_id,
        profile_id,
        role,
        status,
        joined_at
    ) VALUES (
        v_org_id,
        v_profile_id,
        'owner',
        'active',
        NOW()
    );

    RAISE NOTICE 'Created organisation_members record';
    RAISE NOTICE '✅ New organisation created and camp organizer linked!';
    RAISE NOTICE 'Organisation ID: %', v_org_id;
END $$;
*/

-- ============================================================================
-- OPTION C: Quick fix using your current user ID (if you're logged in)
-- ============================================================================
-- This option uses auth.uid() to get your current logged-in user
-- Just uncomment and replace the organisation_id

/*
DO $$
DECLARE
    v_profile_id UUID := auth.uid(); -- Your current user ID
    v_org_id UUID := 'YOUR_ORGANISATION_ID'; -- REPLACE THIS
BEGIN
    -- Verify you're a camp organizer
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_profile_id AND role = 'camp_organizer') THEN
        RAISE EXCEPTION 'You are not logged in as a camp_organizer';
    END IF;

    -- Update profile with organisation_id
    UPDATE profiles
    SET organisation_id = v_org_id
    WHERE id = v_profile_id;

    RAISE NOTICE 'Updated profile with organisation_id';

    -- Create or update organisation_members record
    INSERT INTO organisation_members (
        organisation_id,
        profile_id,
        role,
        status,
        joined_at
    ) VALUES (
        v_org_id,
        v_profile_id,
        'owner',
        'active',
        NOW()
    )
    ON CONFLICT (organisation_id, profile_id)
    DO UPDATE SET
        status = 'active',
        role = 'owner';

    RAISE NOTICE 'Created/updated organisation_members record';
    RAISE NOTICE '✅ Camp organizer successfully linked to organisation!';
END $$;
*/

-- ============================================================================
-- STEP 4: Verify the fix worked
-- ============================================================================
SELECT
    '=== VERIFICATION ===' as info,
    au.email,
    p.role,
    p.organisation_id,
    o.name as organisation_name,
    om.role as member_role,
    om.status as member_status,
    CASE
        WHEN p.organisation_id IS NOT NULL
         AND om.id IS NOT NULL
         AND om.status = 'active' THEN '✅ READY TO USE'
        ELSE '❌ STILL HAS ISSUES'
    END as ready_status
FROM profiles p
JOIN auth.users au ON au.id = p.id
LEFT JOIN organisations o ON o.id = p.organisation_id
LEFT JOIN organisation_members om ON om.profile_id = p.id AND om.organisation_id = p.organisation_id
WHERE p.role = 'camp_organizer'
ORDER BY p.created_at DESC;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
/*
1. Run STEP 1 to add missing column
2. Run STEP 2 to see current status (note the email from auth.users)
3. Run STEP 3 to see available organisations
4. Choose an option:
   - OPTION A: Link to existing org (requires email)
   - OPTION B: Create new org (requires email)
   - OPTION C: Quick fix if you're logged in as camp organizer (easiest!)
5. Uncomment your chosen option, replace the values, and run it
6. Run STEP 4 to verify everything worked
7. Sign out and sign back in to your app
8. Navigate to /organizer-dashboard
9. You should see only your organisation's camps!

TIP: OPTION C is easiest if you're logged into Supabase as the camp organizer
*/
