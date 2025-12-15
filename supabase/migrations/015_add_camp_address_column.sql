-- Migration: Add camp_address column to camps table
-- This column stores the physical address of the camp venue

-- Add camp_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'camps'
        AND column_name = 'camp_address'
    ) THEN
        ALTER TABLE camps ADD COLUMN camp_address TEXT;

        COMMENT ON COLUMN camps.camp_address IS 'Complete physical address of the camp venue (optional)';
    END IF;
END $$;
