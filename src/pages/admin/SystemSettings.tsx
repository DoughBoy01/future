import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Percent, History, AlertTriangle, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSystemDefault,
  updateSystemDefault,
  getSystemSettingsHistory,
} from '../../services/systemSettingsService';
import { formatRatePercentage } from '../../utils/commissionRateFormatting';
import toast from 'react-hot-toast';

interface AuditRecord {
  id: string;
  key: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  notes: string;
  created_at: string;
  changed_by_profile?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function SystemSettings() {
  const { user } = useAuth();
  const [currentRate, setCurrentRate] = useState<number>(0.15);
  const [newRate, setNewRate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rate, auditHistory] = await Promise.all([
        getSystemDefault(),
        getSystemSettingsHistory(50),
      ]);
      setCurrentRate(rate);
      setHistory(auditHistory);
    } catch (error) {
      console.error('Error loading system settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast.error('Please provide a reason for changing the default commission rate');
      return;
    }

    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      toast.error('Please enter a valid commission rate between 0 and 100');
      return;
    }

    // Convert percentage to decimal (e.g., 15 -> 0.15)
    const rateDecimal = rateValue / 100;

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      await updateSystemDefault(rateDecimal, user.id, notes.trim());
      toast.success('System default commission rate updated successfully');
      setNewRate('');
      setNotes('');
      await loadData();
    } catch (error: any) {
      console.error('Error updating system default:', error);
      toast.error(error.message || 'Failed to update system default');
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAdminName = (record: AuditRecord) => {
    if (record.changed_by_profile) {
      const { first_name, last_name, email } = record.changed_by_profile;
      return `${first_name} ${last_name} (${email})`;
    }
    return record.changed_by;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading system settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          </div>
          <p className="text-gray-600">Configure system-wide default settings</p>
        </div>

        {/* Current System Default Card */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Current System Default Commission Rate
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                This rate is automatically applied to all new organizations when they sign up
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-pink-600">
                {formatRatePercentage(currentRate, 1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                (Organizers keep {formatRatePercentage(1 - currentRate, 1)})
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update System Default</h3>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <strong>Warning:</strong> Changing the system default will affect all new organizations
              created after this change. Existing organizations will keep their current rates unless
              individually updated.
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Commission Rate (%) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g., 15.0"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <span className="text-gray-500 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {(currentRate * 100).toFixed(1)}% commission (organizers keep{' '}
                {((1 - currentRate) * 100).toFixed(1)}%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Explain why you are changing the system default commission rate..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be recorded in the audit log for transparency
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                to="/admin/dashboard/commission-rates"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Commission Rates
              </Link>
              <button
                type="submit"
                disabled={saving || !newRate || !notes.trim()}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Update System Default'}
              </button>
            </div>
          </form>
        </div>

        {/* Audit History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Change History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No changes recorded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Changed from {formatRatePercentage(parseFloat(record.old_value))} to{' '}
                            {formatRatePercentage(parseFloat(record.new_value))}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(record.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Reason:</strong> {record.notes}
                      </div>
                      <div className="text-xs text-gray-500">
                        Changed by: {getAdminName(record)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
