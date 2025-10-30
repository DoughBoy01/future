# Security Audit Report

**Date:** October 30, 2025
**Project:** FutureEdge Camp Management System
**Auditor:** Claude (Automated Security Analysis)

---

## Executive Summary

This security audit identifies **15 security issues** in the Supabase database configuration:
- **2 Critical** (SECURITY DEFINER views)
- **11 Warnings** (Mutable search paths)
- **1 Warning** (Password protection disabled)
- **1 Info** (RLS enabled but no policies)

---

## Critical Issues

### 1. SECURITY DEFINER View: `public.commission_summary`

**Severity:** 🔴 **CRITICAL**
**Status:** ⚠️ **NOT FOUND IN MIGRATIONS**

**Issue:**
View `public.commission_summary` is defined with `SECURITY DEFINER` property, which means it executes with the privileges of the user who created it, bypassing Row Level Security (RLS).

**Risk:**
- Users could potentially access commission data they shouldn't see
- Bypasses all RLS policies on underlying tables
- Could expose sensitive financial information

**Recommendation:**
```sql
-- Option 1: Remove SECURITY DEFINER if not needed
DROP VIEW IF EXISTS public.commission_summary;
CREATE OR REPLACE VIEW public.commission_summary AS
SELECT ...
-- WITHOUT SECURITY DEFINER

-- Option 2: If SECURITY DEFINER is necessary, add RLS policies to the view
CREATE POLICY "Restrict commission_summary access"
ON commission_summary FOR SELECT
TO authenticated
USING (
  -- Only super_admins and finance roles
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'finance')
  )
);
```

**Note:** This view was not found in the migration files. It may have been created manually or through Supabase dashboard.

---

### 2. SECURITY DEFINER View: `public.camp_availability`

**Severity:** 🔴 **CRITICAL**
**Status:** ✅ **FOUND - NEEDS FIX**

**Issue:**
View `public.camp_availability` (line 147 in `20251016075433_add_camp_payment_and_enquiries.sql`) does NOT currently use SECURITY DEFINER, but Supabase reports it does. This suggests it was modified after creation.

**Current Definition:**
```sql
CREATE OR REPLACE VIEW camp_availability AS
SELECT
  c.id,
  c.name,
  c.capacity,
  c.enrolled_count,
  c.capacity - c.enrolled_count AS available_places,
  COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
  COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlist_count,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) AS pending_count,
  CASE
    WHEN c.capacity - c.enrolled_count <= 0 THEN 'full'
    WHEN c.capacity - c.enrolled_count <= 5 THEN 'limited'
    ELSE 'available'
  END AS availability_status
FROM camps c
LEFT JOIN registrations r ON r.camp_id = c.id
GROUP BY c.id, c.name, c.capacity, c.enrolled_count;
```

**Risk:**
- If SECURITY DEFINER was added, anyone can see ALL camp availability regardless of RLS
- Bypasses RLS on `camps` and `registrations` tables

**Recommendation:**
```sql
-- Recreate view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.camp_availability CASCADE;
CREATE VIEW public.camp_availability
SECURITY INVOKER  -- Explicitly use invoker's permissions
AS
SELECT
  c.id,
  c.name,
  c.capacity,
  c.enrolled_count,
  c.capacity - c.enrolled_count AS available_places,
  COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
  COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlist_count,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) AS pending_count,
  CASE
    WHEN c.capacity - c.enrolled_count <= 0 THEN 'full'
    WHEN c.capacity - c.enrolled_count <= 5 THEN 'limited'
    ELSE 'available'
  END AS availability_status
FROM camps c
LEFT JOIN registrations r ON r.camp_id = c.id
GROUP BY c.id, c.name, c.capacity, c.enrolled_count;
```

---

## High Priority Warnings

### 3. Function Search Path Mutable (11 Functions)

**Severity:** 🟡 **HIGH WARNING**
**Status:** ⚠️ **NEEDS FIX**

**Affected Functions:**
1. `public.get_camp_category_names`
2. `public.get_camps_by_category`
3. `public.update_camp_enrolled_count`
4. `public.update_enquiries_updated_at`
5. `public.get_camp_commission_rate`
6. `public.get_category_stats`
7. `public.calculate_commission`
8. `public.trigger_calculate_commission`
9. `public.set_camp_commission_rate`
10. `public.mark_commission_paid`
11. `public.update_updated_at_column`

**Issue:**
Functions with mutable search paths are vulnerable to **search path injection attacks**. An attacker could:
1. Create a malicious schema with same-named tables
2. Alter their session's search_path
3. Trick the function into accessing their malicious tables instead of intended ones

**Risk Level:**
- Functions that write data: **CRITICAL**
- Functions that read sensitive data: **HIGH**
- Trigger functions: **CRITICAL** (auto-execute)

**Recommendation:**
Add `SET search_path = public, pg_catalog` to ALL functions:

```sql
-- Example fix for update_camp_enrolled_count
CREATE OR REPLACE FUNCTION update_camp_enrolled_count()
RETURNS TRIGGER
SET search_path = public, pg_catalog  -- FIX: Lock search path
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'completed') THEN
    UPDATE camps
    SET enrolled_count = enrolled_count + 1
    WHERE id = NEW.camp_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('confirmed', 'completed') AND NEW.status IN ('confirmed', 'completed') THEN
      UPDATE camps
      SET enrolled_count = enrolled_count + 1
      WHERE id = NEW.camp_id;
    ELSIF OLD.status IN ('confirmed', 'completed') AND NEW.status NOT IN ('confirmed', 'completed') THEN
      UPDATE camps
      SET enrolled_count = enrolled_count - 1
      WHERE id = NEW.camp_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'completed') THEN
    UPDATE camps
    SET enrolled_count = enrolled_count - 1
    WHERE id = OLD.camp_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

Apply this pattern to ALL 11 functions.

---

## Medium Priority Warnings

### 4. Leaked Password Protection Disabled

**Severity:** 🟡 **MEDIUM WARNING**
**Status:** ⚠️ **NEEDS CONFIGURATION**

**Issue:**
Supabase Auth's integration with HaveIBeenPwned.org is disabled. This means users can set passwords that have been compromised in data breaches.

**Risk:**
- Users may unknowingly use compromised passwords
- Increased risk of account takeovers
- No protection against credential stuffing attacks

**Recommendation:**
Enable HaveIBeenPwned protection in Supabase Dashboard:

1. Go to **Authentication** → **Policies** → **Password Validation**
2. Enable **"Check for compromised passwords"**
3. Configure threshold (e.g., block passwords seen >1000 times)

**Alternative (if manual control needed):**
```sql
-- Create function to validate passwords (requires external API integration)
CREATE OR REPLACE FUNCTION check_password_pwned(password text)
RETURNS boolean AS $$
DECLARE
  -- This would need to call HaveIBeenPwned API
  -- Placeholder for now
BEGIN
  -- Implementation would hash password and check API
  RETURN false;  -- Assume not pwned for now
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Low Priority Issues

### 5. RLS Enabled, No Policies: `public.attendance`

**Severity:** 🔵 **INFO**
**Status:** ⚠️ **NEEDS POLICIES**

**Issue:**
Table `public.attendance` has RLS enabled but NO policies defined. This means:
- ✅ Good: Table is secured (default deny)
- ⚠️ Problem: Nobody can access the data (not even admins)

**Current State:**
```sql
-- From 20251004102747_create_initial_schema.sql:718
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- No policies follow this line
```

**Risk:**
- Low security risk (table is locked down)
- High operational risk (feature won't work)
- Attendance tracking will fail silently

**Recommendation:**
Add appropriate RLS policies:

```sql
-- Super admins can do everything
CREATE POLICY "Super admins full access to attendance"
ON attendance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- School admins can manage attendance for their schools
CREATE POLICY "School admins can manage their school attendance"
ON attendance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations')
  )
);

-- Parents can view attendance for their children
CREATE POLICY "Parents can view their children attendance"
ON attendance FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM children ch
    JOIN parents par ON par.id = ch.parent_id
    WHERE ch.id = attendance.child_id
    AND par.profile_id = auth.uid()
  )
);

-- Staff can check in/out children at their camps
CREATE POLICY "Staff can manage attendance at their camps"
ON attendance FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations', 'staff')
  )
);
```

---

## Additional Security Findings

### 6. SECURITY DEFINER Functions (Intentional)

**Status:** ✅ **ACCEPTABLE (WITH CAUTION)**

The following functions correctly use SECURITY DEFINER to bypass RLS recursion issues:
- `is_super_admin()` - Helper to check admin status
- `is_school_admin()` - Helper to check school admin status
- `get_user_role()` - Helper to get user role
- `has_permission()` - Permission check function

**Why This is OK:**
These are small helper functions that:
1. Only read data (no writes)
2. Have limited scope (single purpose)
3. Are necessary to prevent RLS infinite recursion
4. Are properly documented in migrations

**Recommendation:**
✅ Keep these as-is, but:
- Ensure they're as minimal as possible
- Add comments explaining why SECURITY DEFINER is needed
- Regularly audit their usage

---

## Recommended Action Plan

### Immediate (Within 24 hours)

1. ✅ **Fix mutable search paths** on all 11 functions
   - Add `SET search_path = public, pg_catalog` to each
   - Priority: Trigger functions first (auto-execute)

2. ✅ **Fix SECURITY DEFINER views**
   - Investigate `commission_summary` view (not in migrations)
   - Recreate `camp_availability` with `SECURITY INVOKER`

### Short Term (Within 1 week)

3. ✅ **Add attendance RLS policies**
   - Define policies for super_admin, school_admin, staff, parents
   - Test attendance tracking functionality

4. ✅ **Enable HaveIBeenPwned protection**
   - Configure in Supabase Dashboard
   - Test user registration flow

### Ongoing Monitoring

5. ✅ **Regular security audits**
   - Monthly review of SECURITY DEFINER usage
   - Quarterly review of all RLS policies
   - Monitor Supabase security advisories

6. ✅ **Code review checklist**
   - All new functions must have `SET search_path`
   - All new tables must have RLS policies before deployment
   - No SECURITY DEFINER without justification

---

## Risk Summary

| Priority | Count | Type | Action Required |
|----------|-------|------|-----------------|
| 🔴 Critical | 2 | SECURITY DEFINER views | Fix immediately |
| 🟡 High | 11 | Mutable search paths | Fix within 24h |
| 🟡 Medium | 1 | Password protection | Enable feature |
| 🔵 Info | 1 | Missing RLS policies | Add policies |
| **Total** | **15** | **Issues** | **Action Plan Above** |

---

## Compliance Notes

### GDPR / Data Protection
- ✅ RLS is enabled on all sensitive tables
- ⚠️ Attendance table needs policies for proper access control
- ✅ Parent data is properly scoped with RLS

### OWASP Top 10
- **A01:2021 – Broken Access Control**: Addressed by RLS, but views need fix
- **A02:2021 – Cryptographic Failures**: Addressed by Supabase, enable HaveIBeenPwned
- **A03:2021 – Injection**: Search path mutable = SQL injection risk

---

## Conclusion

The database has a **strong foundation** with RLS enabled on all tables, but needs immediate attention to:
1. Fix SECURITY DEFINER views
2. Lock down function search paths
3. Add attendance policies

**Overall Security Grade:** B- (Good foundation, needs immediate fixes)

**After Fixes:** A (Excellent security posture)

---

**Next Steps:** See `SECURITY_FIXES.sql` migration file for automated fixes.
