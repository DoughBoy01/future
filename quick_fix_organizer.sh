#!/bin/bash

# Quick fix script for camp organizer missing organisation_id
# This script will help you link your camp organizer to an organisation

echo "==================================="
echo "Camp Organizer Organisation Fix"
echo "==================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

echo "📊 Checking current database state..."
echo ""

# Run the check queries using psql or supabase
npx supabase db execute "
SELECT
    'Camp Organizers' as type,
    COUNT(*) as count,
    COUNT(CASE WHEN organisation_id IS NULL THEN 1 END) as missing_org_id
FROM profiles
WHERE role = 'camp_organizer';

SELECT
    'Organisations' as type,
    COUNT(*) as count
FROM organisations
WHERE active = true;
" 2>/dev/null || echo "⚠️  Could not run query. Please use Supabase Studio instead."

echo ""
echo "==================================="
echo "Next Steps:"
echo "==================================="
echo ""
echo "1. Open Supabase Studio (your database UI)"
echo "2. Go to SQL Editor"
echo "3. Run the queries in check_and_fix_organizer.sql"
echo "4. Find your organisation ID"
echo "5. Update your profile with the organisation_id"
echo ""
echo "OR use this quick command in Supabase SQL Editor:"
echo ""
echo "-- List organisations"
echo "SELECT id, name FROM organisations WHERE active = true;"
echo ""
echo "-- Update your camp organizer profile (replace EMAIL and ORG_ID)"
echo "UPDATE profiles"
echo "SET organisation_id = 'YOUR_ORG_ID_HERE'"
echo "WHERE email = 'YOUR_EMAIL_HERE' AND role = 'camp_organizer';"
echo ""
