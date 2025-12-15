import { useState, useEffect } from 'react';
import { Percent, TrendingUp, History, AlertCircle, Check, X } from 'lucide-react';
import {
  updateOrganizationDefaultRate,
  updateCampCommissionRate,
  getOrganizationWithRate,
  getCampCommissionHistory,
  type CommissionRateHistory,
} from '../../services/commissionRateService';
import { useAuth } from '../../contexts/AuthContext';

interface CommissionRateManagerProps {
  organisationId?: string;
  campId?: string;
  campName?: string;
  currentRate?: number;
  onUpdate?: () => void;
}

export function CommissionRateManager({
  organisationId,
  campId,
  campName,
  currentRate,
  onUpdate,
}: CommissionRateManagerProps) {
  const { user } = useAuth();
  const [rate, setRate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CommissionRateHistory[]>([]);
  const [organizationDefault, setOrganizationDefault] = useState<number | null>(null);

  const isCampLevel = !!campId;
  const isOrgLevel = !!organisationId && !campId;

  useEffect(() => {
    if (currentRate !== undefined) {
      setRate((currentRate * 100).toFixed(2));
    }
  }, [currentRate]);

  useEffect(() => {
    if (isCampLevel && organisationId) {
      loadOrganizationDefault();
    }
  }, [isCampLevel, organisationId]);

  const loadOrganizationDefault = async () => {
    if (!organisationId) return;

    try {
      const org = await getOrganizationWithRate(organisationId);
      setOrganizationDefault(org.default_commission_rate);
    } catch (err) {
      console.error('Error loading organization default rate:', err);
    }
  };

  const loadHistory = async () => {
    if (!campId) return;

    try {
      setLoading(true);
      const data = await getCampCommissionHistory(campId);
      setHistory(data);
      setShowHistory(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const rateValue = parseFloat(rate) / 100;

      if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
        throw new Error('Commission rate must be between 0% and 100%');
      }

      if (isOrgLevel && organisationId) {
        await updateOrganizationDefaultRate(organisationId, rateValue, notes);
      } else if (isCampLevel && campId) {
        await updateCampCommissionRate(campId, rateValue, user.id, notes);
      }

      setSuccess(true);
      setNotes('');

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update commission rate');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!campId || !user || !organizationDefault) return;

    if (
      !confirm(
        `Reset to organization default rate (${(organizationDefault * 100).toFixed(2)}%)?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateCampCommissionRate(campId, null, user.id, 'Reset to organization default');
      setRate((organizationDefault * 100).toFixed(2));
      setSuccess(true);

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Rate Update Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-airbnb-pink-100 rounded-lg flex items-center justify-center">
            <Percent className="w-5 h-5 text-airbnb-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-airbnb-grey-900">
              {isOrgLevel ? 'Organization Default Commission Rate' : 'Camp Commission Rate'}
            </h3>
            {campName && (
              <p className="text-sm text-airbnb-grey-600">
                Camp: {campName}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">Commission rate updated successfully!</div>
          </div>
        )}

        <div className="space-y-4">
          {/* Current Rate Display */}
          {currentRate !== undefined && (
            <div className="bg-airbnb-grey-50 rounded-lg p-4">
              <p className="text-sm text-airbnb-grey-600 mb-1">Current Rate</p>
              <p className="text-2xl font-bold text-airbnb-grey-900">
                {(currentRate * 100).toFixed(2)}%
              </p>
              {isCampLevel && organizationDefault !== null && (
                <p className="text-xs text-airbnb-grey-500 mt-1">
                  Organization default: {(organizationDefault * 100).toFixed(2)}%
                </p>
              )}
            </div>
          )}

          {/* Rate Input */}
          <div>
            <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">
              New Commission Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="0.01"
                min="0"
                max="100"
                required
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent pr-12"
                placeholder="15.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-airbnb-grey-500">
                %
              </div>
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">
              Platform will receive {rate || '0'}% commission, organization receives{' '}
              {(100 - parseFloat(rate || '0')).toFixed(2)}%
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent resize-none"
              placeholder="Reason for rate change..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !rate}
              className="flex-1 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 disabled:bg-airbnb-grey-400 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'Updating...' : 'Update Commission Rate'}
            </button>

            {isCampLevel && organizationDefault !== null && (
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={loading}
                className="bg-white hover:bg-airbnb-grey-50 border border-airbnb-grey-300 text-airbnb-grey-900 font-medium py-3 px-6 rounded-lg transition-all"
              >
                Reset to Default
              </button>
            )}

            {isCampLevel && (
              <button
                type="button"
                onClick={loadHistory}
                disabled={loading}
                className="bg-white hover:bg-airbnb-grey-50 border border-airbnb-grey-300 text-airbnb-grey-900 font-medium py-3 px-4 rounded-lg transition-all"
                title="View History"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Rate Examples */}
        <div className="mt-6 pt-6 border-t border-airbnb-grey-200">
          <p className="text-sm font-medium text-airbnb-grey-700 mb-3">Common Rates:</p>
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 20, 25].map((exampleRate) => (
              <button
                key={exampleRate}
                type="button"
                onClick={() => setRate(exampleRate.toFixed(2))}
                className="px-3 py-2 text-sm border border-airbnb-grey-300 rounded-lg hover:bg-airbnb-grey-50 transition-colors"
              >
                {exampleRate}%
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-airbnb-grey-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-airbnb-grey-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Commission Rate History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-airbnb-grey-600 hover:text-airbnb-grey-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {history.length === 0 ? (
                <p className="text-center text-airbnb-grey-500 py-12">No history available</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-airbnb-grey-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-airbnb-grey-900">
                            {(entry.commission_rate * 100).toFixed(2)}%
                          </p>
                          <p className="text-sm text-airbnb-grey-600">
                            Effective from {new Date(entry.effective_date).toLocaleDateString()}
                            {entry.end_date &&
                              ` to ${new Date(entry.end_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-airbnb-grey-500">
                          <p>Set by: {entry.set_by_email}</p>
                          <p>{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-airbnb-grey-700 bg-airbnb-grey-50 rounded px-3 py-2 mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
