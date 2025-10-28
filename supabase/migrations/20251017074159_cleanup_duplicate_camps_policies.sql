/*
  # Cleanup Duplicate Camps RLS Policies

  ## Overview
  Removes duplicate RLS policies on the camps table. There are overlapping policies with similar 
  functionality that need to be consolidated.

  ## Problem
  - Multiple policies with similar names doing the same thing
  - "Organisation staff..." policies overlap with "School admins..." policies
  - This creates confusion and potential policy conflicts

  ## Changes
  1. Keep the more recent "School admins..." named policies (they use correct column names)
  2. Remove the duplicate "Organisation staff..." policies
  3. Ensure clean, non-overlapping policy set

  ## Security Notes
  - All policies require authentication
  - Maintains same access control levels
  - No change to actual security enforcement
*/

-- Remove duplicate policies (keeping the "School admins..." versions)
DROP POLICY IF EXISTS "Organisation staff can insert camps" ON camps;
DROP POLICY IF EXISTS "Organisation staff can update camps in their organisation" ON camps;
DROP POLICY IF EXISTS "Organisation staff can view all camps in their organisation" ON camps;
