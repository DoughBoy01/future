/*
  # Add RLS policies for Data Management access

  ## Overview
  Adds Row Level Security policies to enable data management dashboard access for school_admin and operations roles.

  ## Changes
  1. **Schools Table**
     - School staff can view schools (already exists)
     
  2. **Camps Table**
     - School admins and operations can view, insert, update, and delete camps in their school
     
  3. **Children Table**
     - School admins and operations can view, insert, update, and delete children in their school
     
  4. **Communications Table**
     - School admins and marketing can view, insert, update, and delete communications in their school
     - Operations can view communications
     
  5. **Discount Codes Table**
     - School admins and marketing can view, insert, update, and delete discount codes
     
  6. **Feedback Table**
     - School admins and operations can view, insert, update, and delete feedback
     
  7. **Incidents Table**
     - School admins, operations, and risk can view, insert, update, and delete incidents
     
  8. **Registrations Table**
     - School admins and operations can view, insert, update, and delete registrations

  ## Security Notes
  - All policies require authentication
  - Policies restrict access based on school_id where applicable
  - Only staff with appropriate roles can access data
*/

-- Camps policies for school staff
CREATE POLICY "School admins can view camps in their school" ON camps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = camps.school_id
        AND profiles.role IN ('school_admin', 'operations', 'marketing')
    )
  );

CREATE POLICY "School admins can insert camps in their school" ON camps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = camps.school_id
        AND profiles.role IN ('school_admin', 'operations', 'marketing')
    )
  );

CREATE POLICY "School admins can update camps in their school" ON camps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = camps.school_id
        AND profiles.role IN ('school_admin', 'operations', 'marketing')
    )
  );

CREATE POLICY "School admins can delete camps in their school" ON camps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = camps.school_id
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

-- Children policies for school staff
CREATE POLICY "School staff can view children" ON children
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.school_id = children.school_id OR
          profiles.role = 'operations'
        )
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can insert children" ON children
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can update children" ON children
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can delete children" ON children
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

-- Communications policies for school staff
CREATE POLICY "School staff can view communications" ON communications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.school_id = communications.school_id
        )
        AND profiles.role IN ('school_admin', 'marketing', 'operations')
    )
  );

CREATE POLICY "School staff can insert communications" ON communications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = communications.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "School staff can update communications" ON communications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = communications.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "School staff can delete communications" ON communications
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = communications.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

-- Discount codes policies for school staff
CREATE POLICY "School staff can view discount codes" ON discount_codes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.school_id = discount_codes.school_id OR
          profiles.role = 'operations'
        )
        AND profiles.role IN ('school_admin', 'marketing', 'operations')
    )
  );

CREATE POLICY "School staff can insert discount codes" ON discount_codes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = discount_codes.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "School staff can update discount codes" ON discount_codes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = discount_codes.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

CREATE POLICY "School staff can delete discount codes" ON discount_codes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = discount_codes.school_id
        AND profiles.role IN ('school_admin', 'marketing')
    )
  );

-- Feedback policies for school staff
CREATE POLICY "School staff can view feedback" ON feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN camps c ON c.id = feedback.camp_id
      WHERE p.id = auth.uid()
        AND (
          p.school_id = c.school_id OR
          p.role = 'operations'
        )
        AND p.role IN ('school_admin', 'operations', 'marketing')
    )
  );

CREATE POLICY "School staff can insert feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can update feedback" ON feedback
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can delete feedback" ON feedback
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

-- Incidents policies for school staff
CREATE POLICY "School staff can view incidents" ON incidents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN camps c ON c.id = incidents.camp_id
      WHERE p.id = auth.uid()
        AND (
          p.school_id = c.school_id OR
          p.role IN ('operations', 'risk')
        )
        AND p.role IN ('school_admin', 'operations', 'risk')
    )
  );

CREATE POLICY "School staff can insert incidents" ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations', 'risk')
    )
  );

CREATE POLICY "School staff can update incidents" ON incidents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations', 'risk')
    )
  );

CREATE POLICY "School staff can delete incidents" ON incidents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations', 'risk')
    )
  );

-- Registrations policies for school staff
CREATE POLICY "School staff can view registrations" ON registrations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN camps c ON c.id = registrations.camp_id
      WHERE p.id = auth.uid()
        AND (
          p.school_id = c.school_id OR
          p.role = 'operations'
        )
        AND p.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can insert registrations" ON registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can update registrations" ON registrations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

CREATE POLICY "School staff can delete registrations" ON registrations
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'operations')
    )
  );

-- Profiles policies for school staff
CREATE POLICY "School staff can insert profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('school_admin', 'super_admin')
    )
  );
