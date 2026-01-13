-- Add new fields to quiz_responses table to support enhanced quiz flow
-- This migration adds support for:
-- 1. Parent goals (what parents hope their child will gain from camp)
-- 2. Learning style preferences (how the child learns best)
-- 3. Visual examples tracking (which category previews were viewed)

-- Add new columns
ALTER TABLE quiz_responses
  ADD COLUMN IF NOT EXISTS parent_goals JSONB,
  ADD COLUMN IF NOT EXISTS learning_style VARCHAR(50),
  ADD COLUMN IF NOT EXISTS visual_examples_viewed JSONB;

-- Add constraint to ensure learning_style has valid values
ALTER TABLE quiz_responses
  DROP CONSTRAINT IF EXISTS valid_learning_style;

ALTER TABLE quiz_responses
  ADD CONSTRAINT valid_learning_style
    CHECK (learning_style IN ('hands-on', 'structured', 'balanced', NULL));

-- Add index for analytics on parent_goals (JSONB field benefits from GIN index)
DROP INDEX IF EXISTS idx_quiz_responses_parent_goals;
CREATE INDEX idx_quiz_responses_parent_goals
  ON quiz_responses USING gin(parent_goals);

-- Add comments for documentation
COMMENT ON COLUMN quiz_responses.parent_goals IS
  'Array of parent goal selections. Example: ["skill-development", "social-connection"]. Max 2 selections allowed.';

COMMENT ON COLUMN quiz_responses.learning_style IS
  'How child learns best. Values: "hands-on" (experiential learning), "structured" (guided instruction), "balanced" (mix of both), or NULL if skipped.';

COMMENT ON COLUMN quiz_responses.visual_examples_viewed IS
  'Array tracking which category preview modals were opened. Example: ["sports", "arts", "stem"]. Used for analytics.';
