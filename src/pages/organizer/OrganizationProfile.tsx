import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Building2, Mail, Phone, Globe, MapPin, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { OrganizerDashboardLayout } from '../../components/dashboard/OrganizerDashboardLayout';
import type { Database } from '../../lib/database.types';

type Organisation = Database['public']['Tables']['organisations']['Row'];

interface OrganizationFormData {
  name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  about: string;
  logo_url: string;
  business_type: string;
  established_year: number | null;
  company_registration_number: string;
  tax_id: string;
  vat_number: string;
  timezone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export default function OrganizationProfile() {
  const { organization, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    about: '',
    logo_url: '',
    business_type: '',
    established_year: null,
    company_registration_number: '',
    tax_id: '',
    vat_number: '',
    timezone: 'America/New_York',
    address: {},
  });

  useEffect(() => {
    if (!organization?.id) {
      setError('No organization found');
      setLoading(false);
      return;
    }

    loadOrganization();
  }, [organization?.id]);

  async function loadOrganization() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', organization!.id)
        .single();

      if (fetchError) throw fetchError;

      setFormData({
        name: data.name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        website: data.website || '',
        about: data.about || '',
        logo_url: data.logo_url || '',
        business_type: data.business_type || '',
        established_year: data.established_year,
        company_registration_number: data.company_registration_number || '',
        tax_id: data.tax_id || '',
        vat_number: data.vat_number || '',
        timezone: data.timezone || 'America/New_York',
        address: (data.address as any) || {},
      });
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Failed to load organization profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('organisations')
        .update({
          name: formData.name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          website: formData.website || null,
          about: formData.about || null,
          logo_url: formData.logo_url || null,
          business_type: formData.business_type || null,
          established_year: formData.established_year,
          company_registration_number: formData.company_registration_number || null,
          tax_id: formData.tax_id || null,
          vat_number: formData.vat_number || null,
          timezone: formData.timezone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization!.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating organization:', err);
      setError(err.message || 'Failed to update organization profile');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  if (loading) {
    return (
      <OrganizerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </OrganizerDashboardLayout>
    );
  }

  return (
    <OrganizerDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization information and settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline w-4 h-4 mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Organization
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                  rows={4}
                  placeholder="Tell parents about your organization, your mission, and what makes your camps special..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {formData.logo_url && (
                  <div className="mt-3">
                    <img
                      src={formData.logo_url}
                      alt="Organization logo preview"
                      className="w-32 h-32 object-contain border border-gray-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.address.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  value={formData.address.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.address.postal_code || ''}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.address.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => handleChange('business_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.established_year || ''}
                  onChange={(e) => handleChange('established_year', e.target.value ? parseInt(e.target.value) : null)}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  value={formData.company_registration_number}
                  onChange={(e) => handleChange('company_registration_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / EIN
                </label>
                <input
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT Number
                </label>
                <input
                  type="text"
                  value={formData.vat_number}
                  onChange={(e) => handleChange('vat_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Anchorage">Alaska Time</option>
                  <option value="Pacific/Honolulu">Hawaii Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Information (Read-only) */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Onboarding Status</p>
                <p className="font-medium text-gray-900 capitalize">
                  {organization?.onboarding_status || 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified</p>
                <p className="font-medium text-gray-900">
                  {organization?.verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Stripe Status</p>
                <p className="font-medium text-gray-900">
                  {organization?.stripe_account_id ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/organizer-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </OrganizerDashboardLayout>
  );
}
