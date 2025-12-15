import { useState, useEffect } from 'react';
import { Percent, Building2, Tent, TrendingUp, Search, Edit, History } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { CommissionRateManager } from '../../components/admin/CommissionRateManager';
import {
  getAllOrganizationsWithRates,
  getAllCommissionHistory,
  type CommissionRateHistory,
} from '../../services/commissionRateService';
import { supabase } from '../../lib/supabase';

interface Organization {
  id: string;
  name: string;
  default_commission_rate: number;
  active: boolean;
}

interface Camp {
  id: string;
  name: string;
  organisation_id: string;
  commission_rate: number | null;
  status: string;
  organisations: {
    name: string;
    default_commission_rate: number;
  };
}

export function CommissionRatesManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [history, setHistory] = useState<CommissionRateHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'organizations' | 'camps' | 'history'>('organizations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [orgsData, campsData, historyData] = await Promise.all([
        getAllOrganizationsWithRates(),
        loadCamps(),
        getAllCommissionHistory(100),
      ]);

      setOrganizations(orgsData);
      setCamps(campsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCamps = async () => {
    const { data, error } = await supabase
      .from('camps')
      .select('id, name, organisation_id, commission_rate, status, organisations(name, default_commission_rate)')
      .in('status', ['draft', 'requires_changes', 'submitted_for_review', 'approved'])
      .order('name');

    if (error) {
      console.error('Error loading camps:', error);
      return [];
    }

    return data || [];
  };

  const getEffectiveRate = (camp: Camp) => {
    return camp.commission_rate ?? camp.organisations.default_commission_rate;
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCamps = camps.filter(
    (camp) =>
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.organisations.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgUpdate = () => {
    setSelectedOrg(null);
    loadData();
  };

  const handleCampUpdate = () => {
    setSelectedCamp(null);
    loadData();
  };

  if (loading) {
    return (
      <DashboardLayout title="Commission Rate Management">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Commission Rate Management">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Total Organizations</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">{organizations.length}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Total Camps</span>
              <Tent className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">{camps.length}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Avg Commission Rate</span>
              <TrendingUp className="w-5 h-5 text-airbnb-pink-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              {(
                (organizations.reduce((sum, org) => sum + org.default_commission_rate, 0) /
                  organizations.length) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Custom Rates</span>
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              {camps.filter((c) => c.commission_rate !== null).length}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">Camps with overrides</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-airbnb-grey-200">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'organizations'
                    ? 'border-airbnb-pink-600 text-airbnb-pink-600'
                    : 'border-transparent text-airbnb-grey-600 hover:text-airbnb-grey-900'
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setActiveTab('camps')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'camps'
                    ? 'border-airbnb-pink-600 text-airbnb-pink-600'
                    : 'border-transparent text-airbnb-grey-600 hover:text-airbnb-grey-900'
                }`}
              >
                Camps
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'border-airbnb-pink-600 text-airbnb-pink-600'
                    : 'border-transparent text-airbnb-grey-600 hover:text-airbnb-grey-900'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {activeTab !== 'history' && (
            <div className="p-6 border-b border-airbnb-grey-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-airbnb-grey-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Default Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      # Camps
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-airbnb-grey-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-airbnb-grey-200">
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className="hover:bg-airbnb-grey-50">
                      <td className="px-6 py-4 text-sm text-airbnb-grey-900">{org.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                          {(org.default_commission_rate * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                        {camps.filter((c) => c.organisation_id === org.id).length}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="text-airbnb-pink-600 hover:text-airbnb-pink-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Camps Tab */}
          {activeTab === 'camps' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-airbnb-grey-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Camp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Effective Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Rate Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-airbnb-grey-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-airbnb-grey-200">
                  {filteredCamps.map((camp) => (
                    <tr key={camp.id} className="hover:bg-airbnb-grey-50">
                      <td className="px-6 py-4 text-sm text-airbnb-grey-900">{camp.name}</td>
                      <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                        {camp.organisations.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                          {(getEffectiveRate(camp) * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {camp.commission_rate !== null ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                            Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-airbnb-grey-100 text-airbnb-grey-700">
                            Default
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCamp(camp)}
                          className="text-airbnb-pink-600 hover:text-airbnb-pink-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-center text-airbnb-grey-500 py-12">No history available</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-airbnb-grey-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                              {(entry.commission_rate * 100).toFixed(2)}%
                            </span>
                            <span className="text-sm font-medium text-airbnb-grey-900">
                              {entry.camp_name}
                            </span>
                            <span className="text-sm text-airbnb-grey-500">
                              ({entry.organisation_name})
                            </span>
                          </div>
                          <p className="text-sm text-airbnb-grey-600">
                            Effective from {new Date(entry.effective_date).toLocaleDateString()}
                            {entry.end_date &&
                              ` to ${new Date(entry.end_date).toLocaleDateString()}`}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-airbnb-grey-700 bg-airbnb-grey-50 rounded px-3 py-2 mt-2">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-airbnb-grey-500">
                          <p>Set by: {entry.set_by_email}</p>
                          <p>{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Organization Modal */}
        {selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-airbnb-grey-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-airbnb-grey-900">
                  Edit Organization Default Rate
                </h3>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="text-airbnb-grey-600 hover:text-airbnb-grey-900"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <CommissionRateManager
                  organisationId={selectedOrg.id}
                  currentRate={selectedOrg.default_commission_rate}
                  onUpdate={handleOrgUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Camp Modal */}
        {selectedCamp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-airbnb-grey-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-airbnb-grey-900">
                  Edit Camp Commission Rate
                </h3>
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="text-airbnb-grey-600 hover:text-airbnb-grey-900"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <CommissionRateManager
                  campId={selectedCamp.id}
                  campName={selectedCamp.name}
                  organisationId={selectedCamp.organisation_id}
                  currentRate={getEffectiveRate(selectedCamp)}
                  onUpdate={handleCampUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
