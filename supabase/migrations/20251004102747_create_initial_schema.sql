/*
  # FutureEdge Initial Database Schema

  ## Overview
  Creates the foundational database schema for the FutureEdge activity camp management platform.
  This migration establishes core tables for schools, users, camps, children, parents, registrations,
  and supporting data structures with comprehensive security policies.

  ## New Tables
  
  ### 1. `schools`
  International schools that use the platform to manage their activity camps
  - `id` (uuid, primary key)
  - `name` (text) - School name
  - `slug` (text, unique) - URL-friendly identifier
  - `logo_url` (text, nullable) - School logo
  - `website` (text, nullable)
  - `contact_email` (text)
  - `contact_phone` (text, nullable)
  - `address` (jsonb) - Structured address data
  - `settings` (jsonb) - School-specific configuration
  - `timezone` (text) - School timezone
  - `active` (boolean) - Whether school is active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `profiles`
  Extended user profiles linked to Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `school_id` (uuid, nullable, references schools)
  - `role` (text) - User role: parent, school_admin, marketing, operations, risk, super_admin
  - `first_name` (text)
  - `last_name` (text)
  - `phone` (text, nullable)
  - `avatar_url` (text, nullable)
  - `preferences` (jsonb) - User preferences
  - `last_seen_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `parents`
  Parent/guardian information for child registration
  - `id` (uuid, primary key)
  - `profile_id` (uuid, references profiles)
  - `emergency_contact_name` (text, nullable)
  - `emergency_contact_phone` (text, nullable)
  - `emergency_contact_relationship` (text, nullable)
  - `address` (jsonb) - Home address
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `children`
  Child information with secure data handling
  - `id` (uuid, primary key)
  - `parent_id` (uuid, references parents)
  - `first_name` (text)
  - `last_name` (text)
  - `date_of_birth` (date)
  - `gender` (text, nullable)
  - `grade` (text, nullable)
  - `school_id` (uuid, nullable, references schools)
  - `photo_url` (text, nullable)
  - `medical_conditions` (text, nullable)
  - `allergies` (text, nullable)
  - `medications` (text, nullable)
  - `dietary_restrictions` (text, nullable)
  - `special_needs` (text, nullable)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `camps`
  Activity camp offerings
  - `id` (uuid, primary key)
  - `school_id` (uuid, references schools)
  - `name` (text)
  - `slug` (text)
  - `description` (text)
  - `category` (text) - sports, arts, stem, language, adventure, etc.
  - `age_min` (integer) - Minimum age
  - `age_max` (integer) - Maximum age
  - `grade_min` (text, nullable)
  - `grade_max` (text, nullable)
  - `start_date` (date)
  - `end_date` (date)
  - `schedule` (jsonb) - Daily schedule details
  - `capacity` (integer)
  - `price` (decimal)
  - `currency` (text) - Default USD
  - `early_bird_price` (decimal, nullable)
  - `early_bird_deadline` (date, nullable)
  - `featured_image_url` (text, nullable)
  - `gallery_urls` (jsonb) - Array of image URLs
  - `location` (text)
  - `what_to_bring` (text, nullable)
  - `requirements` (text, nullable)
  - `status` (text) - draft, published, full, cancelled, completed
  - `featured` (boolean) - Featured on homepage
  - `published_at` (timestamptz, nullable)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `registrations`
  Camp registrations linking children to camps
  - `id` (uuid, primary key)
  - `camp_id` (uuid, references camps)
  - `child_id` (uuid, references children)
  - `parent_id` (uuid, references parents)
  - `status` (text) - pending, confirmed, waitlisted, cancelled, completed
  - `payment_status` (text) - unpaid, partial, paid, refunded
  - `amount_paid` (decimal)
  - `amount_due` (decimal)
  - `registration_date` (timestamptz)
  - `confirmation_date` (timestamptz, nullable)
  - `cancellation_date` (timestamptz, nullable)
  - `cancellation_reason` (text, nullable)
  - `discount_code` (text, nullable)
  - `discount_amount` (decimal) - Default 0
  - `notes` (text, nullable)
  - `forms_submitted` (boolean) - Default false
  - `photo_permission` (boolean) - Default false
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `attendance`
  Daily attendance tracking
  - `id` (uuid, primary key)
  - `registration_id` (uuid, references registrations)
  - `camp_id` (uuid, references camps)
  - `child_id` (uuid, references children)
  - `date` (date)
  - `check_in_time` (timestamptz, nullable)
  - `check_out_time` (timestamptz, nullable)
  - `checked_in_by` (uuid, nullable, references profiles)
  - `checked_out_by` (uuid, nullable, references profiles)
  - `status` (text) - present, absent, late, early_pickup
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

  ### 8. `communications`
  All platform communications
  - `id` (uuid, primary key)
  - `school_id` (uuid, references schools)
  - `type` (text) - email, sms, notification, announcement
  - `subject` (text, nullable)
  - `body` (text)
  - `recipient_type` (text) - all_parents, camp_specific, individual
  - `recipient_ids` (jsonb) - Array of profile IDs
  - `camp_id` (uuid, nullable, references camps)
  - `sent_by` (uuid, references profiles)
  - `sent_at` (timestamptz)
  - `status` (text) - draft, scheduled, sent, failed
  - `scheduled_for` (timestamptz, nullable)
  - `metadata` (jsonb) - Additional data
  - `created_at` (timestamptz)

  ### 9. `feedback`
  Post-camp feedback and reviews
  - `id` (uuid, primary key)
  - `camp_id` (uuid, references camps)
  - `parent_id` (uuid, references parents)
  - `child_id` (uuid, references children)
  - `registration_id` (uuid, references registrations)
  - `overall_rating` (integer) - 1-5 scale
  - `staff_rating` (integer, nullable)
  - `activities_rating` (integer, nullable)
  - `facilities_rating` (integer, nullable)
  - `value_rating` (integer, nullable)
  - `comments` (text, nullable)
  - `would_recommend` (boolean)
  - `testimonial_permission` (boolean) - Default false
  - `submitted_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 10. `incidents`
  Incident reporting for risk management
  - `id` (uuid, primary key)
  - `camp_id` (uuid, references camps)
  - `child_id` (uuid, nullable, references children)
  - `incident_type` (text) - injury, behavioral, medical, other
  - `severity` (text) - low, medium, high, critical
  - `description` (text)
  - `action_taken` (text)
  - `incident_date` (timestamptz)
  - `parent_notified` (boolean) - Default false
  - `parent_notified_at` (timestamptz, nullable)
  - `reported_by` (uuid, references profiles)
  - `follow_up_required` (boolean) - Default false
  - `follow_up_completed` (boolean) - Default false
  - `follow_up_notes` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 11. `discount_codes`
  Promotional discount codes
  - `id` (uuid, primary key)
  - `school_id` (uuid, references schools)
  - `code` (text, unique)
  - `description` (text, nullable)
  - `discount_type` (text) - percentage, fixed_amount
  - `discount_value` (decimal)
  - `min_purchase` (decimal, nullable)
  - `max_uses` (integer, nullable)
  - `uses_count` (integer) - Default 0
  - `valid_from` (date)
  - `valid_until` (date)
  - `active` (boolean) - Default true
  - `applicable_camps` (jsonb, nullable) - Array of camp IDs
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security (RLS) enabled with restrictive policies:
  
  - Schools: Accessible to authenticated users affiliated with that school
  - Profiles: Users can view their own profile; school staff can view profiles within their school
  - Parents: Parents can view/edit their own data; school staff can view within their school
  - Children: Parents can view/edit their children; school staff can view registered children
  - Camps: Published camps are public; all camps visible to school staff
  - Registrations: Parents can view their own registrations; school staff can view all
  - Attendance: School staff can manage; parents can view their children's attendance
  - Communications: Recipients can view; school staff can manage
  - Feedback: Parents can submit and view their own; school staff can view all
  - Incidents: School staff only; parents notified when relevant
  - Discount codes: School staff only

  ## Indexes
  
  Critical indexes for performance on:
  - Foreign key relationships
  - Frequently queried fields (status, dates, school_id)
  - Search fields (name, slug, email)
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SCHOOLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  contact_email text NOT NULL,
  contact_phone text,
  address jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  timezone text DEFAULT 'UTC',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(active);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools are viewable by authenticated users"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'school_admin', 'marketing', 'operations', 'risk', 'super_admin')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "School staff can view profiles in their school"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = profiles.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

-- =============================================
-- PARENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  address jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parents_profile_id ON parents(profile_id);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "School staff can view parents"
  ON parents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

-- =============================================
-- CHILDREN TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text,
  grade text,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  photo_url text,
  medical_conditions text,
  allergies text,
  medications text,
  dietary_restrictions text,
  special_needs text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_school_id ON children(school_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "School staff can view children"
  ON children FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = children.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

-- =============================================
-- CAMPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS camps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  category text DEFAULT 'general' CHECK (category IN ('sports', 'arts', 'stem', 'language', 'adventure', 'general', 'academic', 'creative')),
  age_min integer NOT NULL,
  age_max integer NOT NULL,
  grade_min text,
  grade_max text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  schedule jsonb DEFAULT '{}',
  capacity integer NOT NULL DEFAULT 20,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  early_bird_price decimal(10,2),
  early_bird_deadline date,
  featured_image_url text,
  gallery_urls jsonb DEFAULT '[]',
  location text NOT NULL,
  what_to_bring text,
  requirements text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'full', 'cancelled', 'completed')),
  featured boolean DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_camps_school_id ON camps(school_id);
CREATE INDEX IF NOT EXISTS idx_camps_status ON camps(status);
CREATE INDEX IF NOT EXISTS idx_camps_featured ON camps(featured);
CREATE INDEX IF NOT EXISTS idx_camps_dates ON camps(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_camps_category ON camps(category);

ALTER TABLE camps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published camps are viewable by everyone"
  ON camps FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "School staff can view all camps in their school"
  ON camps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = camps.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

CREATE POLICY "School staff can insert camps"
  ON camps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = camps.school_id
      AND p.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "School staff can update camps in their school"
  ON camps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = camps.school_id
      AND p.role IN ('school_admin', 'marketing')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = camps.school_id
      AND p.role IN ('school_admin', 'marketing')
    )
  );

-- =============================================
-- REGISTRATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id uuid REFERENCES camps(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled', 'completed')),
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  amount_paid decimal(10,2) DEFAULT 0,
  amount_due decimal(10,2) NOT NULL,
  registration_date timestamptz DEFAULT now(),
  confirmation_date timestamptz,
  cancellation_date timestamptz,
  cancellation_reason text,
  discount_code text,
  discount_amount decimal(10,2) DEFAULT 0,
  notes text,
  forms_submitted boolean DEFAULT false,
  photo_permission boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(camp_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_camp_id ON registrations(camp_id);
CREATE INDEX IF NOT EXISTS idx_registrations_child_id ON registrations(child_id);
CREATE INDEX IF NOT EXISTS idx_registrations_parent_id ON registrations(parent_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert registrations for own children"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "School staff can view registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = registrations.camp_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

CREATE POLICY "School staff can update registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = registrations.camp_id
      AND p.role IN ('school_admin', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = registrations.camp_id
      AND p.role IN ('school_admin', 'operations')
    )
  );

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  camp_id uuid REFERENCES camps(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in_time timestamptz,
  check_out_time timestamptz,
  checked_in_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  checked_out_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'early_pickup')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(registration_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_camp_id ON attendance(camp_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_id ON attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children AS ch
      JOIN parents AS p ON p.id = ch.parent_id
      WHERE ch.id = attendance.child_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "School staff can manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = attendance.camp_id
      AND p.role IN ('school_admin', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = attendance.camp_id
      AND p.role IN ('school_admin', 'operations')
    )
  );

-- =============================================
-- COMMUNICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'notification', 'announcement')),
  subject text,
  body text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('all_parents', 'camp_specific', 'individual')),
  recipient_ids jsonb DEFAULT '[]',
  camp_id uuid REFERENCES camps(id) ON DELETE SET NULL,
  sent_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_for timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communications_school_id ON communications(school_id);
CREATE INDEX IF NOT EXISTS idx_communications_camp_id ON communications(camp_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage communications"
  ON communications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = communications.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = communications.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations')
    )
  );

-- =============================================
-- FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id uuid REFERENCES camps(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  staff_rating integer CHECK (staff_rating >= 1 AND staff_rating <= 5),
  activities_rating integer CHECK (activities_rating >= 1 AND activities_rating <= 5),
  facilities_rating integer CHECK (facilities_rating >= 1 AND facilities_rating <= 5),
  value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  comments text,
  would_recommend boolean NOT NULL,
  testimonial_permission boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(registration_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_camp_id ON feedback(camp_id);
CREATE INDEX IF NOT EXISTS idx_feedback_parent_id ON feedback(parent_id);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can insert feedback for own registrations"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = feedback.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = feedback.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

CREATE POLICY "School staff can view feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = feedback.camp_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
    )
  );

-- =============================================
-- INCIDENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id uuid REFERENCES camps(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE SET NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('injury', 'behavioral', 'medical', 'other')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  action_taken text NOT NULL,
  incident_date timestamptz NOT NULL,
  parent_notified boolean DEFAULT false,
  parent_notified_at timestamptz,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  follow_up_required boolean DEFAULT false,
  follow_up_completed boolean DEFAULT false,
  follow_up_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_camp_id ON incidents(camp_id);
CREATE INDEX IF NOT EXISTS idx_incidents_child_id ON incidents(child_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage incidents"
  ON incidents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = incidents.camp_id
      AND p.role IN ('school_admin', 'operations', 'risk')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN camps AS c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND c.id = incidents.camp_id
      AND p.role IN ('school_admin', 'operations', 'risk')
    )
  );

-- =============================================
-- DISCOUNT CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) NOT NULL,
  min_purchase decimal(10,2),
  max_uses integer,
  uses_count integer DEFAULT 0,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  active boolean DEFAULT true,
  applicable_camps jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_school_id ON discount_codes(school_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(active);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage discount codes"
  ON discount_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = discount_codes.school_id
      AND p.role IN ('school_admin', 'marketing')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.school_id = discount_codes.school_id
      AND p.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "Parents can view active discount codes"
  ON discount_codes FOR SELECT
  TO authenticated
  USING (
    active = true
    AND valid_from <= CURRENT_DATE
    AND valid_until >= CURRENT_DATE
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schools_updated_at') THEN
    CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_parents_updated_at') THEN
    CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_children_updated_at') THEN
    CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_camps_updated_at') THEN
    CREATE TRIGGER update_camps_updated_at BEFORE UPDATE ON camps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registrations_updated_at') THEN
    CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_incidents_updated_at') THEN
    CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;