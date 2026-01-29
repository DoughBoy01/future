import { supabase } from '../lib/supabase';

export interface TogglePublishResult {
  success: boolean;
  new_status: string | null;
  message: string;
  confirmed_bookings_count: number;
}

/**
 * Toggle camp status between published and unpublished
 * @param campId - UUID of the camp to toggle
 * @returns Result object with success status and details
 */
export async function toggleCampPublishStatus(
  campId: string
): Promise<TogglePublishResult> {
  try {
    const { data, error } = await supabase.rpc('toggle_camp_publish_status', {
      p_camp_id: campId,
    });

    if (error) {
      console.error('Error toggling camp publish status:', error);

      // Parse Stripe validation errors from trigger
      if (error.message?.includes('Stripe account not connected')) {
        return {
          success: false,
          new_status: null,
          message: 'Cannot publish: Stripe account not connected. Please visit Payment Settings.',
          confirmed_bookings_count: 0,
        };
      }

      if (
        error.message?.includes('Stripe payouts not enabled') ||
        error.message?.includes('Complete Stripe onboarding')
      ) {
        return {
          success: false,
          new_status: null,
          message: 'Cannot publish: Complete Stripe onboarding in Payment Settings.',
          confirmed_bookings_count: 0,
        };
      }

      if (error.message?.includes('Stripe account is restricted')) {
        return {
          success: false,
          new_status: null,
          message: 'Cannot publish: Stripe account is restricted. Complete verification.',
          confirmed_bookings_count: 0,
        };
      }

      throw error;
    }

    // RPC returns array, take first result
    const result = Array.isArray(data) ? data[0] : data;

    return {
      success: result?.success || false,
      new_status: result?.new_status || null,
      message: result?.message || 'Status updated',
      confirmed_bookings_count: result?.confirmed_bookings_count || 0,
    };
  } catch (err: any) {
    console.error('Unexpected error toggling camp publish status:', err);
    return {
      success: false,
      new_status: null,
      message: err?.message || 'Failed to toggle camp status. Please try again.',
      confirmed_bookings_count: 0,
    };
  }
}

/**
 * Check if a camp can be toggled (has valid status)
 * @param status - Current camp status
 * @returns true if status is published or unpublished
 */
export function canTogglePublishStatus(status: string): boolean {
  return status === 'published' || status === 'unpublished';
}
