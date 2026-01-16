-- ============================================================
-- FIX calculate_commission FUNCTION - UPDATE TABLE REFERENCE
-- ============================================================
-- The calculate_commission function still references the old "registrations" table
-- which was renamed to "bookings" in migration 009.
-- This function is called by the auto_calculate_commission trigger when payment_status
-- changes to 'paid', causing the error "column r.amount_paid does not exist"

CREATE OR REPLACE FUNCTION public.calculate_commission(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_camp_id uuid;
  v_organisation_id uuid;
  v_commission_rate numeric;
  v_amount_paid numeric;
  v_commission_amount numeric;
BEGIN
  -- Get booking details (changed from "registrations r" to "bookings b")
  SELECT
    b.camp_id,
    c.organisation_id,
    b.amount_paid
  INTO
    v_camp_id,
    v_organisation_id,
    v_amount_paid
  FROM bookings b  -- FIXED: Changed from "registrations r" to "bookings b"
  JOIN camps c ON c.id = b.camp_id
  WHERE b.id = p_registration_id;

  IF v_camp_id IS NULL THEN
    RETURN;
  END IF;

  -- Get commission rate
  v_commission_rate := get_camp_commission_rate(v_camp_id);

  -- Calculate commission amount
  v_commission_amount := (v_amount_paid * v_commission_rate / 100);

  -- Insert or update commission record
  INSERT INTO commission_records (
    organisation_id,
    camp_id,
    booking_id,  -- FIXED: Changed from registration_id to booking_id
    commission_rate,
    registration_amount,
    commission_amount,
    payment_status
  ) VALUES (
    v_organisation_id,
    v_camp_id,
    p_registration_id,
    v_commission_rate,
    v_amount_paid,
    v_commission_amount,
    'pending'
  )
  ON CONFLICT (booking_id) DO UPDATE SET  -- FIXED: Changed from registration_id to booking_id
    registration_amount = EXCLUDED.registration_amount,
    commission_rate = EXCLUDED.commission_rate,
    commission_amount = EXCLUDED.commission_amount,
    updated_at = now();
END;
$function$;

COMMENT ON FUNCTION public.calculate_commission IS
'Calculates commission for a booking (formerly registration) when payment is received. Updated to reference bookings table instead of old registrations table.';
