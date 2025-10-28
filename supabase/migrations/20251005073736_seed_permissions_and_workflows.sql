/*
  # Seed Permissions, Roles, and Workflows

  ## Overview
  Populates the RBAC system with standardized permission groups, permissions, role assignments,
  and default approval workflows. This creates a comprehensive permission structure for CRM and CMS operations.

  ## Seeded Data

  ### Permission Groups
  - School Management
  - User Management
  - Camp Content Management
  - Registration Management
  - Financial Operations
  - Communication Management
  - Attendance Operations
  - Incident Management
  - Feedback & Reviews
  - Analytics & Reporting
  - System Administration

  ### Permissions
  Comprehensive permissions for all resources and actions across the platform

  ### Role Permission Assignments
  Maps permissions to standardized roles ensuring appropriate access levels

  ### Approval Workflows
  Default workflows for:
  - Camp publication
  - High-value registrations
  - Mass communications
  - Critical incidents
  - Refund requests
*/

-- =============================================
-- INSERT PERMISSION GROUPS
-- =============================================
INSERT INTO permission_groups (name, description, display_order) VALUES
  ('School Management', 'Permissions related to school configuration and settings', 1),
  ('User Management', 'Permissions for managing users, roles, and access', 2),
  ('Camp Content Management', 'Permissions for creating and managing camp content', 3),
  ('Registration Management', 'Permissions for handling registrations and enrollments', 4),
  ('Financial Operations', 'Permissions for payment processing and financial data', 5),
  ('Communication Management', 'Permissions for sending messages and announcements', 6),
  ('Attendance Operations', 'Permissions for tracking and managing attendance', 7),
  ('Incident Management', 'Permissions for reporting and handling incidents', 8),
  ('Feedback & Reviews', 'Permissions for managing feedback and testimonials', 9),
  ('Analytics & Reporting', 'Permissions for viewing reports and analytics', 10),
  ('System Administration', 'Platform-wide administrative permissions', 11)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- INSERT PERMISSIONS
-- =============================================

-- School Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'schools.view',
  'View Schools',
  'View school information and settings',
  'schools',
  'read',
  'platform'
FROM permission_groups pg WHERE pg.name = 'School Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'schools.edit',
  'Edit Schools',
  'Modify school information and settings',
  'schools',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'School Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'schools.create',
  'Create Schools',
  'Create new schools in the platform',
  'schools',
  'create',
  'platform'
FROM permission_groups pg WHERE pg.name = 'School Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'schools.deactivate',
  'Deactivate Schools',
  'Deactivate or archive schools',
  'schools',
  'delete',
  'platform'
FROM permission_groups pg WHERE pg.name = 'School Management'
ON CONFLICT (name) DO NOTHING;

-- User Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'users.view',
  'View Users',
  'View user profiles and information',
  'profiles',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'User Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'users.invite',
  'Invite Users',
  'Invite new users to the platform',
  'profiles',
  'create',
  'school'
FROM permission_groups pg WHERE pg.name = 'User Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'users.edit',
  'Edit Users',
  'Modify user profiles and information',
  'profiles',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'User Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'users.assign_roles',
  'Assign User Roles',
  'Change user roles and permissions',
  'profiles',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'User Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'users.deactivate',
  'Deactivate Users',
  'Deactivate or suspend user accounts',
  'profiles',
  'delete',
  'school'
FROM permission_groups pg WHERE pg.name = 'User Management'
ON CONFLICT (name) DO NOTHING;

-- Camp Content Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'camps.view_all',
  'View All Camps',
  'View all camps including drafts',
  'camps',
  'read',
  'school',
  false
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'camps.create',
  'Create Camps',
  'Create new camp content',
  'camps',
  'create',
  'school'
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'camps.edit',
  'Edit Camps',
  'Modify existing camp content',
  'camps',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'camps.publish',
  'Publish Camps',
  'Publish camps to make them publicly visible',
  'camps',
  'publish',
  'school',
  true
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'camps.approve',
  'Approve Camp Publication',
  'Approve camp publication requests',
  'camps',
  'approve',
  'school',
  false
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'camps.unpublish',
  'Unpublish Camps',
  'Remove camps from public visibility',
  'camps',
  'unpublish',
  'school'
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'camps.delete',
  'Delete Camps',
  'Permanently delete camp content',
  'camps',
  'delete',
  'school'
FROM permission_groups pg WHERE pg.name = 'Camp Content Management'
ON CONFLICT (name) DO NOTHING;

-- Registration Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'registrations.view',
  'View Registrations',
  'View registration information',
  'registrations',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Registration Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'registrations.create',
  'Create Registrations',
  'Create new registrations for children',
  'registrations',
  'create',
  'individual'
FROM permission_groups pg WHERE pg.name = 'Registration Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'registrations.edit',
  'Edit Registrations',
  'Modify registration details',
  'registrations',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Registration Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'registrations.approve',
  'Approve Registrations',
  'Approve special registration requests',
  'registrations',
  'approve',
  'school',
  false
FROM permission_groups pg WHERE pg.name = 'Registration Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'registrations.cancel',
  'Cancel Registrations',
  'Cancel existing registrations',
  'registrations',
  'delete',
  'school'
FROM permission_groups pg WHERE pg.name = 'Registration Management'
ON CONFLICT (name) DO NOTHING;

-- Financial Operations Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'payments.view',
  'View Payments',
  'View payment information and history',
  'registrations',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Financial Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'payments.process',
  'Process Payments',
  'Process and record payments',
  'registrations',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Financial Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'payments.refund',
  'Process Refunds',
  'Issue refunds to parents',
  'registrations',
  'refund',
  'school',
  true
FROM permission_groups pg WHERE pg.name = 'Financial Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'discount_codes.view',
  'View Discount Codes',
  'View discount codes and usage',
  'discount_codes',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Financial Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'discount_codes.create',
  'Create Discount Codes',
  'Create new discount codes',
  'discount_codes',
  'create',
  'school'
FROM permission_groups pg WHERE pg.name = 'Financial Operations'
ON CONFLICT (name) DO NOTHING;

-- Communication Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'communications.view',
  'View Communications',
  'View communication history',
  'communications',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Communication Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'communications.create',
  'Create Communications',
  'Draft new messages and announcements',
  'communications',
  'create',
  'school'
FROM permission_groups pg WHERE pg.name = 'Communication Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'communications.send',
  'Send Communications',
  'Send messages to parents',
  'communications',
  'send',
  'school',
  true
FROM permission_groups pg WHERE pg.name = 'Communication Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'communications.approve',
  'Approve Communications',
  'Approve communication sending requests',
  'communications',
  'approve',
  'school'
FROM permission_groups pg WHERE pg.name = 'Communication Management'
ON CONFLICT (name) DO NOTHING;

-- Attendance Operations Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'attendance.view',
  'View Attendance',
  'View attendance records',
  'attendance',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Attendance Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'attendance.mark',
  'Mark Attendance',
  'Check children in and out',
  'attendance',
  'create',
  'camp'
FROM permission_groups pg WHERE pg.name = 'Attendance Operations'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'attendance.edit',
  'Edit Attendance',
  'Modify attendance records',
  'attendance',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Attendance Operations'
ON CONFLICT (name) DO NOTHING;

-- Incident Management Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'incidents.view',
  'View Incidents',
  'View incident reports',
  'incidents',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Incident Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'incidents.report',
  'Report Incidents',
  'Create new incident reports',
  'incidents',
  'create',
  'camp'
FROM permission_groups pg WHERE pg.name = 'Incident Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'incidents.edit',
  'Edit Incidents',
  'Modify incident reports',
  'incidents',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Incident Management'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level, requires_approval) 
SELECT 
  pg.id,
  'incidents.approve',
  'Approve Critical Incidents',
  'Review and approve critical incident reports',
  'incidents',
  'approve',
  'school',
  false
FROM permission_groups pg WHERE pg.name = 'Incident Management'
ON CONFLICT (name) DO NOTHING;

-- Feedback & Reviews Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'feedback.view',
  'View Feedback',
  'View parent feedback and reviews',
  'feedback',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Feedback & Reviews'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'feedback.respond',
  'Respond to Feedback',
  'Reply to parent feedback',
  'feedback',
  'update',
  'school'
FROM permission_groups pg WHERE pg.name = 'Feedback & Reviews'
ON CONFLICT (name) DO NOTHING;

-- Analytics & Reporting Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'analytics.view',
  'View Analytics',
  'View reports and analytics dashboards',
  'analytics',
  'read',
  'school'
FROM permission_groups pg WHERE pg.name = 'Analytics & Reporting'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'analytics.export',
  'Export Data',
  'Export data and reports',
  'analytics',
  'export',
  'school'
FROM permission_groups pg WHERE pg.name = 'Analytics & Reporting'
ON CONFLICT (name) DO NOTHING;

-- System Administration Permissions
INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'system.manage_permissions',
  'Manage Permissions',
  'Configure roles and permissions',
  'permissions',
  'update',
  'platform'
FROM permission_groups pg WHERE pg.name = 'System Administration'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'system.view_audit_logs',
  'View Audit Logs',
  'View system audit logs',
  'audit_logs',
  'read',
  'platform'
FROM permission_groups pg WHERE pg.name = 'System Administration'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (group_id, name, display_name, description, resource_type, action, scope_level) 
SELECT 
  pg.id,
  'system.manage_workflows',
  'Manage Workflows',
  'Configure approval workflows',
  'approval_workflows',
  'update',
  'platform'
FROM permission_groups pg WHERE pg.name = 'System Administration'
ON CONFLICT (name) DO NOTHING;