import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Building2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { updateOnboardingStep } from '../../services/onboardingService';
import { getPromotionalOfferById, formatOfferDisplay } from '../../services/promotionalOfferService';
import { getDashboardRoute } from '../../utils/navigation';
import toast from 'react-hot-toast';

export default function OrganizationSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [offerText, setOfferText] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (profile.role !== 'camp_organizer') {
      navigate(getDashboardRoute(profile.role));
      return;
    }

    loadOrganization();
  }, [user, profile, navigate]);

  async function loadOrganization() {
    if (!profile?.organisation_id) {
      setLoadingOrg(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', profile.organisation_id)
        .single();

      if (error) throw error;

      if (data) {
        setOrganization(data);
        setOrganizationName(data.name || '');
        setContactEmail(data.contact_email || user?.email || '');
        setContactPhone(data.contact_phone || '');
        setWebsite(data.website || '');

        // Load promotional offer if enrolled
        if (data.promotional_offer_id) {
          const offer = await getPromotionalOfferById(data.promotional_offer_id);
          if (offer) {
            setOfferText(formatOfferDisplay(offer));
          }
        }
      }
    } catch (err) {
      console.error('Error loading organization:', err);
    } finally {
      setLoadingOrg(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!contactEmail.trim()) {
      setError('Contact email is required');
      return;
    }

    setLoading(true);

    try {
      if (!profile?.organisation_id) {
        throw new Error('No organization found');
      }

      // Update organization with minimal info
      const { error: updateError } = await supabase
        .from('organisations')
        .update({
          name: organizationName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim() || null,
          website: website.trim() || null,
          onboarding_status: 'active', // Ensure it's active
        })
        .eq('id', profile.organisation_id);

      if (updateError) throw updateError;

      // Update onboarding step
      await updateOnboardingStep(user!.id, 'organization');

      toast.success('Organization details saved!');

      // Redirect to first camp wizard
      setTimeout(() => {
        navigate('/onboarding/first-camp');
      }, 500);

    } catch (err: any) {
      console.error('Error updating organization:', err);
      setError(err.message || 'Failed to save organization details');
      setLoading(false);
    }
  }

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="w-20 h-1 bg-pink-600"></div>
            <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="w-20 h-1 bg-gray-300"></div>
            <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
              3
            </div>
          </div>
          <div className="text-center text-sm text-gray-600">
            Step 2 of 3: Organization Details
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Tell Us About Your Organization
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Just the essentials for now — you can add more details later
          </p>

          {/* Promotional Offer Badge */}
          {offerText && (
            <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-pink-50 border-2 border-pink-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-pink-900 mb-1">You're Enrolled!</h3>
                  <p className="text-sm text-pink-800">
                    {offerText} This offer will automatically apply to your bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Organization Name - Required */}
            <div>
              <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                placeholder="Summer Adventure Camps"
              />
              <p className="mt-1 text-xs text-gray-500">This is what parents will see</p>
            </div>

            {/* Contact Email - Required */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder="contact@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">Where parents can reach you</p>
            </div>

            {/* Contact Phone - Optional */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Website - Optional */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="https://www.example.com"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> You can add your logo, detailed description, address, and other
                information later from your dashboard.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  Continue to Create Your First Camp
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Next: Create your first camp listing (10 minutes)
          </p>
        </div>
      </div>
    </div>
  );
}
