import { supabase } from '../lib/supabase';

export interface PayoutSummary {
  organisation_id: string;
  organisation_name: string;
  total_pending_amount: number;
  pending_commission_count: number;
  earliest_commission_date: string;
  latest_commission_date: string;
}

export interface Payout {
  id: string;
  organisation_id: string;
  amount: number;
  commission_amount: number;
  platform_fee: number;
  period_start: string;
  period_end: string;
  commission_record_ids: string[];
  stripe_payout_id?: string;
  stripe_transfer_id?: string;
  status: 'pending' | 'scheduled' | 'processing' | 'paid' | 'failed' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get upcoming payouts summary for all organizations
 */
export async function getUpcomingPayouts(): Promise<PayoutSummary[]> {
  const { data, error } = await supabase
    .from('upcoming_payouts_summary')
    .select('*')
    .gt('total_pending_amount', 0)
    .order('total_pending_amount', { ascending: false });

  if (error) {
    console.error('Error fetching upcoming payouts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get payout history for an organization
 */
export async function getOrganizationPayouts(
  organisationId: string,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<Payout[]> {
  let query = supabase
    .from('payouts')
    .select('*')
    .eq('organisation_id', organisationId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching organization payouts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all payouts (admin view)
 */
export async function getAllPayouts(filters?: {
  status?: string;
  organisationId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<Payout[]> {
  let query = supabase.from('payouts').select('*, organisations(name)').order('created_at', {
    ascending: false,
  });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.organisationId) {
    query = query.eq('organisation_id', filters.organisationId);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all payouts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Process payouts for organizations (calls Edge Function)
 */
export async function processPayouts(organisationId?: string, manual: boolean = false) {
  const { data, error } = await supabase.functions.invoke('process-payouts', {
    body: { organisationId, manual },
  });

  if (error) {
    console.error('Error processing payouts:', error);
    throw error;
  }

  return data;
}

/**
 * Get payout details including commission records
 */
export async function getPayoutDetails(payoutId: string) {
  const { data: payout, error: payoutError } = await supabase
    .from('payouts')
    .select('*, organisations(name, contact_email)')
    .eq('id', payoutId)
    .single();

  if (payoutError) {
    console.error('Error fetching payout:', payoutError);
    throw payoutError;
  }

  if (!payout) {
    throw new Error('Payout not found');
  }

  // Fetch commission records
  const { data: commissions, error: commissionsError } = await supabase
    .from('commission_records')
    .select('*, camps(name), bookings(id, confirmation_date)')
    .in('id', payout.commission_record_ids || [])
    .order('created_at', { ascending: true });

  if (commissionsError) {
    console.error('Error fetching commissions:', commissionsError);
    throw commissionsError;
  }

  return {
    ...payout,
    commissions: commissions || [],
  };
}

/**
 * Cancel a pending payout
 */
export async function cancelPayout(payoutId: string) {
  const { data, error } = await supabase
    .from('payouts')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payoutId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    console.error('Error cancelling payout:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Payout not found or cannot be cancelled');
  }

  // Reset commission records to pending
  await supabase
    .from('commission_records')
    .update({
      payment_status: 'pending',
      paid_date: null,
      payment_reference: null,
    })
    .in('id', data.commission_record_ids || []);

  return data;
}

/**
 * Get payout statistics for an organization
 */
export async function getPayoutStatistics(organisationId: string) {
  const { data, error } = await supabase.rpc('get_payout_statistics', {
    org_id: organisationId,
  });

  if (error) {
    console.error('Error fetching payout statistics:', error);
    throw error;
  }

  return data;
}
