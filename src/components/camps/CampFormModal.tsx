import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getEffectiveCommissionRate, getOrganizationWithRate } from '../../services/commissionRateService';
import { MediaUploadManager } from './MediaUploadManager';
import type { Database } from '../../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];
type CampInsert = Database['public']['Tables']['camps']['Insert'];
type Organisation = Database['public']['Tables']['organisations']['Row'];
type Category = Database['public']['Tables']['camp_categories']['Row'];

interface CampFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  camp?: Camp;
  schoolId: string;
}

export function CampFormModal({ isOpen, onClose, onSuccess, camp, schoolId }: CampFormModalProps) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'pricing' | 'media' | 'content' | 'policies'>('basic');
  const [effectiveCommissionRate, setEffectiveCommissionRate] = useState<number | null>(null);
  const [loadingCommissionRate, setLoadingCommissionRate] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    categories?: string;
    currency?: string;
    price?: string;
    dates?: string;
    capacity?: string;
  }>({});

  type CategoryType = 'sports' | 'arts' | 'stem' | 'language' | 'adventure' | 'general' | 'academic' | 'creative';
  type StatusType = 'draft' | 'published' | 'pending_review' | 'requires_changes' | 'approved' | 'unpublished' | 'archived' | 'rejected' | 'full' | 'cancelled' | 'completed';

  const [formData, setFormData] = useState({
    organisation_id: '',
    name: '',
    slug: '',
    description: '',
    category: 'general' as CategoryType,
    age_min: 5,
    age_max: 12,
    grade_min: '',
    grade_max: '',
    start_date: '',
    end_date: '',
    location: '',
    camp_address: '',
    capacity: 20,
    price: 0,
    currency: 'USD',
    early_bird_price: null as number | null,
    early_bird_deadline: null as string | null,
    payment_link: '',
    featured_image_url: '',
    video_url: '',
    what_to_bring: '',
    requirements: '',
    status: 'draft' as StatusType,
    featured: false,
    enquiries_enabled: true,
    highlights: [] as string[],
    amenities: [] as Array<{category: string; items: string[]}>,
    faqs: [] as Array<{question: string; answer: string}>,
    cancellation_policy: '',
    refund_policy: '',
    safety_protocols: '',
    insurance_info: '',
  });

  const [mediaData, setMediaData] = useState<{
    images: Array<{ url: string; caption?: string; alt_text?: string; display_order: number }>;
    videos: Array<{ url: string; title?: string; description?: string; thumbnail?: string; type: 'youtube' | 'vimeo' | 'direct'; display_order: number }>;
  }>({
    images: [],
    videos: []
  });

  useEffect(() => {
    loadOrganisations();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('camp_categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true});

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadCampCategories(campId: string) {
    try {
      const { data, error } = await supabase
        .from('camp_category_assignments')
        .select('category_id')
        .eq('camp_id', campId);

      if (error) throw error;
      setSelectedCategoryIds((data || []).map(d => d.category_id));
    } catch (error) {
      console.error('Error loading camp categories:', error);
    }
  }

  useEffect(() => {
    if (camp) {
      loadCampCategories(camp.id);
      setFormData({
        organisation_id: camp.organisation_id,
        name: camp.name,
        slug: camp.slug,
        description: camp.description || '',
        category: camp.category,
        age_min: camp.age_min,
        age_max: camp.age_max,
        grade_min: camp.grade_min || '',
        grade_max: camp.grade_max || '',
        start_date: camp.start_date,
        end_date: camp.end_date,
        location: camp.location,
        camp_address: (camp as any).camp_address || '',
        capacity: camp.capacity,
        price: camp.price,
        currency: camp.currency,
        early_bird_price: camp.early_bird_price,
        early_bird_deadline: camp.early_bird_deadline,
        payment_link: (camp as any).payment_link || '',
        featured_image_url: camp.featured_image_url || '',
        video_url: (camp as any).video_url || '',
        what_to_bring: camp.what_to_bring || '',
        requirements: camp.requirements || '',
        status: camp.status,
        featured: camp.featured,
        enquiries_enabled: (camp as any).enquiries_enabled ?? true,
        highlights: Array.isArray((camp as any).highlights) ? (camp as any).highlights : [],
        amenities: Array.isArray((camp as any).amenities) ? (camp as any).amenities : [],
        faqs: Array.isArray((camp as any).faqs) ? (camp as any).faqs : [],
        cancellation_policy: (camp as any).cancellation_policy || '',
        refund_policy: (camp as any).refund_policy || '',
        safety_protocols: (camp as any).safety_protocols || '',
        insurance_info: (camp as any).insurance_info || '',
      });

      const existingImages = Array.isArray((camp as any).image_metadata)
        ? (camp as any).image_metadata
        : (Array.isArray((camp as any).gallery_urls) ? (camp as any).gallery_urls.map((url: string, idx: number) => ({
            url,
            caption: '',
            alt_text: '',
            display_order: idx
          })) : []);

      const existingVideos = Array.isArray((camp as any).video_metadata)
        ? (camp as any).video_metadata
        : [];

      setMediaData({
        images: existingImages,
        videos: existingVideos
      });
    } else if (schoolId) {
      setFormData(prev => ({ ...prev, organisation_id: schoolId }));
    } else if (profile?.organisation_id) {
      setFormData(prev => ({ ...prev, organisation_id: profile.organisation_id! }));
    } else if (organisations.length === 1) {
      setFormData(prev => ({ ...prev, organisation_id: organisations[0].id }));
    }
  }, [camp, schoolId, organisations, profile]);

  // Fetch effective commission rate
  useEffect(() => {
    const fetchCommissionRate = async () => {
      setLoadingCommissionRate(true);
      try {
        if (camp?.id) {
          // For existing camp, get the effective rate
          const rate = await getEffectiveCommissionRate(camp.id);
          setEffectiveCommissionRate(rate);
        } else if (formData.organisation_id) {
          // For new camp, get organization's default rate
          const org = await getOrganizationWithRate(formData.organisation_id);
          setEffectiveCommissionRate(org.default_commission_rate || 0.15);
        } else {
          // No organization selected yet
          setEffectiveCommissionRate(null);
        }
      } catch (error) {
        console.error('Error fetching commission rate:', error);
        setEffectiveCommissionRate(0.15); // Fallback to default
      } finally {
        setLoadingCommissionRate(false);
      }
    };

    fetchCommissionRate();
  }, [camp?.id, formData.organisation_id]);

  async function loadOrganisations() {
    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setOrganisations(data || []);
    } catch (error) {
      console.error('Error loading organisations:', error);
    }
  }

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
      slug: generateSlug(name),
    }));
  };

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    // Category validation
    if (selectedCategoryIds.length === 0) {
      errors.categories = 'Please select at least one category';
    }

    // Currency validation
    if (!formData.currency || formData.currency.trim() === '') {
      errors.currency = 'Currency is required';
    }

    // Price validation
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.dates = 'End date must be after start date';
      }
    }

    // Capacity validation
    if (formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Run validation
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting');
      return;
    }

    if (!formData.organisation_id) {
      setError('Please select an organisation for this camp');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one category for this camp');
      return;
    }

    // Auto-resubmit: If editing a camp that requires changes, set to 'published'
    const isEditingRequiresChanges = camp?.status === 'requires_changes';
    const finalStatus = (isEditingRequiresChanges && formData.status === 'requires_changes')
      ? 'published'
      : formData.status;

    // Validate Stripe connection if trying to publish
    if (formData.status === 'published' || finalStatus === 'published') {
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .select('stripe_account_id, payout_enabled, temp_charges_enabled, restrictions_active')
        .eq('id', formData.organisation_id)
        .single();

      if (orgError) {
        console.error('Error checking Stripe status:', orgError);
        setError('Failed to verify payment settings. Please try again.');
        return;
      }

      // Must have Stripe account
      if (!org?.stripe_account_id) {
        setError('Stripe connection required to publish camps. Please connect your Stripe account in Payment Settings to go live and start accepting bookings.');
        return;
      }

      // Check for restrictions from Stripe
      if (org.restrictions_active) {
        setError('Cannot publish: Stripe account is restricted. Please complete your onboarding in Payment Settings to resolve restrictions and enable publishing.');
        return;
      }

      // Allow if full onboarding complete OR deferred mode with temp charges
      if (!org.payout_enabled && !org.temp_charges_enabled) {
        setError('Stripe connection required to publish camps. Please complete onboarding in Payment Settings or choose Quick Start to publish immediately.');
        return;
      }
    }

    setLoading(true);

    try {
      const galleryUrls = mediaData.images.map(img => img.url);

      const campData: CampInsert = {
        organisation_id: formData.organisation_id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        category: formData.category,
        age_min: formData.age_min,
        age_max: formData.age_max,
        grade_min: formData.grade_min || null,
        grade_max: formData.grade_max || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location,
        camp_address: formData.camp_address || null,
        capacity: formData.capacity,
        price: formData.price,
        currency: formData.currency,
        early_bird_price: formData.early_bird_price,
        early_bird_deadline: formData.early_bird_deadline,
        payment_link: formData.payment_link || null,
        featured_image_url: formData.featured_image_url || null,
        video_url: formData.video_url || null,
        gallery_urls: galleryUrls as any,
        image_metadata: mediaData.images as any,
        video_urls: mediaData.videos.map(v => v.url) as any,
        video_metadata: mediaData.videos as any,
        what_to_bring: formData.what_to_bring || null,
        requirements: formData.requirements || null,
        status: finalStatus,
        featured: formData.featured,
        enquiries_enabled: formData.enquiries_enabled,
        highlights: formData.highlights.length > 0 ? formData.highlights : null,
        amenities: formData.amenities.length > 0 ? formData.amenities : null,
        faqs: formData.faqs.length > 0 ? formData.faqs : null,
        cancellation_policy: formData.cancellation_policy || null,
        refund_policy: formData.refund_policy || null,
        safety_protocols: formData.safety_protocols || null,
        insurance_info: formData.insurance_info || null,
        schedule: {},
      } as any;

      let campId = camp?.id;

      if (camp) {
        const { error } = await supabase
          .from('camps')
          .update(campData)
          .eq('id', camp.id);

        if (error) {
          console.error('Error updating camp:', error);
          throw error;
        }

        await supabase
          .from('camp_category_assignments')
          .delete()
          .eq('camp_id', camp.id);
      } else {
        // Creating a new camp - include created_by field
        const newCampData = {
          ...campData,
          created_by: user!.id
        };

        const { data, error } = await supabase
          .from('camps')
          .insert([newCampData])
          .select()
          .single();

        if (error) {
          console.error('Error creating camp:', error);
          throw error;
        }
        campId = data.id;
      }

      if (campId) {
        const categoryAssignments = selectedCategoryIds.map(categoryId => ({
          camp_id: campId,
          category_id: categoryId
        }));

        const { error: assignmentError } = await supabase
          .from('camp_category_assignments')
          .insert(categoryAssignments);

        if (assignmentError) {
          console.error('Error assigning categories:', assignmentError);
          throw assignmentError;
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving camp:', error);
      let errorMessage = 'Failed to save camp. ';

      // Database trigger errors for Stripe validation
      if (error?.message?.includes('Stripe account not connected')) {
        errorMessage = 'Cannot publish camp: Stripe account not connected. Please visit Payment Settings to connect your Stripe account before publishing camps.';
      } else if (error?.message?.includes('Stripe payouts not enabled')) {
        errorMessage = 'Cannot publish camp: Stripe payouts not enabled. Please complete your Stripe account setup in Payment Settings.';
      } else if (error?.message?.includes('permission')) {
        errorMessage += 'You do not have permission to perform this action. ';
      } else if (error?.message?.includes('violates')) {
        errorMessage += 'Invalid data provided. ';
      } else if (error?.code === '42501') {
        errorMessage += 'Access denied by security policy. ';
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
              {camp ? 'Edit Camp' : 'Create New Camp'}
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
                { id: 'details', label: 'Details' },
                { id: 'content', label: 'Content' },
                { id: 'policies', label: 'Policies' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'media', label: 'Media' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-600 text-pink-600'
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
                {profile?.role === 'super_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organisation (Camp Owner) *
                    </label>
                    <select
                      required
                      value={formData.organisation_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, organisation_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Select an organisation...</option>
                      {organisations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Summer Adventure Camp"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="summer-adventure-camp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe the camp experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryIds(prev =>
                              prev.includes(category.id)
                                ? prev.filter(id => id !== category.id)
                                : [...prev, category.id]
                            );
                            // Clear error when user makes selection
                            if (fieldErrors.categories) {
                              setFieldErrors(prev => ({ ...prev, categories: undefined }));
                            }
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                            />
                            <span className={`text-sm font-medium ${isSelected ? 'text-pink-900' : 'text-gray-700'}`}>
                              {category.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.categories && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{fieldErrors.categories}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="School Campus"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    General location descriptor (e.g., "Tokyo - Japan", "Borneo")
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Address
                  </label>
                  <input
                    type="text"
                    value={formData.camp_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, camp_address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="123 Main Street, Building A, Tokyo 100-0001"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Complete physical address for the camp venue (optional)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {fieldErrors.dates && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.dates}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="3"
                      max="18"
                      value={formData.age_min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData(prev => ({ ...prev, age_min: isNaN(val) ? prev.age_min : val }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="3"
                      max="18"
                      value={formData.age_max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData(prev => ({ ...prev, age_max: isNaN(val) ? prev.age_max : val }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData(prev => ({ ...prev, capacity: isNaN(val) ? prev.capacity : val }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {fieldErrors.capacity && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.capacity}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What to Bring
                  </label>
                  <textarea
                    value={formData.what_to_bring}
                    onChange={(e) => setFormData(prev => ({ ...prev, what_to_bring: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="List items children should bring..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Any prerequisites or requirements..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Camp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enquiries_enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enquiries_enabled: e.target.checked }))}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Enquiries</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormData(prev => ({ ...prev, price: isNaN(val) ? prev.price : val }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    {fieldErrors.price && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.price}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <optgroup label="Asian Currencies">
                        <option value="SGD">SGD - Singapore Dollar</option>
                        <option value="MYR">MYR - Malaysian Ringgit</option>
                        <option value="HKD">HKD - Hong Kong Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="THB">THB - Thai Baht</option>
                        <option value="KRW">KRW - South Korean Won</option>
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                        <option value="PHP">PHP - Philippine Peso</option>
                        <option value="VND">VND - Vietnamese Dong</option>
                        <option value="TWD">TWD - Taiwan Dollar</option>
                        <option value="INR">INR - Indian Rupee</option>
                      </optgroup>
                    </select>
                    {fieldErrors.currency && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.currency}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Early Bird Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.early_bird_price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, early_bird_price: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Early Bird Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.early_bird_deadline || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, early_bird_deadline: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Commission Rate
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-64 text-left z-20 pointer-events-none">
                        Commission rates are set by the platform. This rate determines the platform fee deducted from each booking.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={effectiveCommissionRate !== null
                        ? `${(effectiveCommissionRate * 100).toFixed(2)}%`
                        : loadingCommissionRate ? 'Loading...' : 'Select organization first'}
                      readOnly
                      aria-readonly="true"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {effectiveCommissionRate !== null && formData.price > 0 && (
                    <div className="mt-3 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                      <p className="text-sm text-pink-900 font-medium mb-2">Commission Preview</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-pink-700">Booking Price:</p>
                          <p className="font-semibold text-pink-900">
                            {formData.currency} {formData.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-pink-700">Platform Fee ({(effectiveCommissionRate * 100).toFixed(1)}%):</p>
                          <p className="font-semibold text-pink-900">
                            {formData.currency} {(formData.price * effectiveCommissionRate).toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-pink-200">
                          <p className="text-pink-700">You Receive:</p>
                          <p className="font-bold text-lg text-pink-900">
                            {formData.currency} {(formData.price * (1 - effectiveCommissionRate)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Link
                  </label>
                  <input
                    type="url"
                    value={formData.payment_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_link: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://payment.example.com/camp-123"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    External payment URL for this camp (e.g., Stripe, PayPal, etc.)
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Highlights
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Add key selling points (one per line)</p>
                  <textarea
                    value={formData.highlights.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      highlights: e.target.value.split('\n').filter(h => h.trim())
                    }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Small group sizes (max 15 per instructor)&#10;Daily photo updates for parents&#10;Experienced, background-checked instructors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities (JSON format)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Enter amenities in JSON format with categories</p>
                  <textarea
                    value={JSON.stringify(formData.amenities, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData(prev => ({ ...prev, amenities: Array.isArray(parsed) ? parsed : [] }));
                      } catch (err) {
                      }
                    }}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                    placeholder='[{"category": "Facilities", "items": ["Swimming pool", "Air conditioning"]}, {"category": "Safety", "items": ["First aid certified staff"]}]'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAQs (JSON format)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Enter FAQs in JSON format with questions and answers</p>
                  <textarea
                    value={JSON.stringify(formData.faqs, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData(prev => ({ ...prev, faqs: Array.isArray(parsed) ? parsed : [] }));
                      } catch (err) {
                      }
                    }}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                    placeholder='[{"question": "What is the daily schedule?", "answer": "Camp runs from 9 AM to 4 PM..."}]'
                  />
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <textarea
                    value={formData.cancellation_policy}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe your cancellation policy and deadlines..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    value={formData.refund_policy}
                    onChange={(e) => setFormData(prev => ({ ...prev, refund_policy: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe your refund process and terms..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Protocols
                  </label>
                  <textarea
                    value={formData.safety_protocols}
                    onChange={(e) => setFormData(prev => ({ ...prev, safety_protocols: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Detail your safety measures and certifications..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Information
                  </label>
                  <textarea
                    value={formData.insurance_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, insurance_info: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe insurance coverage provided..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://images.pexels.com/..."
                  />
                  {formData.featured_image_url && (
                    <div className="mt-4">
                      <img
                        src={formData.featured_image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This will be the main hero image for the camp
                  </p>
                </div>

                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery & Videos</h3>
                  <MediaUploadManager
                    images={mediaData.images}
                    videos={mediaData.videos}
                    onImagesChange={(images) => setMediaData(prev => ({ ...prev, images }))}
                    onVideosChange={(videos) => setMediaData(prev => ({ ...prev, videos }))}
                    maxImages={10}
                    maxVideos={5}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Upload high-quality images and videos to showcase your camp.
                    Images: 1920x1080px recommended. Videos: Upload files or paste YouTube/Vimeo URLs.
                  </p>
                </div>
              </div>
            )}
          </form>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                {profile?.role === 'super_admin' && (
                  <>
                    <option value="pending_review">Pending Review</option>
                    <option value="requires_changes">Requires Changes</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="archived">Archived</option>
                    <option value="rejected">Rejected</option>
                    <option value="full">Full</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </>
                )}
                {profile?.role === 'camp_organizer' && (
                  <>
                    <option value="pending_review">Request Approval</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex gap-3">
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
                className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {camp ? 'Update Camp' : 'Create Camp'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
