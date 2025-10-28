# Role-Based Access Control (RBAC) System Documentation

## Overview

This comprehensive Role-Based Access Control (RBAC) system provides enterprise-grade permission management, approval workflows, and content versioning for the CRM and CMS platform. The system is standardized across all schools, ensuring consistent access control and security policies throughout the application.

## Table of Contents

1. [Core Components](#core-components)
2. [Database Schema](#database-schema)
3. [Roles and Permissions](#roles-and-permissions)
4. [Approval Workflows](#approval-workflows)
5. [Content Versioning](#content-versioning)
6. [Frontend Components](#frontend-components)
7. [Usage Examples](#usage-examples)
8. [API Reference](#api-reference)

## Core Components

### Permission System

The permission system provides granular access control based on:
- **Resource Type**: The entity being accessed (camps, registrations, etc.)
- **Action**: The operation being performed (create, read, update, delete, approve, etc.)
- **Scope Level**: The boundary of access (platform, school, camp, individual)

### Approval Workflows

Multi-step approval processes for sensitive operations:
- Camp publication
- Mass communications
- High-value registrations
- Critical incidents
- Refund requests

### Content Versioning

Complete version tracking and rollback capabilities:
- Automatic version creation on content changes
- Draft management with auto-save
- Content locking to prevent conflicts
- Scheduled publication
- Side-by-side diff comparison

## Database Schema

### Permission Tables

#### `permission_groups`
Organizes permissions into logical categories for easier management.

#### `permissions`
Defines all available permissions in the system with:
- Unique name (e.g., `camps.create`, `registrations.approve`)
- Display name and description
- Resource type and action
- Scope level
- Approval requirement flag

#### `role_permissions`
Maps permissions to roles, defining what each role can do.

#### `user_permission_overrides`
Provides user-specific exceptions that override role defaults, with:
- Optional expiration dates
- Audit trail (granted by, reason)

#### `permission_dependencies`
Defines prerequisite permissions for hierarchical access.

#### `audit_logs`
Comprehensive audit trail of all permission checks and actions.

### Approval Workflow Tables

#### `approval_workflows`
Defines reusable workflow templates by resource type.

#### `approval_workflow_steps`
Individual steps within a workflow with:
- Sequential or parallel execution
- Required role/permission
- Escalation timeout
- Rejection capability

#### `approval_requests`
Tracks individual approval request instances with status tracking.

#### `approval_actions`
Logs all approval decisions with comments and timestamps.

#### `approval_delegates`
Temporary delegation of approval authority.

#### `approval_notifications`
Notification tracking for approval events.

### Content Versioning Tables

#### `content_versions`
Complete history of all content changes with snapshots.

#### `content_drafts`
Work-in-progress content with auto-save support.

#### `content_approvals`
Links content versions to approval workflows.

#### `content_diff`
Field-by-field change tracking between versions.

#### `content_rollback_log`
Audit trail of content rollbacks.

#### `content_scheduling`
Scheduled publication and updates.

#### `content_locks`
Prevents simultaneous editing conflicts.

#### `content_comments`
Team collaboration on content versions.

## Roles and Permissions

### Role Hierarchy

#### Super Admin
- Full platform-wide access
- Permission and role management
- System configuration
- Access to all audit logs

#### School Admin
- Complete school-level administrative access
- All approval authorities
- User management within school
- Full reporting access

#### Marketing Manager
- Camp content creation and editing
- Communication management
- Discount code creation
- Approval submission rights

#### Content Editor
- Camp content creation and editing
- Draft management
- No publishing rights (requires approval)

#### Operations Manager
- Registration management
- Attendance tracking
- Incident management
- Daily operations oversight

#### Camp Counselor
- Attendance marking
- Basic incident reporting
- Child data viewing (limited)

#### Risk Manager
- Incident oversight and approval
- Compliance monitoring
- Audit log access
- Feedback analysis

#### Accountant
- Payment processing
- Refund management
- Financial reporting
- Discount code management

#### Support Agent
- Read-only access for customer support
- Parent and registration viewing
- Communication history access

#### Parent
- Self-service account management
- Child registration and management
- Payment viewing
- Attendance tracking for own children

### Permission Categories

1. **School Management**: School configuration and settings
2. **User Management**: User invitations, role assignments, deactivation
3. **Camp Content Management**: Creation, editing, publishing, archiving
4. **Registration Management**: Viewing, creating, modifying, canceling
5. **Financial Operations**: Payment processing, refunds, discount codes
6. **Communication Management**: Drafting, sending, scheduling messages
7. **Attendance Operations**: Marking, editing, reporting
8. **Incident Management**: Reporting, reviewing, approving
9. **Feedback & Reviews**: Viewing, responding, featuring
10. **Analytics & Reporting**: Dashboard access, data exports
11. **System Administration**: Permission management, audit logs, workflows

## Approval Workflows

### Default Workflows

#### Camp Publication Workflow
1. **Marketing Review**: Content accuracy and appeal check
2. **Final Approval**: School admin sign-off

#### Mass Communication Workflow
1. **Content Review**: Message and recipient verification (24hr escalation)

#### High Value Registration Workflow
1. **Operations Review**: Availability and special circumstances
2. **Admin Approval**: Final special registration approval

#### Critical Incident Workflow
1. **Risk Management Review**: Severity assessment (2hr escalation)
2. **Admin Notification**: Acknowledgment (1hr escalation)

#### Refund Request Workflow
1. **Financial Review**: Refund validation
2. **Final Approval**: School admin authorization

### Workflow States

- **pending**: Awaiting approval
- **approved**: Successfully approved
- **rejected**: Denied with reason
- **cancelled**: Withdrawn by submitter

## Content Versioning

### Version Lifecycle

1. **Draft Creation**: Work-in-progress with auto-save
2. **Version Creation**: Snapshot of changes
3. **Approval Submission**: Sent to workflow
4. **Publication**: Made live after approval
5. **Rollback**: Restore to previous version if needed

### Content Lock Mechanism

Prevents simultaneous editing conflicts:
- Automatic lock acquisition on edit
- Configurable timeout (default 30 minutes)
- Admin override capability
- Lock expiration cleanup

### Scheduled Publication

Schedule content to publish at specific times:
- Future publication dates
- Automatic execution
- Status tracking (pending, completed, failed)

## Frontend Components

### Permission Components

#### `usePermissions` Hook
Access permission state and checking functions:

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions, checkPermission } = usePermissions();
```

#### `PermissionGate` Component
Conditionally render UI based on permissions:

```tsx
<PermissionGate permission="camps.create">
  <CreateCampButton />
</PermissionGate>
```

#### `RequirePermission` Component
Protect entire routes with permission checks:

```tsx
<RequirePermission permission="camps.edit">
  <EditCampPage />
</RequirePermission>
```

#### `RoleBasedRoute` Component
Route protection based on roles:

```tsx
<RoleBasedRoute allowedRoles={['school_admin', 'super_admin']}>
  <AdminPanel />
</RoleBasedRoute>
```

### Admin Interfaces

#### Role Management (`/admin/roles`)
- View all roles and their permissions
- Permission matrix visualization
- Role comparison
- Accessible to: School Admin, Super Admin

#### Approval Dashboard (`/admin/approvals`)
- Pending approvals queue
- Submitted requests tracking
- Quick approve/reject actions
- Priority filtering
- Accessible to: All staff roles

## Usage Examples

### Checking Permissions in Components

```typescript
import { usePermissions } from '../../hooks/usePermissions';

function CampEditor() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('camps.edit') && (
        <button>Edit Camp</button>
      )}
      {hasPermission('camps.publish') && (
        <button>Publish Camp</button>
      )}
    </div>
  );
}
```

### Submitting for Approval

```typescript
import { approvalWorkflowService } from '../services/approvalWorkflowService';

async function submitCampForApproval(campId: string, userId: string) {
  const workflow = await approvalWorkflowService.getWorkflowByResourceType('camps');

  if (workflow) {
    const result = await approvalWorkflowService.submitApprovalRequest(
      workflow.id,
      'camps',
      campId,
      userId,
      'high'
    );

    if (result.success) {
      console.log('Submitted for approval');
    }
  }
}
```

### Creating Content Versions

```typescript
import { versionControlService } from '../services/versionControlService';

async function saveCampChanges(campId: string, content: any, userId: string) {
  const result = await versionControlService.createVersion(
    'camps',
    campId,
    content,
    userId,
    'Updated camp description and pricing',
    ['description', 'price']
  );

  if (result.success) {
    console.log('Version created:', result.versionId);
  }
}
```

### Granting Permission Overrides

```typescript
import { permissionService } from '../services/permissionService';

async function grantTemporaryAccess(
  userId: string,
  adminId: string
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const result = await permissionService.grantPermissionOverride(
    userId,
    'camps.publish',
    adminId,
    'Temporary publishing access for summer campaign',
    expiresAt
  );

  if (result.success) {
    console.log('Permission granted');
  }
}
```

## API Reference

### Permission Service

#### `checkPermission(userId, permissionName)`
Check if user has specific permission.

#### `getUserPermissions(userId)`
Get all permissions for a user.

#### `grantPermissionOverride(userId, permissionName, grantedBy, reason, expiresAt?)`
Grant temporary permission to user.

#### `revokePermissionOverride(userId, permissionName, revokedBy)`
Remove permission override.

### Approval Workflow Service

#### `submitApprovalRequest(workflowId, resourceType, resourceId, submittedBy, priority?, metadata?)`
Submit new approval request.

#### `approveRequest(requestId, approverId, comment?)`
Approve current step.

#### `rejectRequest(requestId, rejectorId, reason)`
Reject approval request.

#### `requestChanges(requestId, reviewerId, changes, comment?)`
Request modifications.

### Version Control Service

#### `createVersion(resourceType, resourceId, content, createdBy, changeSummary?, changedFields?)`
Create new content version.

#### `getVersionHistory(resourceType, resourceId)`
Get all versions for resource.

#### `rollbackToVersion(versionId, rolledBackBy, reason)`
Restore previous version.

#### `createDraft(resourceType, resourceId, draftContent, createdBy, basedOnVersion?)`
Create content draft.

#### `acquireLock(resourceType, resourceId, userId, durationMinutes?)`
Lock content for editing.

#### `releaseLock(lockToken)`
Release content lock.

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Audit Logging**: Every permission check is logged
3. **Permission Caching**: 5-minute cache with invalidation
4. **Lock Expiration**: Automatic cleanup of expired locks
5. **Approval Escalation**: Timeout-based escalation to prevent bottlenecks
6. **Version Integrity**: Complete snapshot preservation

## Best Practices

1. Always use `maybeSingle()` instead of `single()` for queries
2. Check permissions before performing sensitive operations
3. Provide meaningful reasons for permission overrides
4. Use appropriate approval priorities
5. Create versions before making significant changes
6. Acquire locks when editing published content
7. Include change summaries in version creation
8. Clean up drafts regularly

## Maintenance

### Regular Tasks

1. **Audit Log Cleanup**: Archive old logs periodically
2. **Permission Cache**: Monitor cache hit rates
3. **Expired Overrides**: Automatic cleanup is handled by queries
4. **Lock Cleanup**: Run `cleanup_expired_locks()` periodically
5. **Workflow Metrics**: Monitor approval times and bottlenecks

### Troubleshooting

#### Permission Not Working
1. Check user's role assignment
2. Verify role has permission in `role_permissions`
3. Check for permission overrides
4. Review audit logs for permission denials
5. Clear permission cache if needed

#### Approval Stuck
1. Check current step requirements
2. Verify users with required role exist
3. Check for escalation timeouts
4. Review approval delegates
5. Check notification delivery

#### Version Conflicts
1. Check content locks
2. Review concurrent edit attempts
3. Verify lock expiration settings
4. Check draft creation timestamps

## Migration and Updates

When adding new permissions:
1. Insert into `permissions` table
2. Update `role_permissions` for relevant roles
3. Clear permission caches
4. Update frontend permission checks
5. Document in this file

When modifying workflows:
1. Update workflow steps
2. Test with sample requests
3. Notify affected users
4. Monitor first executions

## Support

For issues or questions about the RBAC system, contact the development team or refer to the inline code documentation.