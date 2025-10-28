import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from '../common/ImageUpload';
import type { Database } from '../../lib/database.types';

type Organisation = Database['public']['Tables']['organisations']['Row'];
type OrganisationInsert = Database['public']['Tables']['organisations']['Insert'];

interface OrganisationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organisation?: Organisation;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function OrganisationFormModal({ isOpen, onClose, onSuccess, organisation }: OrganisationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'profile' | 'contact' | 'billing' | 'contract'>('basic');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    timezone: 'UTC',
    active: true,
    about: '',
    verified: false,
    response_rate: 0,
    response_time_hours: 24,
    total_camps_hosted: 0,
    established_year: null as number | null,
    billing_contact_name: '',
    billing_contact_email: '',
    billing_contact_phone: '',
    bank_account_details: {
      account_name: '',
      account_number: '',
      bank_name: '',
      routing_number: '',
    },
    tax_id: '',
    contract_start_date: '',
    contract_end_date: '',
    settings: {},
  });

  useEffect(() => {
    if (organisation) {
      setFormData({
        name: organisation.name,
        slug: organisation.slug,
        logo_url: organisation.logo_url || '',
        website: organisation.website || '',
        contact_email: organisation.contact_email,
        contact_phone: organisation.contact_phone || '',
        address: typeof organisation.address === 'object' && organisation.address !== null
          ? {
              street: (organisation.address as any).street || '',
              city: (organisation.address as any).city || '',
              state: (organisation.address as any).state || '',
              postal_code: (organisation.address as any).postal_code || '',
              country: (organisation.address as any).country || '',
            }
          : { street: '', city: '', state: '', postal_code: '', country: '' },
        timezone: organisation.timezone,
        active: organisation.active,
        about: (organisation as any).about || '',
        verified: (organisation as any).verified || false,
        response_rate: (organisation as any).response_rate || 0,
        response_time_hours: (organisation as any).response_time_hours || 24,
        total_camps_hosted: (organisation as any).total_camps_hosted || 0,
        established_year: (organisation as any).established_year || null,
        billing_contact_name: organisation.billing_contact_name || '',
        billing_contact_email: organisation.billing_contact_email || '',
        billing_contact_phone: organisation.billing_contact_phone || '',
        bank_account_details: typeof organisation.bank_account_details === 'object' && organisation.bank_account_details !== null
          ? {
              account_name: (organisation.bank_account_details as any).account_name || '',
              account_number: (organisation.bank_account_details as any).account_number || '',
              bank_name: (organisation.bank_account_details as any).bank_name || '',
              routing_number: (organisation.bank_account_details as any).routing_number || '',
            }
          : { account_name: '', account_number: '', bank_name: '', routing_number: '' },
        tax_id: organisation.tax_id || '',
        contract_start_date: organisation.contract_start_date || '',
        contract_end_date: organisation.contract_end_date || '',
        settings: (typeof organisation.settings === 'object' && organisation.settings !== null) ? organisation.settings : {},
      });
    }
  }, [organisation]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: organisation ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.slug || !formData.contact_email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const orgData: OrganisationInsert = {
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url || null,
        website: formData.website || null,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        address: formData.address,
        timezone: formData.timezone,
        active: formData.active,
        about: formData.about || null,
        verified: formData.verified,
        response_rate: formData.response_rate,
        response_time_hours: formData.response_time_hours,
        total_camps_hosted: formData.total_camps_hosted,
        established_year: formData.established_year,
        billing_contact_name: formData.billing_contact_name || null,
        billing_contact_email: formData.billing_contact_email || null,
        billing_contact_phone: formData.billing_contact_phone || null,
        bank_account_details: formData.bank_account_details,
        tax_id: formData.tax_id || null,
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        settings: formData.settings,
      };

      if (organisation) {
        const { error } = await supabase
          .from('organisations')
          .update(orgData)
          .eq('id', organisation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('organisations')
          .insert([orgData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving organisation:', error);
      let errorMessage = 'Failed to save organisation. ';

      if (error?.message?.includes('unique constraint') && error?.message?.includes('slug')) {
        errorMessage += 'This slug is already in use. Please choose a different name or modify the slug.';
      } else if (error?.message?.includes('permission')) {
        errorMessage += 'You do not have permission to perform this action.';
      } else if (error?.code === '42501') {
        errorMessage += 'Access denied by security policy.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              {organisation ? 'Edit Organisation' : 'Create New Organisation'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'profile', label: 'Profile & Verification' },
                { id: 'contact', label: 'Contact Details' },
                { id: 'billing', label: 'Billing Information' },
                { id: 'contract', label: 'Contract Details' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="International School of Singapore"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="international-school-singapore"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL-friendly identifier for the organisation
                  </p>
                </div>

                <div>
                  <ImageUpload
                    currentImageUrl={formData.logo_url}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                    onUploadError={(error) => setError(error)}
                    bucketName="logos"
                    folderPath="organisations"
                    maxSizeMB={5}
                    previewHeight="h-48"
                    label="Organisation Logo"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Upload your organisation logo. Recommended size: 400x200px
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.school.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone *
                  </label>
                  <select
                    required
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                    Organisation is active
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Organisation
                  </label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your organisation, mission, and values. This will be displayed on camp detail pages to build trust with parents."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Write a compelling description about your organisation (200-500 words recommended)
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="verified" className="text-sm font-semibold text-blue-900 cursor-pointer">
                      Verified Organisation
                    </label>
                    <p className="text-xs text-blue-700 mt-1">
                      Verified organisations display a trust badge on their camp listings
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={Math.round(formData.response_rate * 100)}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        response_rate: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) / 100
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="95"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Percentage of enquiries responded to (0-100%)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avg Response Time (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.response_time_hours}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        response_time_hours: Math.max(0, parseInt(e.target.value) || 24)
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="24"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Average time to respond to parent enquiries
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Camps Hosted
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.total_camps_hosted}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        total_camps_hosted: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Historical count of camps hosted (auto-calculated if left at 0)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      step="1"
                      value={formData.established_year || ''}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        const currentYear = new Date().getFullYear();
                        setFormData(prev => ({
                          ...prev,
                          established_year: e.target.value && year >= 1900 && year <= currentYear ? year : null
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={new Date().getFullYear().toString()}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Year your organisation was founded
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Trust & Credibility</h4>
                  <p className="text-xs text-green-700">
                    These fields help build trust with parents. A complete profile with high response rates and verification status significantly increases booking conversion rates.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@school.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Address</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Singapore"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.address.postal_code}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, postal_code: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, country: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Singapore"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.billing_contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_contact_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.billing_contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_contact_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="billing@school.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.billing_contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_contact_phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Bank Account Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account_details.account_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bank_account_details: { ...prev.bank_account_details, account_name: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="School Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account_details.account_number}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bank_account_details: { ...prev.bank_account_details, account_number: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account_details.bank_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bank_account_details: { ...prev.bank_account_details, bank_name: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Example Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account_details.routing_number}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bank_account_details: { ...prev.bank_account_details, routing_number: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12-3456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_start_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract End Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_end_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for ongoing contracts
                  </p>
                </div>
              </div>
            )}
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {organisation ? 'Update Organisation' : 'Create Organisation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
