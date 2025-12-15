import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Mail, Plus, Users, CheckCircle, Clock, XCircle, AlertCircle, Send, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateSecureToken } from '../../utils/crypto';
import toast from 'react-hot-toast';

interface CampOrganizerInvite {
  id: string;
  email: string;
  token: string;
  organisation_id: string;
  organisation_name?: string;
  invited_by: string;
  invited_by_name?: string;
  invited_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at: string | null;
  expires_at: string;
  profile_id: string | null;
  notes: string | null;
}

interface CampOrganizer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  organisation_id: string | null;
  organisation_name?: string;
  created_at: string;
  last_seen_at: string | null;
}

interface Organisation {
  id: string;
  name: string;
  contact_email: string;
  active: boolean;
}

export function CampOrganizerManagement() {
  const { profile } = useAuth();
  const [invites, setInvites] = useState<CampOrganizerInvite[]>([]);
  const [campOrganizers, setCampOrganizers] = useState<CampOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([
        loadInvites(),
        loadCampOrganizers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadInvites() {
    const { data, error } = await supabase
      .from('camp_organizer_invites')
      .select(`
        *,
        organisations:organisation_id (name),
        profiles:invited_by (first_name, last_name)
      `)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error loading invites:', error);
      return;
    }

    if (data) {
      const invitesWithNames = data.map(invite => ({
        ...invite,
        organisation_name: invite.organisations?.name || 'N/A',
        invited_by_name: invite.profiles
          ? `${invite.profiles.first_name} ${invite.profiles.last_name}`
          : 'Unknown'
      }));
      setInvites(invitesWithNames);
    }
  }

  async function loadCampOrganizers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        organisation_id,
        created_at,
        last_seen_at,
        organisations:organisation_id (name)
      `)
      .eq('role', 'camp_organizer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading camp organizers:', error);
      return;
    }

    if (data) {
      const organizersWithNames = data.map(org => ({
        ...org,
        organisation_name: org.organisations?.name || 'No Organisation'
      }));
      setCampOrganizers(organizersWithNames);
    }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      // Check if email already has a pending invite
      const { data: existingInvite } = await supabase
        .from('camp_organizer_invites')
        .select('id')
        .eq('email', inviteEmail)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast.error('This email already has a pending invitation');
        setSubmitting(false);
        return;
      }

      // Check if user already exists as camp organizer
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'camp_organizer')
        .limit(1)
        .single();

      if (existingUser) {
        toast.error('A camp organizer with this email already exists');
        setSubmitting(false);
        return;
      }

      // Generate secure token
      const token = generateSecureToken();

      // Create invite record
      const { data: invite, error } = await supabase
        .from('camp_organizer_invites')
        .insert({
          email: inviteEmail,
          token,
          invited_by: profile?.id,
          notes: inviteNotes || null
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via Edge Function
      const inviteUrl = `${window.location.origin}/signup?invite_token=${token}`;

      console.log('Attempting to send invitation email...', {
        email: inviteEmail,
        inviterName: `${profile?.first_name} ${profile?.last_name}`,
        token: token.substring(0, 10) + '...'
      });

      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-camp-organizer-invite',
          {
            body: {
              email: inviteEmail,
              token,
              inviterName: `${profile?.first_name} ${profile?.last_name}`,
              organisationName: null // No organisation for now
            }
          }
        );

        console.log('Edge function response:', { emailData, emailError });

        if (emailError) {
          console.error('Failed to send invitation email:', emailError);
          toast.error(
            <div>
              <p>Invite created but email failed to send</p>
              <p className="text-xs mt-1">Error: {emailError.message || 'Unknown error'}</p>
              <p className="text-xs mt-1">Link: {inviteUrl}</p>
            </div>,
            { duration: 10000 }
          );
        } else if (emailData?.success) {
          console.log('Email sent successfully:', emailData);
          toast.success(
            <div>
              <p>Invitation sent successfully!</p>
              <p className="text-xs mt-1">Email sent to {inviteEmail}</p>
            </div>,
            { duration: 6000 }
          );
        } else {
          console.warn('Email may not have sent. Response:', emailData);
          toast.warning(
            <div>
              <p>Invite created - email status unknown</p>
              <p className="text-xs mt-1">Link: {inviteUrl}</p>
            </div>,
            { duration: 8000 }
          );
        }
      } catch (emailErr: any) {
        console.error('Error sending email (exception):', emailErr);
        toast.warning(
          <div>
            <p>Invite created but email failed to send</p>
            <p className="text-xs mt-1">Error: {emailErr.message || 'Unknown error'}</p>
            <p className="text-xs mt-1">Link: {inviteUrl}</p>
          </div>,
          { duration: 10000 }
        );
      }

      // Reset form
      setInviteEmail('');
      setInviteNotes('');
      setShowInviteModal(false);

      // Reload invites
      loadInvites();
    } catch (error: any) {
      console.error('Error creating invite:', error);
      toast.error(error.message || 'Failed to create invite');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('camp_organizer_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invitation revoked');
      loadInvites();
    } catch (error: any) {
      console.error('Error revoking invite:', error);
      toast.error('Failed to revoke invitation');
    }
  }

  async function handleResendInvite(invite: CampOrganizerInvite) {
    try {
      // Generate new token and extend expiry
      const newToken = generateSecureToken();
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);

      const { error } = await supabase
        .from('camp_organizer_invites')
        .update({
          token: newToken,
          expires_at: newExpiry.toISOString(),
          status: 'pending'
        })
        .eq('id', invite.id);

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/signup?invite_token=${newToken}`;

      toast.success(
        <div>
          <p>Invitation resent!</p>
          <p className="text-xs mt-1">New link: {inviteUrl}</p>
        </div>,
        { duration: 6000 }
      );

      loadInvites();
    } catch (error: any) {
      console.error('Error resending invite:', error);
      toast.error('Failed to resend invitation');
    }
  }

  async function handleDeleteInvite(inviteId: string) {
    if (!confirm('Are you sure you want to delete this invitation? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('camp_organizer_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invitation deleted');
      loadInvites();
    } catch (error: any) {
      console.error('Error deleting invite:', error);
      toast.error('Failed to delete invitation');
    }
  }

  function copyInviteLink(token: string) {
    const inviteUrl = `${window.location.origin}/signup?invite_token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  }

  const filteredInvites = invites.filter(invite => {
    const matchesSearch =
      invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.organisation_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invite.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredOrganizers = campOrganizers.filter(org =>
    `${org.first_name} ${org.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.organisation_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusBadge(status: string) {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Accepted' },
      expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: 'Expired' },
      revoked: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Revoked' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading camp organizer data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Camp Organizer Management</h1>
          <p className="text-gray-600">Manage invitations and camp organizer accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Organizers</p>
                <p className="text-2xl font-bold text-gray-900">{campOrganizers.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {invites.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Invites</p>
                <p className="text-2xl font-bold text-green-600">
                  {invites.filter(i => i.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired Invites</p>
                <p className="text-2xl font-bold text-gray-600">
                  {invites.filter(i => i.status === 'expired').length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by email or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Invite Camp Organizer
              </button>
            </div>
          </div>
        </div>

        {/* Invitations Table */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Invitations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No invitations found</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invite.organisation_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invite.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{invite.invited_by_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(invite.invited_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {invite.status === 'pending' && (
                            <>
                              <button
                                onClick={() => copyInviteLink(invite.token)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Copy invite link"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResendInvite(invite)}
                                className="text-green-600 hover:text-green-900"
                                title="Resend invite"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRevokeInvite(invite.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Revoke invite"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Delete invite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Camp Organizers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Camp Organizers</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No camp organizers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((organizer) => (
                    <tr key={organizer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {organizer.first_name} {organizer.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{organizer.organisation_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(organizer.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {organizer.last_seen_at
                            ? new Date(organizer.last_seen_at).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Camp Organizer</h2>

              <form onSubmit={handleCreateInvite}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="organizer@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={inviteNotes}
                      onChange={(e) => setInviteNotes(e.target.value)}
                      placeholder="Add any notes about this invitation..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      The invitation will expire after 7 days. The organizer will receive an email
                      with a link to complete their registration.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
