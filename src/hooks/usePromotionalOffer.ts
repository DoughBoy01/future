import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PromotionalOffer {
  id: string;
  name: string;
  description: string;
  offer_type: 'percentage_discount' | 'free_bookings' | 'trial_period';
  discount_rate?: number;
  free_booking_limit?: number;
  trial_period_months?: number;
  trial_discount_rate?: number;
  display_text: string;
  start_date: string;
  end_date: string;
}

/**
 * React hook to fetch and manage promotional offers
 *
 * Fetches either the active auto-apply promotional offer (for signup pages)
 * or an organization's enrolled promotional offer.
 *
 * @param organizationId - Optional organization ID to fetch org-specific enrolled offer
 * @returns Object with offer details, loading state, and computed values
 *
 * @example
 * // Get active auto-apply offer for signup page
 * const { offer, isActive, loading } = usePromotionalOffer();
 *
 * @example
 * // Get organization's enrolled offer
 * const { offer, isActive, bookingsRemaining } = usePromotionalOffer(orgId);
 */
export function usePromotionalOffer(organizationId?: string) {
  const [offer, setOffer] = useState<PromotionalOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingsUsed, setBookingsUsed] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOffer() {
      try {
        setLoading(true);
        setError(null);

        if (!organizationId) {
          // Check for active auto-apply offer for signup pages
          const { data, error: fetchError } = await supabase
            .from('promotional_offers')
            .select('*')
            .eq('active', true)
            .eq('auto_apply_to_signups', true)
            .lte('start_date', new Date().toISOString())
            .gte('end_date', new Date().toISOString())
            .maybeSingle();

          if (fetchError) {
            throw fetchError;
          }

          if (mounted && data) {
            setOffer(data as PromotionalOffer);
          }
        } else {
          // Fetch organization's enrolled offer
          const { data: org, error: fetchError } = await supabase
            .from('organisations')
            .select(
              `
              promotional_offer_id,
              offer_bookings_count,
              offer_expires_at,
              promotional_offers(*)
            `
            )
            .eq('id', organizationId)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          if (mounted) {
            if (org?.promotional_offers) {
              setOffer(org.promotional_offers as unknown as PromotionalOffer);
              setBookingsUsed(org.offer_bookings_count || 0);
              setExpiresAt(org.offer_expires_at ? new Date(org.offer_expires_at) : null);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching promotional offer:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch promotional offer');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOffer();

    return () => {
      mounted = false;
    };
  }, [organizationId]);

  // Computed values
  const now = new Date();
  const offerEndDate = offer ? new Date(offer.end_date) : null;
  const isActive =
    offer &&
    (expiresAt ? expiresAt > now : true) &&
    (offerEndDate ? offerEndDate > now : true);

  const bookingsRemaining =
    offer?.offer_type === 'free_bookings' && offer.free_booking_limit
      ? Math.max(0, offer.free_booking_limit - bookingsUsed)
      : null;

  const daysUntilExpiration = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return {
    offer,
    loading,
    isActive,
    bookingsUsed,
    bookingsRemaining,
    expiresAt,
    daysUntilExpiration,
    error,
  };
}
