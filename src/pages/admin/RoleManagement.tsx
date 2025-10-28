import { useState, useEffect } from 'react';
import { Shield, Users, Key, Check, X } from 'lucide-react';
import { permissionService, type Permission } from '../../services/permissionService';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export function RoleManagement() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('marketing');
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'red' },
    { value: 'school_admin', label: 'School Admin', color: 'purple' },
    { value: 'marketing', label: 'Marketing Manager', color: 'blue' },
    { value: 'operations', label: 'Operations Manager', color: 'orange' },
    { value: 'risk', label: 'Risk Manager', color: 'amber' },
    { value: 'parent', label: 'Parent', color: 'slate' },
  ];

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  async function loadPermissions() {
    try {
      const allPermissions = await permissionService.getAllPermissions();

      const grouped = allPermissions.reduce((acc, perm) => {
        const groupName = perm.resource_type;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(perm);
        return acc;
      }, {} as Record<string, Permission[]>);

      const groups = Object.entries(grouped).map(([name, permissions]) => ({
        name,
        permissions,
      }));

      setPermissionGroups(groups);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(role: string) {
    try {
      const perms = await permissionService.getRolePermissions(role);
      setRolePermissions(new Set(perms.map((p) => p.name)));
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          </div>
          <p className="text-gray-600">
            View and manage role permissions across the platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Roles</h2>
              </div>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedRole === role.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    Role Permissions
                  </h3>
                  <p className="text-sm text-blue-700">
                    Permissions are standardized across all schools. Changes affect all users with this role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {roles.find((r) => r.value === selectedRole)?.label} Permissions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {rolePermissions.size} permissions assigned to this role
                </p>
              </div>

              <div className="p-6 space-y-6">
                {permissionGroups.map((group) => {
                  const groupPerms = group.permissions.filter((p) =>
                    rolePermissions.has(p.name)
                  );

                  if (groupPerms.length === 0) return null;

                  return (
                    <div key={group.name} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                        {group.name.replace('_', ' ')}
                      </h3>
                      <div className="space-y-2">
                        {groupPerms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="bg-green-100 rounded-full p-1">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {permission.display_name}
                                </h4>
                                {permission.requires_approval && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                                    Requires Approval
                                  </span>
                                )}
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                  {permission.scope_level}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {rolePermissions.size === 0 && (
                  <div className="text-center py-12">
                    <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No permissions assigned to this role</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
