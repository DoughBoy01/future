-- Allow public users to view feedback/reviews for published camps
-- This enables social proof by showing reviews to all visitors

-- Drop existing policy if it exists (in case of re-run)
DROP POLICY IF EXISTS "Public users can view feedback for published camps" ON feedback;

-- Create policy to allow anyone to read feedback for published camps
CREATE POLICY "Public users can view feedback for published camps"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = feedback.camp_id
      AND camps.status = 'published'
    )
  );

-- Add comment explaining the policy
COMMENT ON POLICY "Public users can view feedback for published camps" ON feedback IS
  'Allows anonymous and authenticated users to view feedback/reviews for published camps. This enables social proof on camp detail pages.';
