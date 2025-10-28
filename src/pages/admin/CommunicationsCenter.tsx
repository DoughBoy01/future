import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Send, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type Communication = Database['public']['Tables']['communications']['Row'];

export function CommunicationsCenter() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, []);

  async function loadCommunications() {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Communication>[] = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (comm) => (
        <div>
          <p className="font-medium text-gray-900">{comm.subject || 'No Subject'}</p>
          <p className="text-xs text-gray-500 capitalize">{comm.type}</p>
        </div>
      ),
    },
    {
      key: 'recipient_type',
      label: 'Recipients',
      sortable: true,
      render: (comm) => {
        const recipientLabels = {
          all_parents: 'All Parents',
          camp_specific: 'Camp Specific',
          individual: 'Individual',
        };
        return (
          <span className="text-gray-900">
            {recipientLabels[comm.recipient_type]}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (comm) => {
        const statusColors = {
          draft: 'bg-gray-100 text-gray-700',
          scheduled: 'bg-blue-100 text-blue-700',
          sent: 'bg-green-100 text-green-700',
          failed: 'bg-red-100 text-red-700',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[comm.status]
            }`}
          >
            {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'scheduled_for',
      label: 'Scheduled',
      sortable: true,
      render: (comm) =>
        comm.scheduled_for
          ? new Date(comm.scheduled_for).toLocaleString()
          : 'Not scheduled',
    },
    {
      key: 'sent_at',
      label: 'Sent',
      sortable: true,
      render: (comm) =>
        comm.sent_at ? new Date(comm.sent_at).toLocaleString() : '-',
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
            <h2 className="text-2xl font-bold text-gray-900">Communications Center</h2>
            <p className="mt-1 text-sm text-gray-600">
              Send and manage emails, SMS, and announcements
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            New Communication
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{communications.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Sent</p>
            <p className="text-3xl font-bold text-green-600">
              {communications.filter((c) => c.status === 'sent').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600">
              {communications.filter((c) => c.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-gray-600">
              {communications.filter((c) => c.status === 'draft').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Send</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
              <Send className="w-5 h-5" />
              Send Email
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
              <Send className="w-5 h-5" />
              Send SMS
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">
              <Send className="w-5 h-5" />
              Post Announcement
            </button>
          </div>
        </div>

        <DataTable
          data={communications}
          columns={columns}
          searchable
          searchPlaceholder="Search communications..."
          emptyMessage="No communications found. Create your first message to get started."
        />
      </div>
    </DashboardLayout>
  );
}
