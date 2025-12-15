-- Check current camp organizer profiles
SELECT
    id,
    email,
    first_name,
    last_name,
    role,
    organisation_id,
    created_at
FROM profiles
WHERE role = 'camp_organizer'
ORDER BY created_at DESC;

-- Check if there are any organisations in the database
SELECT
    id,
    name,
    slug,
    active
FROM organisations
ORDER BY created_at DESC;

-- Check organisation_members to see if camp organizers are linked
SELECT
    om.id,
    p.email,
    p.role,
    o.name as organisation_name,
    om.role as member_role,
    om.status
FROM organisation_members om
JOIN profiles p ON p.id = om.profile_id
JOIN organisations o ON o.id = om.organisation_id
WHERE p.role = 'camp_organizer';

-- OPTION 1: If you have organisations, link your camp organizer to one
-- Replace YOUR_EMAIL and ORGANISATION_ID below
/*
UPDATE profiles
SET organisation_id = 'ORGANISATION_ID_HERE'
WHERE email = 'YOUR_EMAIL_HERE' AND role = 'camp_organizer';
*/

-- OPTION 2: Create a test organisation if you don't have one
/*
INSERT INTO organisations (
    name,
    slug,
    contact_email,
    active,
    verified
) VALUES (
    'Test Camp Organisation',
    'test-camp-org',
    'test@example.com',
    true,
    true
) RETURNING id;

-- Then update your profile with the returned ID:
UPDATE profiles
SET organisation_id = 'RETURNED_ID_FROM_ABOVE'
WHERE email = 'YOUR_EMAIL_HERE' AND role = 'camp_organizer';
*/

-- OPTION 3: Create both organisation_member record AND update profile
/*
-- First insert into organisation_members
INSERT INTO organisation_members (
    organisation_id,
    profile_id,
    role,
    status
) VALUES (
    'ORGANISATION_ID_HERE',
    (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL_HERE' AND role = 'camp_organizer'),
    'owner',
    'active'
);

-- Then update the profile
UPDATE profiles
SET organisation_id = 'ORGANISATION_ID_HERE'
WHERE email = 'YOUR_EMAIL_HERE' AND role = 'camp_organizer';
*/
