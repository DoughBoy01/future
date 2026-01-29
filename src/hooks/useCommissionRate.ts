import { useState, useEffect } from 'react';
import { getSystemDefault } from '../services/systemSettingsService';
import { getOrganizationWithRate } from '../services/commissionRateService';

/**
 * React hook to fetch and manage commission rates
 *
 * Fetches either the system-wide default commission rate or an organization-specific rate.
 * Automatically handles loading states and error fallbacks.
 *
 * @param organizationId - Optional organization ID to fetch org-specific rate
 * @returns Object with rate, loading state, and whether it's using the system default
 *
 * @example
 * // Get system default
 * const { rate, loading } = useCommissionRate();
 *
 * @example
 * // Get organization-specific rate
 * const { rate, loading, isSystemDefault } = useCommissionRate(orgId);
 */
export function useCommissionRate(organizationId?: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSystemDefault, setIsSystemDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRate() {
      try {
        setLoading(true);
        setError(null);

        if (organizationId) {
          // Fetch organization-specific rate
          const org = await getOrganizationWithRate(organizationId);
          if (mounted) {
            setRate(org.default_commission_rate);
            setIsSystemDefault(false);
          }
        } else {
          // Fetch system default
          const systemDefault = await getSystemDefault();
          if (mounted) {
            setRate(systemDefault);
            setIsSystemDefault(true);
          }
        }
      } catch (err) {
        console.error('Error fetching commission rate:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch commission rate');
          setRate(0.15); // Fallback to 15%
          setIsSystemDefault(!organizationId);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchRate();

    return () => {
      mounted = false;
    };
  }, [organizationId]);

  return {
    rate,
    loading,
    isSystemDefault,
    error,
  };
}
