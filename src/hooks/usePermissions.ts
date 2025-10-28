import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { permissionService, type UserPermissions } from '../services/permissionService';

export function usePermissions() {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadPermissions();
    } else {
      setPermissions(null);
      setLoading(false);
    }
  }, [user, profile]);

  async function loadPermissions() {
    if (!user) return;

    try {
      const userPerms = await permissionService.getUserPermissions(user.id);
      setPermissions(userPerms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }

  const hasPermission = (permissionName: string): boolean => {
    if (!permissions) return false;
    return permissions.permissions.get(permissionName) === true;
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!permissions) return false;
    return permissionNames.some((name) => permissions.permissions.get(name) === true);
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!permissions) return false;
    return permissionNames.every((name) => permissions.permissions.get(name) === true);
  };

  const checkPermission = async (permissionName: string): Promise<boolean> => {
    if (!user) return false;
    return await permissionService.checkPermission(user.id, permissionName);
  };

  return {
    permissions,
    loading,
    role: profile?.role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    refresh: loadPermissions,
  };
}
