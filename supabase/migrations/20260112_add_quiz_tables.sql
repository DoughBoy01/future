-- Camp Finder Quiz Tables Migration
-- Creates quiz_responses and quiz_results tables for the camp matching quiz

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  email VARCHAR(255), -- Optional, for save/share functionality

  -- Quiz answers
  child_age INTEGER NOT NULL,
  interests JSONB NOT NULL, -- Array of category_ids: ["uuid1", "uuid2"]
  budget_min INTEGER,
  budget_max INTEGER,
  duration_preference VARCHAR(20), -- 'half-day' | 'full-day' | 'week' | 'multi-week'
  special_needs JSONB, -- {dietary: ["vegetarian", "gluten-free"], accessibility: ["wheelchair"]}

  -- Session and timing metadata
  session_id VARCHAR(255) NOT NULL UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_to_complete_seconds INTEGER,
  device_type VARCHAR(20), -- 'mobile' | 'tablet' | 'desktop'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_age CHECK (child_age >= 4 AND child_age <= 18),
  CONSTRAINT valid_budget CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max),
  CONSTRAINT valid_duration CHECK (duration_preference IN ('half-day', 'full-day', 'week', 'multi-week'))
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_response_id UUID NOT NULL REFERENCES quiz_responses(id) ON DELETE CASCADE,
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

  -- Matching data
  match_score INTEGER NOT NULL, -- 0-100 internal scoring
  match_label VARCHAR(20) NOT NULL, -- 'perfect' | 'great' | 'good'
  match_reasons JSONB, -- ["Matches STEM interest", "Perfect age group", "Within budget"]
  ranking INTEGER NOT NULL, -- 1-5 (position in results)

  -- Conversion tracking
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_score CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT valid_label CHECK (match_label IN ('perfect', 'great', 'good')),
  CONSTRAINT valid_ranking CHECK (ranking >= 1 AND ranking <= 5)
);

-- Indexes for performance
CREATE INDEX idx_quiz_responses_session ON quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_email ON quiz_responses(email) WHERE email IS NOT NULL;
CREATE INDEX idx_quiz_responses_completed ON quiz_responses(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_quiz_responses_created ON quiz_responses(created_at DESC);
CREATE INDEX idx_quiz_results_response ON quiz_results(quiz_response_id);
CREATE INDEX idx_quiz_results_camp ON quiz_results(camp_id);
CREATE INDEX idx_quiz_results_clicked ON quiz_results(clicked) WHERE clicked = TRUE;

-- Updated timestamp trigger for quiz_responses
CREATE OR REPLACE FUNCTION update_quiz_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_responses_updated_at
  BEFORE UPDATE ON quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_responses_updated_at();

-- RLS Policies

-- Enable RLS
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- quiz_responses policies

-- Anyone can insert quiz responses (anonymous users)
CREATE POLICY "Anyone can create quiz responses"
  ON quiz_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own responses (by parent_id or email)
CREATE POLICY "Users can view own quiz responses"
  ON quiz_responses
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow anonymous users to view their own responses by session_id (for resume functionality)
CREATE POLICY "Anyone can view quiz responses by session"
  ON quiz_responses
  FOR SELECT
  TO public
  USING (true); -- Client-side filtering by session_id

-- Staff can view all quiz responses for analytics
CREATE POLICY "Staff can view all quiz responses"
  ON quiz_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'operations', 'marketing', 'school_admin')
    )
  );

-- Users can update their own responses (for email capture)
CREATE POLICY "Users can update own quiz responses"
  ON quiz_responses
  FOR UPDATE
  TO public
  USING (true) -- Allow anyone to update by session_id
  WITH CHECK (true);

-- quiz_results policies

-- Anyone can insert quiz results (created with response)
CREATE POLICY "Anyone can create quiz results"
  ON quiz_results
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can view quiz results (joined with responses)
CREATE POLICY "Anyone can view quiz results"
  ON quiz_results
  FOR SELECT
  TO public
  USING (true);

-- Allow updating clicked status for conversion tracking
CREATE POLICY "Anyone can update quiz results"
  ON quiz_results
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Staff can view all quiz results for analytics
CREATE POLICY "Staff can view all quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'operations', 'marketing', 'school_admin')
    )
  );

-- Comments for documentation
COMMENT ON TABLE quiz_responses IS 'Stores quiz submissions from the camp finder quiz';
COMMENT ON TABLE quiz_results IS 'Stores recommended camps for each quiz response with match scores';
COMMENT ON COLUMN quiz_responses.session_id IS 'Unique session identifier for anonymous tracking and resume functionality';
COMMENT ON COLUMN quiz_responses.interests IS 'Array of camp_category UUIDs representing child interests';
COMMENT ON COLUMN quiz_responses.special_needs IS 'JSON object with dietary and accessibility arrays';
COMMENT ON COLUMN quiz_results.match_score IS 'Internal score 0-100 used for ranking camps';
COMMENT ON COLUMN quiz_results.match_label IS 'User-facing label: perfect (80-100), great (60-79), good (30-59)';
COMMENT ON COLUMN quiz_results.match_reasons IS 'Array of human-readable explanations for the match';
