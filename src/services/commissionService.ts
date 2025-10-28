import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type CommissionRecord = Database['public']['Tables']['commission_records']['Row'];
type CommissionRecordInsert = Database['public']['Tables']['commission_records']['Insert'];

export interface CommissionCalculation {
  registrationAmount: number;
  commissionRate: number;
  commissionAmount: number;
}

export async function getActiveCommissionRate(campId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('get_active_commission_rate', { p_camp_id: campId });

  if (error) {
    console.error('Error getting commission rate:', error);
    return 0;
  }

  return data || 0;
}

export async function calculateCommission(
  registrationAmount: number,
  commissionRate: number
): Promise<CommissionCalculation> {
  const commissionAmount = registrationAmount * commissionRate;

  return {
    registrationAmount,
    commissionRate,
    commissionAmount,
  };
}

export async function createCommissionRecord(
  registrationId: string
): Promise<CommissionRecord | null> {
  const { data, error } = await supabase
    .rpc('create_commission_record', { p_registration_id: registrationId });

  if (error) {
    console.error('Error creating commission record:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: record, error: fetchError } = await supabase
    .from('commission_records')
    .select('*')
    .eq('id', data)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching created commission record:', fetchError);
    return null;
  }

  return record;
}

export async function getCommissionRecordsForCamp(
  campId: string
): Promise<CommissionRecord[]> {
  const { data, error } = await supabase
    .from('commission_records')
    .select('*')
    .eq('camp_id', campId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commission records:', error);
    return [];
  }

  return data || [];
}

export async function getCommissionRecordsForOrganisation(
  organisationId: string,
  filters?: {
    paymentStatus?: string;
    campId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<CommissionRecord[]> {
  let query = supabase
    .from('commission_records')
    .select('*')
    .eq('organisation_id', organisationId);

  if (filters?.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  if (filters?.campId) {
    query = query.eq('camp_id', filters.campId);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching commission records:', error);
    return [];
  }

  return data || [];
}

export interface CommissionSummary {
  totalCommission: number;
  pendingCommission: number;
  processingCommission: number;
  paidCommission: number;
  totalRecords: number;
  averageCommissionRate: number;
}

export async function getCommissionSummary(
  organisationId?: string,
  campId?: string
): Promise<CommissionSummary> {
  let query = supabase.from('commission_records').select('*');

  if (organisationId) {
    query = query.eq('organisation_id', organisationId);
  }

  if (campId) {
    query = query.eq('camp_id', campId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching commission summary:', error);
    return {
      totalCommission: 0,
      pendingCommission: 0,
      processingCommission: 0,
      paidCommission: 0,
      totalRecords: 0,
      averageCommissionRate: 0,
    };
  }

  const records = data || [];

  const totalCommission = records.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const pendingCommission = records
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const processingCommission = records
    .filter(r => r.payment_status === 'processing')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const paidCommission = records
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  const averageCommissionRate = records.length > 0
    ? records.reduce((sum, r) => sum + (r.commission_rate || 0), 0) / records.length
    : 0;

  return {
    totalCommission,
    pendingCommission,
    processingCommission,
    paidCommission,
    totalRecords: records.length,
    averageCommissionRate,
  };
}

export async function updateCommissionPaymentStatus(
  commissionId: string,
  paymentStatus: 'pending' | 'processing' | 'paid' | 'disputed' | 'cancelled',
  paymentReference?: string
): Promise<CommissionRecord | null> {
  const updateData: Partial<CommissionRecordInsert> = {
    payment_status: paymentStatus,
    payment_reference: paymentReference || null,
  };

  if (paymentStatus === 'paid') {
    updateData.paid_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('commission_records')
    .update(updateData)
    .eq('id', commissionId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating commission payment status:', error);
    throw error;
  }

  return data;
}

export async function bulkUpdateCommissionPaymentStatus(
  commissionIds: string[],
  paymentStatus: 'pending' | 'processing' | 'paid' | 'disputed' | 'cancelled',
  paymentReference?: string
): Promise<CommissionRecord[]> {
  const updateData: Partial<CommissionRecordInsert> = {
    payment_status: paymentStatus,
    payment_reference: paymentReference || null,
  };

  if (paymentStatus === 'paid') {
    updateData.paid_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('commission_records')
    .update(updateData)
    .in('id', commissionIds)
    .select();

  if (error) {
    console.error('Error bulk updating commission payment status:', error);
    throw error;
  }

  return data || [];
}

export async function getCampSalesIncome(campId: string): Promise<{
  totalSales: number;
  totalCommission: number;
  salesCount: number;
}> {
  const { data, error } = await supabase
    .from('commission_records')
    .select('registration_amount, commission_amount')
    .eq('camp_id', campId);

  if (error) {
    console.error('Error fetching camp sales income:', error);
    return { totalSales: 0, totalCommission: 0, salesCount: 0 };
  }

  const records = data || [];

  return {
    totalSales: records.reduce((sum, r) => sum + (r.registration_amount || 0), 0),
    totalCommission: records.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
    salesCount: records.length,
  };
}

export async function recordCommissionRateChange(
  campId: string,
  newRate: number,
  setBy: string,
  notes?: string
): Promise<void> {
  const now = new Date().toISOString();

  const { data: existingRates } = await supabase
    .from('camp_commission_rates')
    .select('*')
    .eq('camp_id', campId)
    .is('end_date', null);

  if (existingRates && existingRates.length > 0) {
    await supabase
      .from('camp_commission_rates')
      .update({ end_date: now })
      .eq('camp_id', campId)
      .is('end_date', null);
  }

  const { error } = await supabase
    .from('camp_commission_rates')
    .insert({
      camp_id: campId,
      commission_rate: newRate,
      effective_date: now,
      set_by: setBy,
      notes: notes || null,
    });

  if (error) {
    console.error('Error recording commission rate change:', error);
    throw error;
  }
}
