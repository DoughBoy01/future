/*
  # Seed Test Data for All Tables
  
  This migration creates sample data across all tables to test the data management dashboard.
  
  1. Schools - Create 3 sample schools
  2. Profiles - Ensure super_admin profile exists
  3. Parents - Create sample parent records
  4. Children - Create sample children records
  5. Camps - Create sample camp records with various statuses
  6. Registrations - Create sample registration records
  7. Communications - Create sample communication records
  8. Discount Codes - Create sample discount codes
  9. Incidents - Create sample incident records
  10. Feedback - Create sample feedback records
  
  All data is test data and can be safely deleted.
*/

-- Insert sample schools
INSERT INTO schools (id, name, slug, contact_email, contact_phone, website, timezone, active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sunrise Academy', 'sunrise-academy', 'contact@sunriseacademy.com', '555-0101', 'https://sunriseacademy.com', 'America/New_York', true),
  ('22222222-2222-2222-2222-222222222222', 'Mountain View School', 'mountain-view-school', 'info@mountainview.edu', '555-0102', 'https://mountainview.edu', 'America/Los_Angeles', true),
  ('33333333-3333-3333-3333-333333333333', 'Riverside Learning Center', 'riverside-learning', 'hello@riverside.org', '555-0103', 'https://riverside.org', 'America/Chicago', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample camps
INSERT INTO camps (id, school_id, name, slug, description, category, age_min, age_max, grade_min, grade_max, start_date, end_date, capacity, price, location, status, featured, created_by)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Summer Sports Camp', 'summer-sports-camp', 'An exciting week of sports activities including soccer, basketball, and swimming', 'sports', 8, 14, '3rd', '8th', '2025-06-15', '2025-06-20', 30, 499.00, 'Sunrise Academy Campus', 'published', true, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Creative Arts Workshop', 'creative-arts-workshop', 'Explore painting, sculpture, and digital art with professional artists', 'arts', 10, 16, '5th', '10th', '2025-07-01', '2025-07-05', 20, 599.00, 'Downtown Arts Center', 'published', true, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'STEM Innovation Camp', 'stem-innovation-camp', 'Hands-on coding, robotics, and engineering projects', 'stem', 12, 17, '6th', '11th', '2025-07-15', '2025-07-22', 25, 799.00, 'Mountain View Tech Lab', 'published', false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Adventure Outdoors', 'adventure-outdoors', 'Hiking, camping, and outdoor survival skills', 'adventure', 13, 18, '7th', '12th', '2025-08-01', '2025-08-07', 15, 899.00, 'Mountain Range National Park', 'published', false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Language Immersion', 'language-immersion', 'Spanish and French language learning through games and activities', 'language', 8, 14, '3rd', '8th', '2025-06-22', '2025-06-28', 18, 549.00, 'Riverside Learning Center', 'draft', false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Academic Enrichment', 'academic-enrichment', 'Math and science tutoring with certified teachers', 'academic', 10, 15, '5th', '9th', '2025-07-08', '2025-07-12', 12, 449.00, 'Riverside Learning Center', 'cancelled', false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample parents (only if they don't exist)
INSERT INTO parents (id, profile_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00', 'Jane Doe', '555-0201', 'Grandmother')
ON CONFLICT (id) DO NOTHING;

-- Insert sample children
INSERT INTO children (id, parent_id, first_name, last_name, date_of_birth, gender, grade, school_id, allergies, medical_conditions)
VALUES
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Emma', 'Smith', '2013-05-15', 'Female', '6th', '11111111-1111-1111-1111-111111111111', 'Peanuts', 'None'),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Liam', 'Smith', '2015-08-22', 'Male', '4th', '11111111-1111-1111-1111-111111111111', 'None', 'Asthma'),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Olivia', 'Johnson', '2012-03-10', 'Female', '7th', '22222222-2222-2222-2222-222222222222', 'Dairy', 'None')
ON CONFLICT (id) DO NOTHING;

-- Insert sample registrations
INSERT INTO registrations (id, camp_id, child_id, parent_id, status, payment_status, amount_paid, amount_due, forms_submitted, photo_permission)
VALUES
  ('88888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'confirmed', 'paid', 499.00, 499.00, true, true),
  ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'confirmed', 'paid', 599.00, 599.00, true, false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'pending', 'partial', 400.00, 799.00, false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample communications
INSERT INTO communications (id, school_id, type, subject, body, recipient_type, status, sent_by)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'email', 'Summer Camp Registration Open', 'Dear Parents, Registration for our summer camps is now open! Visit our website to secure your spots.', 'all_parents', 'sent', 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111111', 'email', 'What to Bring to Camp', 'Important reminder: Please ensure your child brings sunscreen, water bottle, and comfortable shoes.', 'camp_specific', 'draft', 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222222', 'notification', 'Weather Update', 'Due to forecasted rain tomorrow, all outdoor activities will be moved indoors.', 'all_parents', 'scheduled', 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample discount codes
INSERT INTO discount_codes (id, school_id, code, description, discount_type, discount_value, valid_from, valid_until, active, max_uses, uses_count, created_by)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'SUMMER2025', 'Early bird discount for summer camps', 'percentage', 15, '2025-03-01', '2025-05-31', true, 100, 23, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '11111111-1111-1111-1111-111111111111', 'SIBLING20', 'Sibling discount', 'percentage', 20, '2025-01-01', '2025-12-31', true, null, 12, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', '22222222-2222-2222-2222-222222222222', 'SAVE50', '50 dollars off any camp', 'fixed_amount', 50, '2025-04-01', '2025-06-30', true, 50, 8, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', '33333333-3333-3333-3333-333333333333', 'EXPIRED', 'Expired promotional code', 'percentage', 10, '2024-01-01', '2024-12-31', false, 100, 87, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample incidents
INSERT INTO incidents (id, camp_id, child_id, incident_type, severity, description, action_taken, incident_date, parent_notified, follow_up_required, follow_up_completed, reported_by)
VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'injury', 'low', 'Minor scrape on knee during soccer game', 'Applied first aid, bandaged wound', '2025-06-16 14:30:00+00', true, false, false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'behavioral', 'medium', 'Child was disruptive during art class', 'Spoke with child, timeout given', '2025-07-02 10:15:00+00', true, true, false, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'medical', 'high', 'Child experienced asthma symptoms', 'Administered inhaler, parent called to pick up', '2025-07-17 11:00:00+00', true, true, true, 'c0ea4ade-19a0-4af6-af00-2e1aa408bd00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample feedback
INSERT INTO feedback (id, camp_id, parent_id, child_id, registration_id, overall_rating, staff_rating, activities_rating, facilities_rating, value_rating, comments, would_recommend, testimonial_permission)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 5, 5, 5, 4, 5, 'Absolutely wonderful experience! My daughter loved every minute of it. The staff were professional and caring.', true, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 4, 5, 4, 3, 4, 'Great camp overall. My son learned a lot and had fun. Facilities could be improved.', true, false)
ON CONFLICT (id) DO NOTHING;
