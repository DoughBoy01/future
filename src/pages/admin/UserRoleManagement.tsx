import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Search, Shield, ChevronDown, AlertCircle, CheckCircle, User, History } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Role = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: Record<string, boolean>;
};

type RoleAssignmentHistory = {
  id: string;
  user_id: string;
  old_role: string | null;
  new_role: string;
  assigned_by: string | null;
  reason: string | null;
  created_at: string;
  assigned_by_name?: string;
};

type UserWithEmail = Profile & {
  email?: string;
};

const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showHistoryForUser, setShowHistoryForUser] = useState<string | null>(null);
  const [roleHistory, setRoleHistory] = useState<RoleAssignmentHistory[]>([]);

  useEffect(() => {
    fetchRolesAndUsers();
  }, [selectedRole]);

  const fetchRolesAndUsers = async () => {
    try {
      setLoading(true);

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false });

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      // Fetch users with their emails using RPC function
      if (selectedRole === 'all') {
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_all_users_with_emails');

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } else {
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_users_by_role_with_emails', { p_role: selectedRole });

        if (usersError) throw usersError;
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Failed to load users and roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_assignment_history')
        .select(`
          *,
          assigned_by_profile:profiles!role_assignment_history_assigned_by_fkey(first_name, last_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historyWithNames = (data || []).map((item: any) => ({
        ...item,
        assigned_by_name: item.assigned_by_profile
          ? `${item.assigned_by_profile.first_name} ${item.assigned_by_profile.last_name}`
          : 'System'
      }));

      setRoleHistory(historyWithNames);
    } catch (error) {
      console.error('Error fetching role history:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    if (!confirm(`Are you sure you want to change ${userName}'s role to ${getRoleDisplayName(newRole)}?`)) {
      return;
    }

    try {
      setUpdatingUserId(userId);

      // Call the RPC function to update role with audit logging
      const { error } = await supabase.rpc('update_user_role', {
        p_user_id: userId,
        p_new_role: newRole,
        p_reason: 'Role updated via admin panel'
      });

      if (error) throw error;

      // Refresh users list
      await fetchRolesAndUsers();
      showNotification('success', `Successfully updated ${userName}'s role to ${getRoleDisplayName(newRole)}`);
    } catch (error: any) {
      console.error('Error updating role:', error);
      showNotification('error', error.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleDisplayName = (roleName: string): string => {
    const role = roles.find(r => r.name === roleName);
    return role?.display_name || roleName;
  };

  const getRoleDescription = (roleName: string): string => {
    const role = roles.find(r => r.name === roleName);
    return role?.description || '';
  };

  const getRoleColor = (roleName: string): string => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return 'bg-gray-100 text-gray-800';

    switch (role.level) {
      case 5:
        return 'bg-purple-100 text-purple-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleHistory = async (userId: string) => {
    if (showHistoryForUser === userId) {
      setShowHistoryForUser(null);
      setRoleHistory([]);
    } else {
      setShowHistoryForUser(userId);
      await fetchRoleHistory(userId);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">User Role Management</h1>
          </div>
          <p className="text-gray-600">
            Manage user roles and permissions across the platform. Only Super Admins can assign roles.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Role Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role.name)}`}>
                    {role.display_name}
                  </span>
                  <span className="text-xs text-gray-500">Level {role.level}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at!).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  e.target.value,
                                  `${user.first_name} ${user.last_name}`
                                )
                              }
                              disabled={updatingUserId === user.id}
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                  {role.display_name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => toggleHistory(user.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="View role history"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showHistoryForUser === user.id && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Role Assignment History</h4>
                              {roleHistory.length === 0 ? (
                                <p className="text-sm text-gray-500">No role changes recorded</p>
                              ) : (
                                <div className="space-y-2">
                                  {roleHistory.map((history) => (
                                    <div
                                      key={history.id}
                                      className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div>
                                        <span className="text-gray-600">
                                          Changed from{' '}
                                          <span className="font-medium">
                                            {history.old_role ? getRoleDisplayName(history.old_role) : 'No role'}
                                          </span>{' '}
                                          to{' '}
                                          <span className="font-medium">{getRoleDisplayName(history.new_role)}</span>
                                        </span>
                                        {history.assigned_by_name && (
                                          <span className="text-gray-500 ml-2">
                                            by {history.assigned_by_name}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-gray-400 text-xs">
                                        {new Date(history.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {roles.map((role) => {
            const count = users.filter((u) => u.role === role.name).length;
            return (
              <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{role.display_name}s</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserRoleManagement;
