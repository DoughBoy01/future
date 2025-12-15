# Role Management System Implementation

## Overview
A comprehensive role management system has been implemented that allows Super Admins to assign and manage user roles across the platform.

## System Roles

The platform now has **5 distinct roles** with a hierarchical structure:

### 1. Super Admin (Level 5)
- **Display Name:** Super Admin
- **Description:** Full system access with all privileges. Can manage all users, camps, organizations, and system settings.
- **Key Permissions:**
  - Manage users and assign roles
  - Manage all camps and organizations
  - View all analytics
  - Manage system settings
  - Access all admin features

### 2. Camp Organizer (Level 4)
- **Display Name:** Camp Organizer
- **Description:** Organization administrators who can create and manage their own camps, view bookings, and manage their organization settings.
- **Key Permissions:**
  - Create and edit own camps
  - View own bookings
  - Manage own organization
  - View own analytics

### 3. School Admin (Level 3)
- **Display Name:** School Admin
- **Description:** School administrators who can manage school-related content, view school analytics, and coordinate with camp organizers.
- **Key Permissions:**
  - View camps
  - Manage school content
  - View school analytics
  - Contact organizers

### 4. Parent (Level 2)
- **Display Name:** Parent
- **Description:** Parents who can browse camps, make bookings, manage their children profiles, and view their booking history.
- **Key Permissions:**
  - Browse camps
  - Make bookings
  - Manage children profiles
  - View own bookings
  - Leave reviews

### 5. User (Level 1)
- **Display Name:** User
- **Description:** Basic authenticated user with limited access. Can browse public content and view their own profile.
- **Key Permissions:**
  - View public content
  - View own profile

## Database Structure

### New Tables

#### 1. `roles` Table
Stores all system roles with their properties:
- `id` (UUID): Primary key
- `name` (text): Unique role identifier (e.g., 'super_admin')
- `display_name` (text): Human-readable name
- `description` (text): Detailed role description
- `level` (integer): Hierarchy level (1-5)
- `is_system_role` (boolean): Whether role can be deleted
- `permissions` (JSONB): Role-specific permissions
- `created_at`, `updated_at`: Timestamps

#### 2. `role_assignment_history` Table
Audit log for all role changes:
- `id` (UUID): Primary key
- `user_id` (UUID): User whose role changed
- `old_role` (text): Previous role
- `new_role` (text): New role assigned
- `assigned_by` (UUID): Admin who made the change
- `reason` (text): Justification for change
- `created_at`: Timestamp

### RPC Functions

#### `update_user_role(p_user_id, p_new_role, p_reason)`
- Securely updates a user's role with permission checks
- Automatically logs the change to `role_assignment_history`
- Only accessible by Super Admins

#### `get_all_users_with_emails()`
- Returns all users with their email addresses
- Super Admin only access
- Used by the role management UI

#### `get_users_by_role_with_emails(p_role)`
- Returns users filtered by specific role
- Includes email addresses from auth.users
- Super Admin only access

#### `can_assign_role(p_target_role)`
- Checks if current user can assign a specific role
- Returns boolean

#### `get_role_details(p_role_name)`
- Returns detailed information about a role
- Includes permissions and level

## Admin UI Features

### User Role Management Page
Location: `/admin/user-roles`

**Features:**
1. **User List View**
   - Search by name or email
   - Filter by role
   - View user details (name, email, role, join date)
   - Inline role assignment dropdown
   - Role history toggle button

2. **Role Legend**
   - Visual display of all available roles
   - Color-coded by hierarchy level
   - Shows role descriptions

3. **Role Assignment**
   - Dropdown selection per user
   - Confirmation dialog before change
   - Real-time updates
   - Success/error notifications

4. **Role History**
   - Per-user role change history
   - Shows who made the change and when
   - Displays old and new roles
   - Audit trail for compliance

5. **Summary Statistics**
   - Count of users per role
   - Quick overview cards

### Security Features

1. **RLS Policies**
   - Only Super Admins can access role management
   - Users can view their own role history
   - All role changes are logged

2. **Automatic Audit Logging**
   - Database trigger logs all role changes
   - Includes who made the change
   - Timestamps for all changes
   - Reason tracking

3. **Permission Checks**
   - RPC functions verify admin privileges
   - Role assignment validates permissions
   - Protected against unauthorized access

## Navigation

The User Role Management page is accessible from:
- **Admin Dashboard** → **Management** → **User Roles**
- Direct URL: `/admin/user-roles`
- Visible only to Super Admins

## Migration Files

1. **013_create_roles_table.sql**
   - Creates `roles` table
   - Seeds predefined roles
   - Creates `role_assignment_history` table
   - Adds role change trigger
   - Updates profile role constraints
   - Adds helper functions

2. **014_add_user_email_rpc.sql**
   - Creates `get_all_users_with_emails()` function
   - Creates `get_users_by_role_with_emails()` function
   - Security definer functions for admin access

## Usage

### For Super Admins

1. **Navigate to User Role Management**
   - Go to Admin Dashboard
   - Click "User Roles" in the Management section

2. **View Users**
   - See all users in a table view
   - Search by name or email
   - Filter by specific role

3. **Assign a Role**
   - Select new role from dropdown next to user
   - Confirm the change in dialog
   - Change is applied immediately
   - Notification confirms success

4. **View Role History**
   - Click the history icon next to a user
   - See all past role changes
   - View who made each change and when

### For Regular Users

- Users can view their own role assignment history
- Changes made by admins are visible in their profile
- No ability to modify roles

## Technical Implementation

### Frontend (React + TypeScript)
- **Component:** [UserRoleManagement.tsx](src/pages/admin/UserRoleManagement.tsx)
- **Styling:** Airbnb design system principles
- **State Management:** React hooks
- **API:** Supabase client

### Backend (PostgreSQL + RLS)
- **Database:** Supabase PostgreSQL
- **Security:** Row Level Security (RLS) policies
- **Functions:** PostgreSQL PL/pgSQL
- **Triggers:** Automatic audit logging

### Integration
- **Routes:** Added to [App.tsx](src/App.tsx)
- **Navigation:** Updated [DashboardLayout.tsx](src/components/dashboard/DashboardLayout.tsx)
- **Types:** Auto-generated from database schema

## Testing Checklist

- [ ] Super Admin can access /admin/user-roles
- [ ] Non-admins cannot access role management
- [ ] Users list loads correctly with emails
- [ ] Search functionality works
- [ ] Role filter works
- [ ] Role assignment updates database
- [ ] Role changes trigger audit log
- [ ] Role history displays correctly
- [ ] Notifications show for success/error
- [ ] Summary statistics are accurate

## Future Enhancements

1. **Bulk Role Assignment**
   - Assign roles to multiple users at once
   - Import/export role assignments

2. **Custom Roles**
   - Allow creation of custom roles
   - Per-role permission management

3. **Role Templates**
   - Predefined permission sets
   - Quick role setup

4. **Advanced Filtering**
   - Filter by organization
   - Filter by last seen date
   - Filter by multiple criteria

5. **Role Expiration**
   - Temporary role assignments
   - Automatic expiration

## Support

For issues or questions:
- Check migration logs in Supabase dashboard
- Review RLS policies for access issues
- Check browser console for frontend errors
- Verify user has super_admin role

## Deployment Notes

1. **Database Migrations**
   - Run migrations 013 and 014
   - Verify roles table is seeded
   - Test RPC functions

2. **Frontend Deployment**
   - Build and deploy updated React app
   - Clear browser cache
   - Verify navigation links appear

3. **Verification**
   - Test with super_admin account
   - Verify RLS policies work
   - Check audit logs are created
