import { supabase } from '../lib/supabase';

export interface CommissionRateUpdate {
  campId?: string;
  organisationId?: string;
  rate: number;
  notes?: string;
}

export interface CommissionRateHistory {
  id: string;
  camp_id: string;
  commission_rate: number;
  effective_date: string;
  end_date: string | null;
  set_by: string;
  notes: string | null;
  created_at: string;
  camp_name: string;
  organisation_name: string;
  set_by_email: string;
}

/**
 * Get the effective commission rate for a camp
 * Returns camp-specific rate if set, otherwise organization default
 */
export async function getEffectiveCommissionRate(campId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_effective_commission_rate', {
    camp_id: campId,
  });

  if (error) {
    console.error('Error getting effective commission rate:', error);
    throw error;
  }

  return data || 0.15;
}

/**
 * Update organization's default commission rate
 */
export async function updateOrganizationDefaultRate(
  organisationId: string,
  rate: number,
  notes?: string
): Promise<void> {
  if (rate < 0 || rate > 1) {
    throw new Error('Commission rate must be between 0 and 1 (0% to 100%)');
  }

  const { error } = await supabase
    .from('organisations')
    .update({
      default_commission_rate: rate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organisationId);

  if (error) {
    console.error('Error updating organization default rate:', error);
    throw error;
  }

  // Log the change
  console.log(
    `Organization ${organisationId} default commission rate updated to ${(rate * 100).toFixed(
      2
    )}%${notes ? `: ${notes}` : ''}`
  );
}

/**
 * Update camp-specific commission rate (overrides organization default)
 */
export async function updateCampCommissionRate(
  campId: string,
  rate: number | null,
  userId: string,
  notes?: string
): Promise<void> {
  if (rate !== null && (rate < 0 || rate > 1)) {
    throw new Error('Commission rate must be between 0 and 1 (0% to 100%), or null to use default');
  }

  // Get current rate for history
  const { data: camp } = await supabase
    .from('camps')
    .select('commission_rate, organisation_id')
    .eq('id', campId)
    .single();

  if (!camp) {
    throw new Error('Camp not found');
  }

  // Update camp commission rate
  const { error: updateError } = await supabase
    .from('camps')
    .update({
      commission_rate: rate,
      commission_rate_updated_at: new Date().toISOString(),
      commission_rate_updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campId);

  if (updateError) {
    console.error('Error updating camp commission rate:', updateError);
    throw updateError;
  }

  // Record in history table if rate changed
  if (rate !== null && rate !== camp.commission_rate) {
    // End previous rate period
    const { error: endError } = await supabase
      .from('camp_commission_rates')
      .update({ end_date: new Date().toISOString() })
      .eq('camp_id', campId)
      .is('end_date', null);

    if (endError) {
      console.warn('Error ending previous commission rate period:', endError);
    }

    // Create new rate record
    const { error: historyError } = await supabase.from('camp_commission_rates').insert({
      camp_id: campId,
      commission_rate: rate,
      effective_date: new Date().toISOString(),
      set_by: userId,
      notes: notes || null,
    });

    if (historyError) {
      console.error('Error recording commission rate history:', historyError);
      // Don't throw - rate was updated successfully, history is optional
    }
  }

  console.log(
    `Camp ${campId} commission rate updated to ${
      rate === null ? 'organization default' : (rate * 100).toFixed(2) + '%'
    }${notes ? `: ${notes}` : ''}`
  );
}

/**
 * Get commission rate history for a camp
 */
export async function getCampCommissionHistory(campId: string): Promise<CommissionRateHistory[]> {
  const { data, error } = await supabase
    .from('commission_rate_history')
    .select('*')
    .eq('camp_id', campId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commission rate history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all commission rate history (admin view)
 */
export async function getAllCommissionHistory(
  limit: number = 50
): Promise<CommissionRateHistory[]> {
  const { data, error } = await supabase
    .from('commission_rate_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching all commission history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get organization with default commission rate
 */
export async function getOrganizationWithRate(organisationId: string) {
  const { data, error } = await supabase
    .from('organisations')
    .select('id, name, default_commission_rate')
    .eq('id', organisationId)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }

  return data;
}

/**
 * Get all organizations with their default rates
 */
export async function getAllOrganizationsWithRates() {
  const { data, error } = await supabase
    .from('organisations')
    .select('id, name, default_commission_rate, active')
    .order('name');

  if (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Bulk update commission rates for multiple camps
 */
export async function bulkUpdateCampCommissionRates(
  updates: Array<{ campId: string; rate: number | null }>,
  userId: string,
  notes?: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const update of updates) {
    try {
      await updateCampCommissionRate(update.campId, update.rate, userId, notes);
      success++;
    } catch (error: any) {
      failed++;
      errors.push(`Camp ${update.campId}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Reset camp commission rate to use organization default
 */
export async function resetCampToDefaultRate(campId: string, userId: string): Promise<void> {
  await updateCampCommissionRate(campId, null, userId, 'Reset to organization default');
}
