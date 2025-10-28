/*
  # Add Payment Tracking and Registration Form Status

  ## Overview
  This migration adds comprehensive payment tracking through Stripe and registration form completion status.

  ## New Tables
  
  ### `payment_records`
  Tracks all payment transactions through Stripe
  - `id` (uuid, primary key)
  - `registration_id` (uuid, foreign key to registrations)
  - `stripe_payment_intent_id` (text, unique) - Stripe payment intent ID
  - `stripe_checkout_session_id` (text, unique) - Stripe checkout session ID
  - `amount` (numeric) - Amount paid
  - `currency` (text) - Currency code
  - `status` (text) - Payment status: pending, succeeded, failed, refunded
  - `payment_method` (text) - Payment method type
  - `metadata` (jsonb) - Additional payment metadata
  - `paid_at` (timestamptz) - When payment succeeded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `registration_forms`
  Tracks completion status of comprehensive child information forms
  - `id` (uuid, primary key)
  - `registration_id` (uuid, foreign key to registrations, unique)
  - `child_id` (uuid, foreign key to children)
  - `completed` (boolean) - Whether form is fully completed
  - `submitted_at` (timestamptz) - When form was submitted
  - `form_data` (jsonb) - Stores form responses
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Table Modifications
  
  ### `registrations`
  - Add `stripe_checkout_session_id` (text, nullable) - Link to Stripe checkout
  - Add `form_completed` (boolean, default false) - Quick lookup for form status
  - Add `form_completed_at` (timestamptz, nullable) - When form was completed

  ## Security
  - Enable RLS on all new tables
  - Parents can view their own payment records
  - Parents can create and update their own registration forms
  - Admins can view all payment records and forms
  - System can update payment records via service role

  ## Indexes
  - Index on payment_records(registration_id)
  - Index on payment_records(stripe_payment_intent_id)
  - Index on payment_records(stripe_checkout_session_id)
  - Index on registration_forms(registration_id)
  - Index on registrations(form_completed)
*/

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  payment_method text,
  metadata jsonb DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create registration_forms table
CREATE TABLE IF NOT EXISTS registration_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  submitted_at timestamptz,
  form_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add columns to registrations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN stripe_checkout_session_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'form_completed'
  ) THEN
    ALTER TABLE registrations ADD COLUMN form_completed boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'form_completed_at'
  ) THEN
    ALTER TABLE registrations ADD COLUMN form_completed_at timestamptz;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_registration_id ON payment_records(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_payment_intent ON payment_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_checkout_session ON payment_records(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_registration_forms_registration_id ON registration_forms(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_form_completed ON registrations(form_completed);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_records

-- Parents can view their own payment records
CREATE POLICY "Parents can view own payment records"
  ON payment_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = payment_records.registration_id
      AND prof.id = auth.uid()
    )
  );

-- Admins and operations can view all payment records
CREATE POLICY "Admins can view all payment records"
  ON payment_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  );

-- System can insert payment records (via service role or authenticated users)
CREATE POLICY "System can create payment records"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = payment_records.registration_id
      AND prof.id = auth.uid()
    )
  );

-- System can update payment records
CREATE POLICY "System can update payment records"
  ON payment_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = payment_records.registration_id
      AND prof.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = payment_records.registration_id
      AND prof.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  );

-- RLS Policies for registration_forms

-- Parents can view their own registration forms
CREATE POLICY "Parents can view own registration forms"
  ON registration_forms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = registration_forms.registration_id
      AND prof.id = auth.uid()
    )
  );

-- Parents can create their own registration forms
CREATE POLICY "Parents can create own registration forms"
  ON registration_forms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = registration_forms.registration_id
      AND prof.id = auth.uid()
    )
  );

-- Parents can update their own registration forms
CREATE POLICY "Parents can update own registration forms"
  ON registration_forms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = registration_forms.registration_id
      AND prof.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations r
      INNER JOIN parents p ON p.id = r.parent_id
      INNER JOIN profiles prof ON prof.id = p.profile_id
      WHERE r.id = registration_forms.registration_id
      AND prof.id = auth.uid()
    )
  );

-- Admins can view all registration forms
CREATE POLICY "Admins can view all registration forms"
  ON registration_forms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_records_updated_at'
  ) THEN
    CREATE TRIGGER update_payment_records_updated_at
      BEFORE UPDATE ON payment_records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_registration_forms_updated_at'
  ) THEN
    CREATE TRIGGER update_registration_forms_updated_at
      BEFORE UPDATE ON registration_forms
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
