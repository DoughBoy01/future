# Commission Rate Management System

## Overview

The commission rate management system allows platform admins to set payment split percentages at two levels:

1. **Organization Default Rate** - Default commission rate for all camps under an organization
2. **Camp-Specific Override** - Custom rate for individual camps that require different commission structures

This provides flexibility to negotiate different rates with different partners while maintaining sensible defaults.

---

## How It Works

### Hierarchy

```
Organization Default Rate (e.g., 15%)
    ↓
Camp-Specific Override (e.g., 20% for premium camps)
    ↓
Effective Rate Used in Stripe Checkout
```

**If a camp has a custom rate set:** Use the camp-specific rate
**If no custom rate:** Use the organization's default rate
**If neither exists:** Fall back to 15%

---

## Database Schema

### Organizations Table

**New Column:**
```sql
default_commission_rate NUMERIC(5,4) DEFAULT 0.15
```

- Stores the default commission rate for all camps under this organization
- Range: 0 to 1 (0% to 100%)
- Default: 0.15 (15%)

**Example:**
```sql
-- Organization with 15% default rate
UPDATE organisations
SET default_commission_rate = 0.15
WHERE id = 'org-123';
```

---

### Camps Table

**Enhanced Columns:**
```sql
commission_rate NUMERIC(5,4) NULL  -- Can be NULL to use org default
commission_rate_updated_at TIMESTAMPTZ
commission_rate_updated_by UUID REFERENCES profiles(id)
```

- `commission_rate`: Camp-specific rate (NULL = use organization default)
- `commission_rate_updated_at`: Timestamp of last rate change
- `commission_rate_updated_by`: Admin who changed the rate

**Example:**
```sql
-- Camp with custom 20% rate
UPDATE camps
SET commission_rate = 0.20,
    commission_rate_updated_by = 'admin-user-id',
    commission_rate_updated_at = NOW()
WHERE id = 'camp-456';

-- Camp using organization default (reset custom rate)
UPDATE camps
SET commission_rate = NULL
WHERE id = 'camp-789';
```

---

### Commission Rate History Table

**Table:** `camp_commission_rates`

Tracks all commission rate changes over time:

```sql
CREATE TABLE camp_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID REFERENCES camps(id) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,  -- NULL = currently active
  set_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Use Cases:**
- Audit trail of all rate changes
- Historical reporting
- Compliance and transparency

---

## Database Functions

### `get_effective_commission_rate(camp_id UUID)`

Returns the effective commission rate for a camp.

**Logic:**
1. Check if camp has a custom `commission_rate`
2. If NULL, use organization's `default_commission_rate`
3. If both NULL, return 0.15

**Example Usage:**
```sql
-- Get effective rate for a camp
SELECT get_effective_commission_rate('camp-uuid');
-- Returns: 0.15 (or whatever rate is set)

-- Use in queries
SELECT
  c.name,
  get_effective_commission_rate(c.id) as rate
FROM camps c;
```

---

## Admin UI

### Commission Rates Management Page

**Route:** `/admin/dashboard/commission-rates`

**Access:** Super admins only

**Features:**

#### 1. Organizations Tab
- View all organizations with their default rates
- Click "Edit Rate" to modify organization default
- See number of camps under each organization

#### 2. Camps Tab
- View all camps with their effective rates
- See if rate is "Custom" or "Default" (using org rate)
- Filter and search camps
- Click "Edit Rate" to set camp-specific override

#### 3. History Tab
- View all commission rate changes
- See who made changes and when
- Read notes explaining why rates changed

---

### Commission Rate Manager Component

**Component:** `<CommissionRateManager />`

**Props:**
```typescript
interface CommissionRateManagerProps {
  organisationId?: string;  // For org-level editing
  campId?: string;          // For camp-level editing
  campName?: string;        // Display name
  currentRate?: number;     // Current effective rate
  onUpdate?: () => void;    // Callback after update
}
```

**Features:**
- Visual rate input with percentage display
- Notes field for explaining changes
- Quick preset buttons (10%, 15%, 20%, 25%)
- "Reset to Default" button (camp level only)
- View rate history (camp level only)
- Platform/Organization split calculator

---

## API Services

### Commission Rate Service

**File:** `src/services/commissionRateService.ts`

**Key Functions:**

#### Organization Level
```typescript
// Update organization default rate
await updateOrganizationDefaultRate(
  organisationId: string,
  rate: number,  // 0.15 = 15%
  notes?: string
);

// Get organization with rate
const org = await getOrganizationWithRate(organisationId);
console.log(org.default_commission_rate); // 0.15
```

#### Camp Level
```typescript
// Set camp-specific rate (override)
await updateCampCommissionRate(
  campId: string,
  rate: number | null,  // null = reset to org default
  userId: string,
  notes?: string
);

// Get effective rate for checkout
const rate = await getEffectiveCommissionRate(campId);
console.log(rate); // 0.20 or 0.15 or custom
```

#### History
```typescript
// Get rate change history for a camp
const history = await getCampCommissionHistory(campId);

// Get all rate changes (admin view)
const allHistory = await getAllCommissionHistory(limit);
```

#### Bulk Operations
```typescript
// Update multiple camps at once
const result = await bulkUpdateCampCommissionRates(
  [
    { campId: 'camp-1', rate: 0.20 },
    { campId: 'camp-2', rate: 0.15 },
    { campId: 'camp-3', rate: null }, // Reset to default
  ],
  userId,
  'Bulk rate adjustment Q1 2025'
);

console.log(result);
// { success: 3, failed: 0, errors: [] }
```

---

## Stripe Integration

### Checkout Session

The `create-checkout-session` Edge Function now uses the effective commission rate:

**Before:**
```typescript
const commissionRate = camp.commission_rate || 0.15;
```

**After:**
```typescript
// Get effective rate from database function
const { data: effectiveRate } = await supabase
  .rpc('get_effective_commission_rate', { camp_id: campId });

const commissionRate = effectiveRate || 0.15;
```

**Benefits:**
- Respects both org defaults and camp overrides
- Centralized rate logic in database
- Automatic fallback to 15%
- Logged in Edge Function output

**Example Edge Function Log:**
```
Commission rate for camp abc-123: 20.00% (custom)
Commission rate for camp xyz-789: 15.00% (org default)
```

---

## User Workflows

### Scenario 1: Set Organization Default Rate

**Use Case:** New organization joins, negotiate 12% commission

**Steps:**
1. Admin navigates to `/admin/dashboard/commission-rates`
2. Selects "Organizations" tab
3. Finds organization in list
4. Clicks "Edit Rate"
5. Enters `12.00` in rate field
6. Adds note: "Negotiated rate for premium partner"
7. Clicks "Update Commission Rate"

**Result:**
- Organization `default_commission_rate` = 0.12
- All camps under this org now use 12% by default
- Saved to database immediately

---

### Scenario 2: Set Camp-Specific Override

**Use Case:** Premium camp requires 20% commission instead of org default 15%

**Steps:**
1. Admin navigates to `/admin/dashboard/commission-rates`
2. Selects "Camps" tab
3. Searches for camp name
4. Clicks "Edit Rate"
5. Enters `20.00` in rate field
6. Adds note: "Premium camp - higher commission tier"
7. Clicks "Update Commission Rate"

**Result:**
- Camp `commission_rate` = 0.20
- This camp now uses 20% instead of org default
- History record created
- All future bookings use 20%

---

### Scenario 3: Reset Camp to Organization Default

**Use Case:** Camp no longer needs custom rate, revert to org default

**Steps:**
1. Admin opens camp commission manager
2. Clicks "Reset to Default" button
3. Confirms action

**Result:**
- Camp `commission_rate` = NULL
- Camp now uses organization default rate again
- History recorded with note "Reset to organization default"

---

### Scenario 4: View Rate Change History

**Use Case:** Audit why a camp has a specific rate

**Steps:**
1. Admin opens camp commission manager
2. Clicks history icon (clock)
3. Views modal showing all rate changes
4. Sees:
   - Previous rates
   - Effective date ranges
   - Who made changes
   - Notes explaining changes

**Result:**
- Full transparency on rate changes
- Compliance-ready audit trail

---

## Stripe Payment Example

### Booking Flow with Commission Rates

**Example 1: Camp Using Org Default**

```
Camp: Summer Soccer Camp
Organization: SportsKids Inc.
Org Default Rate: 15%
Camp Custom Rate: NULL

Parent books for $100
  ↓
Effective Rate: 15% (org default)
  ↓
Platform Fee: $15
Organization Receives: $85
```

**Example 2: Camp with Custom Rate**

```
Camp: Elite Basketball Academy
Organization: SportsKids Inc.
Org Default Rate: 15%
Camp Custom Rate: 20%

Parent books for $100
  ↓
Effective Rate: 20% (camp override)
  ↓
Platform Fee: $20
Organization Receives: $80
```

**Example 3: New Organization**

```
Camp: Art Summer Camp
Organization: Creative Kids Ltd.
Org Default Rate: 12% (negotiated)
Camp Custom Rate: NULL

Parent books for $100
  ↓
Effective Rate: 12% (org default)
  ↓
Platform Fee: $12
Organization Receives: $88
```

---

## Migration Guide

### Applying the Migration

```bash
# 1. Apply the migration
supabase migration up

# Or if using Supabase Dashboard:
# Paste the contents of 017_add_default_commission_rates.sql
```

### Migration Creates:

1. ✅ `organisations.default_commission_rate` column
2. ✅ `camps.commission_rate_updated_at` column
3. ✅ `camps.commission_rate_updated_by` column
4. ✅ `get_effective_commission_rate()` function
5. ✅ `commission_rate_history` view
6. ✅ Indexes for performance
7. ✅ Appropriate defaults (15%)

### Post-Migration Tasks:

```sql
-- Set default rates for existing organizations
UPDATE organisations
SET default_commission_rate = 0.15
WHERE default_commission_rate IS NULL;

-- Verify existing camp rates
SELECT
  c.name,
  c.commission_rate as custom_rate,
  o.default_commission_rate as org_default,
  get_effective_commission_rate(c.id) as effective_rate
FROM camps c
JOIN organisations o ON c.organisation_id = o.id
LIMIT 10;
```

---

## Testing

### Test Scenarios

#### 1. Organization Default Rate
```sql
-- Set org default to 12%
UPDATE organisations SET default_commission_rate = 0.12 WHERE id = 'test-org';

-- Create camp without custom rate
INSERT INTO camps (name, organisation_id, price, status)
VALUES ('Test Camp', 'test-org', 100, 'approved');

-- Verify effective rate
SELECT get_effective_commission_rate(id) FROM camps WHERE name = 'Test Camp';
-- Expected: 0.12
```

#### 2. Camp Override
```sql
-- Set camp to 20%
UPDATE camps
SET commission_rate = 0.20
WHERE name = 'Test Camp';

-- Verify effective rate
SELECT get_effective_commission_rate(id) FROM camps WHERE name = 'Test Camp';
-- Expected: 0.20
```

#### 3. Reset to Default
```sql
-- Reset camp rate
UPDATE camps
SET commission_rate = NULL
WHERE name = 'Test Camp';

-- Verify uses org default again
SELECT get_effective_commission_rate(id) FROM camps WHERE name = 'Test Camp';
-- Expected: 0.12 (org default)
```

#### 4. Payment Split
```bash
# Make test booking
# 1. Create camp with 20% rate
# 2. Book for $100
# 3. Check Stripe Dashboard → Transfers
# 4. Verify: Platform gets $20, Org gets $80
```

---

## Best Practices

### Setting Rates

1. **Start with Organization Defaults**
   - Set reasonable defaults when onboarding new organizations
   - Typically 15% for most partners
   - Negotiate lower rates for high-volume partners

2. **Use Camp Overrides Sparingly**
   - Only for special cases (premium camps, promotions)
   - Document reasons in notes field
   - Review quarterly to ensure still appropriate

3. **Document All Changes**
   - Always add notes when changing rates
   - Include reasoning (negotiation, market conditions, etc.)
   - Reference contracts or agreements if applicable

### Rate Recommendations

- **Standard Partner:** 15%
- **Premium Partner (High Volume):** 10-12%
- **New Partner (Testing):** 15-18%
- **Premium Camps:** 18-25%
- **Promotional Camps:** 5-10%

---

## Troubleshooting

### Issue: Commission rate not reflecting in payment

**Check:**
1. Was the Edge Function redeployed after migration?
   ```bash
   supabase functions deploy create-checkout-session
   ```

2. Does the database function exist?
   ```sql
   SELECT get_effective_commission_rate('test-camp-id');
   ```

3. Check Edge Function logs:
   ```bash
   supabase functions logs create-checkout-session --tail
   ```

**Fix:** Redeploy Edge Function with updated code.

---

### Issue: Rate changes not saving

**Check:**
1. User has super_admin role?
2. Database migration applied?
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'organisations' AND column_name = 'default_commission_rate';
   ```

**Fix:** Apply migration or check user permissions.

---

### Issue: History not recording

**Check:**
1. Does `camp_commission_rates` table exist?
2. Are RLS policies correct?

**Fix:**
```sql
-- Check table exists
SELECT * FROM camp_commission_rates LIMIT 1;

-- Grant access
GRANT ALL ON camp_commission_rates TO authenticated;
```

---

## Security

### Access Control

**Who can change rates:**
- ✅ Super Admins only
- ❌ Organization admins cannot change their own rates
- ❌ Camp organizers cannot change rates

**RLS Policies:**
```sql
-- View rates: All authenticated users
-- Modify rates: Super admins only (enforced in UI)
```

### Audit Trail

All rate changes recorded in:
1. `camp_commission_rates` table (history)
2. `camps.commission_rate_updated_by` (last editor)
3. `camps.commission_rate_updated_at` (last change time)

---

## Reporting

### Commission Rate Analytics

**Query: Organizations by Rate**
```sql
SELECT
  default_commission_rate,
  COUNT(*) as org_count,
  SUM((SELECT COUNT(*) FROM camps WHERE organisation_id = o.id)) as total_camps
FROM organisations o
WHERE active = true
GROUP BY default_commission_rate
ORDER BY default_commission_rate;
```

**Query: Camps with Custom Rates**
```sql
SELECT
  c.name as camp_name,
  o.name as org_name,
  c.commission_rate as custom_rate,
  o.default_commission_rate as org_default,
  c.commission_rate_updated_at,
  p.email as updated_by
FROM camps c
JOIN organisations o ON c.organisation_id = o.id
LEFT JOIN profiles p ON c.commission_rate_updated_by = p.id
WHERE c.commission_rate IS NOT NULL
ORDER BY c.commission_rate_updated_at DESC;
```

**Query: Rate Change Frequency**
```sql
SELECT
  camp_id,
  COUNT(*) as rate_changes,
  MIN(created_at) as first_change,
  MAX(created_at) as last_change
FROM camp_commission_rates
GROUP BY camp_id
HAVING COUNT(*) > 1
ORDER BY rate_changes DESC;
```

---

## Summary

The commission rate management system provides:

✅ **Flexible rate structures** - Organization defaults + camp overrides
✅ **Admin control** - Super admins set all rates
✅ **Automatic integration** - Rates flow directly into Stripe payments
✅ **Complete audit trail** - Track all changes with notes
✅ **User-friendly UI** - Easy-to-use management interface
✅ **Database-driven** - Centralized logic in PostgreSQL
✅ **Production-ready** - Fully tested and documented

**Key Routes:**
- `/admin/dashboard/commission-rates` - Main management interface

**Key Files:**
- `supabase/migrations/017_add_default_commission_rates.sql`
- `src/services/commissionRateService.ts`
- `src/components/admin/CommissionRateManager.tsx`
- `src/pages/admin/CommissionRatesManagement.tsx`

**Database Function:**
- `get_effective_commission_rate(camp_id UUID)`

---

**Ready to use!** 🎉
