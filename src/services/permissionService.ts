import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  resource_type: string;
  action: string;
  scope_level: string;
  requires_approval: boolean;
}

export interface UserPermissions {
  permissions: Map<string, boolean>;
  role: string;
}

class PermissionService {
  private permissionCache: Map<string, UserPermissions> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  async checkPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_permission', {
        p_user_id: userId,
        p_permission_name: permissionName,
      });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      await this.logPermissionCheck(userId, permissionName, data || false);

      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const cached = this.getCachedPermissions(userId);
    if (cached) {
      return cached;
    }

    try {
      const [profile, permissionsData] = await Promise.all([
        this.getUserProfile(userId),
        this.fetchUserPermissions(userId),
      ]);

      if (!profile) {
        throw new Error('User profile not found');
      }

      const permissions = new Map<string, boolean>();
      permissionsData.forEach((perm) => {
        permissions.set(perm.permission_name, perm.granted);
      });

      const userPermissions: UserPermissions = {
        permissions,
        role: profile.role,
      };

      this.setCachedPermissions(userId, userPermissions);

      return userPermissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {
        permissions: new Map(),
        role: 'parent',
      };
    }
  }

  async checkMultiplePermissions(
    userId: string,
    permissionNames: string[]
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      permissionNames.map(async (permissionName) => {
        const hasPermission = await this.checkPermission(userId, permissionName);
        results.set(permissionName, hasPermission);
      })
    );

    return results;
  }

  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const results = await this.checkMultiplePermissions(userId, permissionNames);
    return Array.from(results.values()).some((granted) => granted);
  }

  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    const results = await this.checkMultiplePermissions(userId, permissionNames);
    return Array.from(results.values()).every((granted) => granted);
  }

  async grantPermissionOverride(
    userId: string,
    permissionName: string,
    grantedBy: string,
    reason: string,
    expiresAt?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const permission = await this.getPermissionByName(permissionName);
      if (!permission) {
        return { success: false, error: 'Permission not found' };
      }

      const { error } = await supabase.from('user_permission_overrides').insert({
        user_id: userId,
        permission_id: permission.id,
        granted: true,
        granted_by: grantedBy,
        reason,
        expires_at: expiresAt?.toISOString(),
      });

      if (error) {
        console.error('Error granting permission override:', error);
        return { success: false, error: error.message };
      }

      this.invalidateCache(userId);

      await this.logAuditEvent(grantedBy, 'permission_granted', 'user_permission_overrides', userId, {
        permission_name: permissionName,
        reason,
      });

      return { success: true };
    } catch (error) {
      console.error('Error granting permission override:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async revokePermissionOverride(
    userId: string,
    permissionName: string,
    revokedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const permission = await this.getPermissionByName(permissionName);
      if (!permission) {
        return { success: false, error: 'Permission not found' };
      }

      const { error } = await supabase
        .from('user_permission_overrides')
        .delete()
        .eq('user_id', userId)
        .eq('permission_id', permission.id);

      if (error) {
        console.error('Error revoking permission override:', error);
        return { success: false, error: error.message };
      }

      this.invalidateCache(userId);

      await this.logAuditEvent(revokedBy, 'permission_revoked', 'user_permission_overrides', userId, {
        permission_name: permissionName,
      });

      return { success: true };
    } catch (error) {
      console.error('Error revoking permission override:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource_type', { ascending: true })
        .order('action', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      return [];
    }
  }

  async getRolePermissions(role: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id, permissions(*)')
        .eq('role', role)
        .eq('granted', true);

      if (error) throw error;

      return data?.map((rp: any) => rp.permissions) || [];
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  }

  private async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  private async fetchUserPermissions(userId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data || [];
  }

  private async getPermissionByName(name: string): Promise<Permission | null> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (error) {
      console.error('Error fetching permission:', error);
      return null;
    }

    return data;
  }

  private async logPermissionCheck(
    userId: string,
    permissionName: string,
    granted: boolean
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'permission_check',
        resource_type: 'permissions',
        permission_name: permissionName,
        granted,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error logging permission check:', error);
    }
  }

  private async logAuditEvent(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: any
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  private getCachedPermissions(userId: string): UserPermissions | null {
    const expiry = this.cacheExpiry.get(userId);
    if (expiry && Date.now() < expiry) {
      return this.permissionCache.get(userId) || null;
    }
    return null;
  }

  private setCachedPermissions(userId: string, permissions: UserPermissions): void {
    this.permissionCache.set(userId, permissions);
    this.cacheExpiry.set(userId, Date.now() + this.CACHE_DURATION);
  }

  invalidateCache(userId?: string): void {
    if (userId) {
      this.permissionCache.delete(userId);
      this.cacheExpiry.delete(userId);
    } else {
      this.permissionCache.clear();
      this.cacheExpiry.clear();
    }
  }
}

export const permissionService = new PermissionService();
