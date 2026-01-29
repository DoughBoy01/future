import { supabase } from '../lib/supabase';

/**
 * System Settings Service
 *
 * Manages system-wide configuration settings with caching and audit trail.
 * Settings are stored in a key-value format in the system_settings table.
 */

// In-memory cache for system settings (5 minute TTL)
const cache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface SystemSettingsAudit {
  id: string;
  key: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  notes: string;
  created_at: string;
  changed_by_profile?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Get the system-wide default commission rate
 * Returns cached value if available, otherwise fetches from database
 * @returns Commission rate as decimal (e.g., 0.15 for 15%)
 */
export async function getSystemDefault(): Promise<number> {
  const cached = cache.get('default_commission_rate');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return parseFloat(cached.value);
  }

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'default_commission_rate')
    .single();

  if (error || !data) {
    console.warn('Failed to fetch system default commission rate, using fallback 0.15', error);
    return 0.15;
  }

  const value = parseFloat(data.value as string);
  cache.set('default_commission_rate', { value, timestamp: Date.now() });
  return value;
}

/**
 * Update the system-wide default commission rate
 * Requires super admin privileges
 * @param rate - Commission rate as decimal (0-1 range, e.g., 0.15 for 15%)
 * @param userId - Profile ID of admin making the change
 * @param notes - Required explanation of why the rate was changed
 */
export async function updateSystemDefault(
  rate: number,
  userId: string,
  notes: string
): Promise<void> {
  if (rate < 0 || rate > 1) {
    throw new Error('Commission rate must be between 0 and 1 (0% to 100%)');
  }

  if (!notes || notes.trim().length === 0) {
    throw new Error('Notes explaining the rate change are required');
  }

  // Get old value for audit
  const { data: oldSetting, error: fetchError } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'default_commission_rate')
    .single();

  if (fetchError) {
    console.error('Error fetching current system default:', fetchError);
    throw new Error('Failed to fetch current system default');
  }

  // Update setting
  const { error: updateError } = await supabase
    .from('system_settings')
    .update({
      value: rate.toString(),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'default_commission_rate');

  if (updateError) {
    console.error('Error updating system default:', updateError);
    throw new Error('Failed to update system default commission rate');
  }

  // Record in audit log
  const { error: auditError } = await supabase.from('system_settings_audit').insert({
    key: 'default_commission_rate',
    old_value: oldSetting?.value || '0.15',
    new_value: rate.toString(),
    changed_by: userId,
    notes: notes.trim(),
  });

  if (auditError) {
    console.warn('Failed to record audit log:', auditError);
    // Don't throw - the setting was updated successfully
  }

  // Clear cache to force refetch
  cache.delete('default_commission_rate');

  console.log(
    `System default commission rate updated from ${oldSetting?.value || '0.15'} to ${rate} by user ${userId}`
  );
}

/**
 * Get system settings audit history
 * @param limit - Maximum number of records to return (default 50)
 * @returns Array of audit records with admin attribution
 */
export async function getSystemSettingsHistory(
  limit: number = 50
): Promise<SystemSettingsAudit[]> {
  const { data, error } = await supabase
    .from('system_settings_audit')
    .select(
      `
      *,
      changed_by_profile:profiles!system_settings_audit_changed_by_fkey(email, first_name, last_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching system settings history:', error);
    throw new Error('Failed to fetch system settings history');
  }

  return (data || []) as SystemSettingsAudit[];
}

/**
 * Clear the cache for a specific setting
 * Useful for testing or when you know the database value has changed externally
 * @param key - Setting key to clear from cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get a generic system setting by key
 * @param key - Setting key
 * @returns Setting value or null if not found
 */
export async function getSystemSetting(key: string): Promise<any> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) {
    console.warn(`Failed to fetch system setting: ${key}`, error);
    return null;
  }

  cache.set(key, { value: data.value, timestamp: Date.now() });
  return data.value;
}

/**
 * Update a generic system setting
 * @param key - Setting key
 * @param value - New value (will be stored as JSONB)
 * @param userId - Profile ID of admin making the change
 * @param notes - Required explanation
 */
export async function updateSystemSetting(
  key: string,
  value: any,
  userId: string,
  notes: string
): Promise<void> {
  if (!notes || notes.trim().length === 0) {
    throw new Error('Notes explaining the change are required');
  }

  // Get old value for audit
  const { data: oldSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();

  // Upsert setting (insert or update)
  const { error: upsertError } = await supabase.from('system_settings').upsert({
    key,
    value,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  });

  if (upsertError) {
    console.error(`Error updating system setting ${key}:`, upsertError);
    throw new Error(`Failed to update system setting: ${key}`);
  }

  // Record in audit log
  const { error: auditError } = await supabase.from('system_settings_audit').insert({
    key,
    old_value: oldSetting?.value || null,
    new_value: value,
    changed_by: userId,
    notes: notes.trim(),
  });

  if (auditError) {
    console.warn('Failed to record audit log:', auditError);
  }

  // Clear cache
  cache.delete(key);
}
