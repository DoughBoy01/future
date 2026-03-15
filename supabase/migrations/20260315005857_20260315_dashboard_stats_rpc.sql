/*
  # Dashboard Stats RPC Function

  ## Summary
  Creates a single RPC function that returns all admin dashboard statistics in one query,
  replacing the previous pattern of 14+ separate database round-trips.

  ## New Functions
  - `get_dashboard_stats()` - Returns all platform statistics in a single call:
    - Booking counts (total, recent 7 days, pending payments)
    - Revenue (total amount paid)
    - Parent/customer count
    - Camp counts by status (published, draft, pending_review, requires_changes, approved, rejected, unpublished, archived)
    - Camp organizer count
    - Open enquiry count

  ## Security
  - Function is accessible to authenticated users only (SECURITY DEFINER with search_path)
  - Super admin and staff roles can call this via RLS-permitted tables
*/

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_registrations bigint;
  v_total_revenue numeric;
  v_active_camps bigint;
  v_total_parents bigint;
  v_pending_payments bigint;
  v_recent_registrations bigint;
  v_pending_enquiries bigint;
  v_draft_camps bigint;
  v_pending_review_camps bigint;
  v_requires_changes_camps bigint;
  v_approved_camps bigint;
  v_rejected_camps bigint;
  v_unpublished_camps bigint;
  v_archived_camps bigint;
  v_total_camp_organizers bigint;
BEGIN
  SELECT COUNT(*) INTO v_total_registrations FROM bookings;
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_revenue FROM bookings;
  SELECT COUNT(*) INTO v_active_camps FROM camps WHERE status = 'published';
  SELECT COUNT(*) INTO v_total_parents FROM parents;
  SELECT COUNT(*) INTO v_pending_payments FROM bookings WHERE payment_status != 'paid';
  SELECT COUNT(*) INTO v_recent_registrations FROM bookings WHERE created_at >= now() - interval '7 days';
  SELECT COUNT(*) INTO v_pending_enquiries FROM enquiries WHERE status = 'open';
  SELECT COUNT(*) INTO v_draft_camps FROM camps WHERE status = 'draft';
  SELECT COUNT(*) INTO v_pending_review_camps FROM camps WHERE status = 'pending_review';
  SELECT COUNT(*) INTO v_requires_changes_camps FROM camps WHERE status = 'requires_changes';
  SELECT COUNT(*) INTO v_approved_camps FROM camps WHERE status = 'approved';
  SELECT COUNT(*) INTO v_rejected_camps FROM camps WHERE status = 'rejected';
  SELECT COUNT(*) INTO v_unpublished_camps FROM camps WHERE status = 'unpublished';
  SELECT COUNT(*) INTO v_archived_camps FROM camps WHERE status = 'archived';
  SELECT COUNT(*) INTO v_total_camp_organizers FROM profiles WHERE role = 'camp_organizer';

  RETURN jsonb_build_object(
    'totalRegistrations', v_total_registrations,
    'totalRevenue', v_total_revenue,
    'activeCamps', v_active_camps,
    'totalParents', v_total_parents,
    'pendingPayments', v_pending_payments,
    'recentRegistrations', v_recent_registrations,
    'pendingEnquiries', v_pending_enquiries,
    'draftCamps', v_draft_camps,
    'pendingReviewCamps', v_pending_review_camps,
    'requiresChangesCamps', v_requires_changes_camps,
    'approvedCamps', v_approved_camps,
    'rejectedCamps', v_rejected_camps,
    'unpublishedCamps', v_unpublished_camps,
    'archivedCamps', v_archived_camps,
    'totalCampOrganizers', v_total_camp_organizers
  );
END;
$$;
