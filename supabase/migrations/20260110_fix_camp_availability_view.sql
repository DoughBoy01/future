-- ============================================================
-- FIX camp_availability VIEW - UPDATE TABLE REFERENCE
-- ============================================================
-- The camp_availability view was created before the registrations→bookings rename
-- and is still referencing the old "registrations" table name.
-- This causes errors when updating bookings with payment_status changes.

-- Drop the existing view
DROP VIEW IF EXISTS public.camp_availability CASCADE;

-- Recreate the view with the correct table name (bookings instead of registrations)
CREATE VIEW public.camp_availability
WITH (security_invoker=true)  -- Explicitly use invoker's permissions
AS
SELECT
  c.id,
  c.name,
  c.capacity,
  c.enrolled_count,
  c.capacity - c.enrolled_count AS available_places,
  COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_count,
  COUNT(CASE WHEN b.status = 'waitlisted' THEN 1 END) AS waitlist_count,
  COUNT(CASE WHEN b.status = 'pending' THEN 1 END) AS pending_count,
  CASE
    WHEN c.capacity - c.enrolled_count <= 0 THEN 'full'
    WHEN c.capacity - c.enrolled_count <= 5 THEN 'limited'
    ELSE 'available'
  END AS availability_status
FROM camps c
LEFT JOIN bookings b ON b.camp_id = c.id  -- Changed from "registrations r" to "bookings b"
GROUP BY c.id, c.name, c.capacity, c.enrolled_count;

COMMENT ON VIEW public.camp_availability IS
'Real-time camp availability view - uses SECURITY INVOKER to respect RLS policies. Updated to reference bookings table instead of old registrations table.';
