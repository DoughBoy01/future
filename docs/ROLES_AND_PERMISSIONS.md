# Roles and Permissions

FutureEdge uses two complementary access control systems:

1. **Role-Based Access Control (RBAC)** — Coarse-grained access via the `role` field on `profiles`
2. **Fine-Grained Permissions** — Permission-level control stored in `permissions` and `role_permissions` tables
3. **Row Level Security (RLS)** — Database-layer enforcement that cannot be bypassed client-side

---

## User Roles

Roles are stored in `profiles.role`. Each role determines which routes and features a user can access.

### `parent`

The default role for all new user registrations.

**Access:**
- All public pages (camp catalog, camp details, marketing pages)
- Own dashboard (`/dashboard`)
- Register children for camps
- View own registrations and bookings
- Submit post-camp feedback
- Manage own profile and children

**Cannot:**
- Access admin dashboard
- Access organizer dashboard
- View other users' data

---

### `camp_organizer`

Assigned to users who run activity camps. Assigned manually by admins or via invite.

**Access:**
- All public pages
- Organizer onboarding flow (`/onboarding/*`)
- Organizer dashboard (`/organizer-dashboard`)
- Create, edit, publish own organization's camps
- View bookings and registrations for own camps
- Manage organization profile and Stripe Connect settings
- View own financial data (commissions, payouts)

**Cannot:**
- Access admin dashboard
- View other organizations' data
- Modify system settings

---

### `school_admin`

Administrative staff with broad platform management access.

**Access:**
- Admin dashboard (`/admin/dashboard`)
- Camps Management — view and approve all camps
- Enquiries, Customers, Registrations, Bookings management
- Communications Center
- Analytics Dashboard
- Commissions, Payouts, Payment Analytics
- Approval Dashboard
- Data Management (import/export)
- Role Management

**Cannot:**
- Access Organizations Management (super_admin only)
- Access Commission Rates Management (super_admin only)
- Access System Settings (super_admin only)
- Access Camp Organizer Management (super_admin only)
- Access User Role Management (super_admin only)

---

### `marketing`

Marketing team with analytics and communications access.

**Access:**
- Admin dashboard overview
- Camps Management (view)
- Enquiries Management
- Communications Center
- Analytics Dashboard
- Approval Dashboard

**Cannot:**
- Access Customers, Registrations, Bookings (operations territory)
- Access financial data (commissions, payouts)
- Access system configuration

---

### `operations`

Operations team managing day-to-day platform activity.

**Access:**
- Admin dashboard overview
- Camps Management
- Customers, Registrations, Bookings management
- Analytics Dashboard
- Commissions, Payouts, Payment Analytics
- Approval Dashboard
- Data Management

**Cannot:**
- Access Communications Center (marketing territory)
- Access system configuration

---

### `risk`

Risk management team focused on compliance and safety.

**Access:**
- Admin dashboard overview
- Approval Dashboard
- Feedback Management
- Incidents (via data access)

**Cannot:**
- Access most operational and financial features

---

### `super_admin`

Platform administrators with unrestricted access.

**Access:** Everything, including:
- All admin routes
- Organizations Management
- Commission Rates Management (set system default and per-org rates)
- System Settings
- Camp Organizer Management (invite organizers)
- User Role Management (change any user's role)
- System Diagnostics

---

## Route-to-Role Mapping

| Route | Required Roles |
|---|---|
| `/admin/dashboard` | `super_admin`, `school_admin`, `marketing`, `operations`, `risk` |
| `/admin/dashboard/camps` | `super_admin`, `school_admin`, `marketing`, `operations` |
| `/admin/dashboard/enquiries` | `super_admin`, `school_admin`, `marketing`, `operations` |
| `/admin/dashboard/customers` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/registrations` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/bookings` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/communications` | `super_admin`, `school_admin`, `marketing` |
| `/admin/dashboard/analytics` | `super_admin`, `school_admin`, `marketing`, `operations` |
| `/admin/dashboard/commissions` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/commission-rates` | `super_admin` |
| `/admin/dashboard/payouts` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/payment-analytics` | `super_admin`, `school_admin`, `operations` |
| `/admin/dashboard/organisations` | `super_admin` |
| `/admin/approvals` | `super_admin`, `school_admin`, `marketing`, `operations`, `risk` |
| `/admin/camp-organizers` | `super_admin` |
| `/admin/user-roles` | `super_admin` |
| `/admin/roles` | `super_admin`, `school_admin` |
| `/admin/data-management` | `super_admin`, `school_admin`, `operations` |
| `/admin/settings` | `super_admin` |
| `/admin/diagnostics` | `super_admin` |
| `/organizer-dashboard` | `camp_organizer` |
| `/onboarding/*` | `camp_organizer` |
| `/organizer/*` | `camp_organizer` |
| `/dashboard` | Any authenticated user |

---

## Fine-Grained Permissions

Beyond role-based routing, a permission system allows more granular control within the admin area. Permissions are stored in the database and cached client-side with a 5-minute TTL.

### Permission Structure

**`permissions` table:** Defines available permissions:

```
camps.view          - View camp listings
camps.create        - Create new camps
camps.edit          - Edit existing camps
camps.delete        - Delete camps
camps.approve       - Approve pending camps
camps.publish       - Publish/unpublish camps

registrations.view  - View registrations
registrations.edit  - Edit registration status
registrations.refund - Process refunds

commissions.view    - View commission records
commissions.edit    - Edit commission rates

users.view          - View user profiles
users.edit          - Edit user roles
users.invite        - Invite new users

analytics.view      - View analytics data

settings.view       - View system settings
settings.edit       - Edit system settings
```

**`role_permissions` table:** Maps permissions to roles. Each role is seeded with a default set of permissions matching the access described above.

### Checking Permissions in Code

The `usePermissions()` hook provides client-side permission checking:

```typescript
const { hasPermission, loading } = usePermissions();

if (hasPermission('camps.approve')) {
  // Show approve button
}
```

The `permissionService` calls the `has_permission(user_id, permission_name)` RPC function which checks the database.

The `PermissionGate` component renders children conditionally:

```tsx
<PermissionGate permission="camps.approve">
  <ApproveButton />
</PermissionGate>
```

---

## Row Level Security (RLS)

RLS is the final enforcement layer. Even if client-side code is bypassed, the database rejects unauthorized queries.

### Key RLS Principles

1. **Default deny:** RLS blocks all access until an explicit policy allows it
2. **`auth.uid()`:** All policies use `auth.uid()` to identify the current user — never `current_user`
3. **Ownership checks:** Most policies verify the user owns or is affiliated with the target record
4. **Role checks:** Admin policies join `profiles` to verify role before granting access

### RLS Pattern Examples

**Parent owns data:**
```sql
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
```

**Admin access by role:**
```sql
CREATE POLICY "Admins can view all camps"
  ON camps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  );
```

**Organizer owns organization's data:**
```sql
CREATE POLICY "Organizers can manage own camps"
  ON camps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organisation_id = camps.organisation_id
      AND profiles.role = 'camp_organizer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organisation_id = camps.organisation_id
      AND profiles.role = 'camp_organizer'
    )
  );
```

### Helper Function: `is_super_admin()`

A database function that checks if the current user is a super admin, used in some policies to avoid recursive joins:

```sql
CREATE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Assigning Roles

### New Registrations

All self-registered users get `role = 'parent'` by default (set in `AuthContext.signUp()`).

### Promoting to `camp_organizer`

Admins promote users via:
1. `/admin/user-roles` page in the admin dashboard
2. Or via the `send-camp-organizer-invite` Edge Function which sends an email invite. When the invitee registers, they are assigned the `camp_organizer` role automatically.

### Promoting to Admin Roles

Only `super_admin` users can change roles to `school_admin`, `marketing`, `operations`, `risk`, or `super_admin` via the `/admin/user-roles` page.

---

## Multi-Role Considerations

The `UserViewContext` handles the case where a user may need to see the platform from different perspectives. A `super_admin` or user with multiple role contexts can toggle their "view mode" between the parent and organizer perspectives without changing their actual role.

This context provides:
- `currentView` — `'parent'` or `'camp_organiser'`
- `canSwitchView` — Whether switching is available
- `setView(view)` — Switch the active view
