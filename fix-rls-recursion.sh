#!/bin/bash

# Script to fix infinite recursion in RLS policies
# This applies migration 009 to fix the organisation_members table policies

echo "🔧 Fixing infinite recursion in RLS policies..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Make sure you're in the project root directory"
    exit 1
fi

echo "📋 Migration Summary:"
echo "  - Drop problematic self-referential RLS policies"
echo "  - Create SECURITY DEFINER helper functions"
echo "  - Recreate policies using helper functions"
echo ""

read -p "Do you want to apply this migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Applying migration..."
echo ""

# Apply the migration using supabase CLI
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the camps page at /admin/dashboard/camps"
    echo "2. Check browser console for any errors"
    echo "3. Verify that camps data loads correctly"
    echo ""
    echo "If you still see issues, check:"
    echo "  - User role is correct (super_admin or camp_organizer)"
    echo "  - Camps exist in the database"
    echo "  - Organisation relationships are set up correctly"
else
    echo ""
    echo "❌ Migration failed"
    echo "Check the error message above for details"
    exit 1
fi
