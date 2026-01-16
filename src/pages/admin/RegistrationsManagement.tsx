import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Download, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Registration {
  id: string;
  camp_name: string;
  organisation_name: string;
  category: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'published' | 'draft';
  registration_date: string;
  location: string;
  start_date: string;
}

export function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const { data, error } = await supabase
        .from('camps')
        .select(`
          id,
          name,
          category,
          status,
          location,
          start_date,
          created_at,
          organisations(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const registrationsData: Registration[] = (data || []).map((camp: any) => ({
        id: camp.id,
        camp_name: camp.name || 'Unknown Camp',
        organisation_name: camp.organisations?.name || 'No Organisation',
        category: camp.category || 'Uncategorized',
        status: camp.status,
        registration_date: camp.created_at,
        location: camp.location || 'Unknown',
        start_date: camp.start_date,
      }));

      setRegistrations(registrationsData);
    } catch (error: any) {
      console.error('Error loading camp registrations:', error);
      console.error('Error details:', error.message, error.details, error.hint);
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    if (filterStatus !== 'all' && reg.status !== filterStatus) return false;
    return true;
  });

  const columns: Column<Registration>[] = [
    {
      key: 'camp_name',
      label: 'Camp Name',
      sortable: true,
      render: (reg) => (
        <p className="font-medium text-gray-900">{reg.camp_name}</p>
      ),
    },
    {
      key: 'organisation_name',
      label: 'Organisation',
      sortable: true,
      render: (reg) => (
        <p className="font-medium text-gray-900">{reg.organisation_name}</p>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (reg) => (
        <p className="text-gray-900">{reg.category}</p>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (reg) => (
        <p className="text-gray-700">{reg.location}</p>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (reg) => new Date(reg.start_date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (reg) => {
        const statusColors = {
          pending_review: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          published: 'bg-blue-100 text-blue-700',
          draft: 'bg-gray-100 text-gray-700',
        };
        const statusLabel = {
          pending_review: 'Pending Review',
          approved: 'Approved',
          rejected: 'Rejected',
          published: 'Published',
          draft: 'Draft',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[reg.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {statusLabel[reg.status as keyof typeof statusLabel] || reg.status}
          </span>
        );
      },
    },
    {
      key: 'registration_date',
      label: 'Submitted',
      sortable: true,
      render: (reg) => new Date(reg.registration_date).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Camp Registrations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage seller camp submissions
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Camps</p>
            <p className="text-3xl font-bold text-gray-900">{registrations.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">
              {registrations.filter((r) => r.status === 'pending_review').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {registrations.filter((r) => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Published</p>
            <p className="text-3xl font-bold text-blue-600">
              {registrations.filter((r) => r.status === 'published').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredRegistrations}
          columns={columns}
          searchable
          searchPlaceholder="Search registrations..."
          emptyMessage="No registrations found."
        />
      </div>
    </DashboardLayout>
  );
}
