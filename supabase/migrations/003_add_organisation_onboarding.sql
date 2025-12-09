-- Migration: Add onboarding and payout fields to organisations
-- Phase 1: Core Setup - Steps 3 & 5
-- Description: Adds onboarding workflow tracking and Stripe Connect integration fields

-- Add onboarding status tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending_application'
  CHECK (onboarding_status IN (
    'pending_application',
    'pending_verification',
    'pending_approval',
    'active',
    'suspended',
    'rejected'
  )),
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_notes TEXT;

-- Add Stripe Connect fields for payouts
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected'
  CHECK (stripe_account_status IN (
    'not_connected',
    'pending',
    'enabled',
    'disabled',
    'rejected'
  )),
ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payout_schedule TEXT DEFAULT 'monthly'
  CHECK (payout_schedule IN ('weekly', 'biweekly', 'monthly')),
ADD COLUMN IF NOT EXISTS minimum_payout_amount DECIMAL(10,2) DEFAULT 50.00;

-- Add business verification fields
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS business_type TEXT
  CHECK (business_type IN ('individual', 'company', 'nonprofit', 'government')),
ADD COLUMN IF NOT EXISTS company_registration_number TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS identity_verification_status TEXT DEFAULT 'not_verified'
  CHECK (identity_verification_status IN ('not_verified', 'pending', 'verified', 'failed'));

-- Add approval tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_organisations_onboarding_status ON organisations(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_organisations_stripe_account_id ON organisations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organisations_payout_enabled ON organisations(payout_enabled);

-- Add comments
COMMENT ON COLUMN organisations.onboarding_status IS 'Current onboarding stage: pending_application → pending_verification → pending_approval → active';
COMMENT ON COLUMN organisations.stripe_account_id IS 'Stripe Connect account ID for receiving payouts';
COMMENT ON COLUMN organisations.payout_enabled IS 'Whether organisation can receive automated payouts';
COMMENT ON COLUMN organisations.payout_schedule IS 'How often payouts are processed: weekly, biweekly, monthly';
COMMENT ON COLUMN organisations.minimum_payout_amount IS 'Minimum amount required before payout is processed';
