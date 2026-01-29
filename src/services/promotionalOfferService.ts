import { supabase } from '../lib/supabase';

export interface PromotionalOffer {
  id: string;
  name: string;
  description?: string;
  offer_type: 'percentage_discount' | 'free_bookings' | 'trial_period';
  discount_rate?: number;
  free_booking_limit?: number;
  trial_period_months?: number;
  trial_discount_rate?: number;
  start_date: string;
  end_date?: string;
  active: boolean;
  auto_apply_to_signups: boolean;
  display_text?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionalOfferInput {
  name: string;
  description?: string;
  offer_type: 'percentage_discount' | 'free_bookings' | 'trial_period';
  discount_rate?: number;
  free_booking_limit?: number;
  trial_period_months?: number;
  trial_discount_rate?: number;
  start_date: string;
  end_date?: string;
  active?: boolean;
  auto_apply_to_signups?: boolean;
  display_text?: string;
}

export interface OfferStats {
  organizations_enrolled: number;
  bookings_under_offer: number;
  total_commission_savings: number;
  revenue_impact: number;
}

/**
 * Get all promotional offers (admin only)
 */
export async function getAllPromotionalOffers(): Promise<PromotionalOffer[]> {
  const { data, error } = await supabase
    .from('promotional_offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get active promotional offers (publicly accessible for landing page)
 */
export async function getActivePromotionalOffers(): Promise<PromotionalOffer[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotional_offers')
    .select('*')
    .eq('active', true)
    .lte('start_date', now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get the current auto-apply promotional offer for new signups
 */
export async function getCurrentAutoApplyOffer(): Promise<PromotionalOffer | null> {
  const { data, error } = await supabase
    .rpc('get_active_promotional_offer');

  if (error) {
    console.error('Error getting active offer:', error);
    return null;
  }

  if (!data) return null;

  // Fetch the full offer details
  const { data: offer, error: offerError } = await supabase
    .from('promotional_offers')
    .select('*')
    .eq('id', data)
    .single();

  if (offerError) {
    console.error('Error fetching offer details:', offerError);
    return null;
  }

  return offer;
}

/**
 * Get promotional offer by ID
 */
export async function getPromotionalOfferById(id: string): Promise<PromotionalOffer | null> {
  const { data, error } = await supabase
    .from('promotional_offers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching offer:', error);
    return null;
  }

  return data;
}

/**
 * Create a new promotional offer (admin only)
 */
export async function createPromotionalOffer(
  input: CreatePromotionalOfferInput
): Promise<PromotionalOffer> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('promotional_offers')
    .insert({
      ...input,
      created_by: user?.id,
      active: input.active ?? true,
      auto_apply_to_signups: input.auto_apply_to_signups ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a promotional offer (admin only)
 */
export async function updatePromotionalOffer(
  id: string,
  updates: Partial<CreatePromotionalOfferInput>
): Promise<PromotionalOffer> {
  const { data, error } = await supabase
    .from('promotional_offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deactivate a promotional offer
 */
export async function deactivatePromotionalOffer(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotional_offers')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete a promotional offer (admin only)
 */
export async function deletePromotionalOffer(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotional_offers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get statistics for a promotional offer
 */
export async function getOfferStatistics(offerId: string): Promise<OfferStats> {
  // Get organizations enrolled
  const { count: orgCount, error: orgError } = await supabase
    .from('organisations')
    .select('*', { count: 'exact', head: true })
    .eq('promotional_offer_id', offerId);

  if (orgError) throw orgError;

  // Get bookings under offer
  const { data: commissions, error: commError } = await supabase
    .from('commission_records')
    .select('commission_savings, commission_amount')
    .eq('promotional_offer_id', offerId);

  if (commError) throw commError;

  const totalSavings = commissions?.reduce((sum, c) => sum + (Number(c.commission_savings) || 0), 0) || 0;
  const revenueImpact = commissions?.reduce((sum, c) => sum + (Number(c.commission_amount) || 0), 0) || 0;

  return {
    organizations_enrolled: orgCount || 0,
    bookings_under_offer: commissions?.length || 0,
    total_commission_savings: totalSavings,
    revenue_impact: revenueImpact,
  };
}

/**
 * Enroll an organization in a promotional offer
 */
export async function enrollOrganizationInOffer(
  organizationId: string,
  offerId: string
): Promise<void> {
  const { error } = await supabase
    .rpc('enroll_organization_in_offer', {
      p_organization_id: organizationId,
      p_offer_id: offerId,
    });

  if (error) throw error;
}

/**
 * Format promotional offer for display
 */
export function formatOfferDisplay(offer: PromotionalOffer): string {
  if (offer.display_text) {
    return offer.display_text;
  }

  switch (offer.offer_type) {
    case 'free_bookings':
      return `First ${offer.free_booking_limit} bookings commission-free!`;
    case 'percentage_discount':
      const discountPercent = Math.round((offer.discount_rate || 0) * 100);
      return `Only ${discountPercent}% commission (normally 15%)`;
    case 'trial_period':
      const trialPercent = Math.round((offer.trial_discount_rate || 0) * 100);
      return `${trialPercent}% commission for your first ${offer.trial_period_months} months!`;
    default:
      return offer.description || offer.name;
  }
}

/**
 * Check if an offer is currently valid
 */
export function isOfferValid(offer: PromotionalOffer): boolean {
  if (!offer.active) return false;

  const now = new Date();
  const startDate = new Date(offer.start_date);
  const endDate = offer.end_date ? new Date(offer.end_date) : null;

  if (now < startDate) return false;
  if (endDate && now > endDate) return false;

  return true;
}
