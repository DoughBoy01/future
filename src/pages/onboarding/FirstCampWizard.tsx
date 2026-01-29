import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Save,
} from 'lucide-react';
import { updateOnboardingStep, completeOnboarding } from '../../services/onboardingService';
import { getDashboardRoute } from '../../utils/navigation';
import { getSystemDefault } from '../../services/systemSettingsService';
import { getOrganizationWithRate } from '../../services/commissionRateService';
import { usePromotionalOffer } from '../../hooks/usePromotionalOffer';
import { formatRatePercentage } from '../../utils/commissionRateFormatting';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4 | 5;

export default function FirstCampWizard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(0.15);

  const { offer, isActive: hasPromoOffer, bookingsRemaining } = usePromotionalOffer(
    profile?.organisation_id
  );

  // Step 1: Camp Basics
  const [campName, setCampName] = useState('');
  const [category, setCategory] = useState('general');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ageMin, setAgeMin] = useState(6);
  const [ageMax, setAgeMax] = useState(12);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(20);

  // Step 2: Pricing
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [earlyBirdPrice, setEarlyBirdPrice] = useState('');
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState('');

  // Step 3: Description
  const [description, setDescription] = useState('');
  const [whatToBring, setWhatToBring] = useState('');

  // Step 4: Media
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');

  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (profile.role !== 'camp_organizer') {
      navigate(getDashboardRoute(profile.role));
      return;
    }

    // Update onboarding step
    updateOnboardingStep(user.id, 'first_camp').catch(console.error);

    // Fetch commission rate
    async function fetchOrgRate() {
      if (profile.organisation_id) {
        try {
          const org = await getOrganizationWithRate(profile.organisation_id);
          setCommissionRate(org.default_commission_rate);
        } catch (err) {
          console.error('Error fetching org commission rate:', err);
          // Keep default 0.15
        }
      } else {
        try {
          const systemDefault = await getSystemDefault();
          setCommissionRate(systemDefault);
        } catch (err) {
          console.error('Error fetching system default rate:', err);
          // Keep default 0.15
        }
      }
    }
    fetchOrgRate();
  }, [user, profile, navigate]);

  const validateStep = (step: Step): boolean => {
    setError('');

    switch (step) {
      case 1:
        if (!campName.trim()) {
          setError('Camp name is required');
          return false;
        }
        if (!startDate || !endDate) {
          setError('Start and end dates are required');
          return false;
        }
        if (new Date(startDate) >= new Date(endDate)) {
          setError('End date must be after start date');
          return false;
        }
        if (!location.trim()) {
          setError('Location is required');
          return false;
        }
        if (capacity < 1) {
          setError('Capacity must be at least 1');
          return false;
        }
        return true;

      case 2:
        if (!price || parseFloat(price) <= 0) {
          setError('Price is required and must be greater than 0');
          return false;
        }
        if (earlyBirdPrice && parseFloat(earlyBirdPrice) >= parseFloat(price)) {
          setError('Early bird price must be less than regular price');
          return false;
        }
        if (earlyBirdPrice && !earlyBirdDeadline) {
          setError('Early bird deadline is required when setting early bird price');
          return false;
        }
        return true;

      case 3:
        if (!description.trim()) {
          setError('Camp description is required');
          return false;
        }
        if (description.trim().length < 50) {
          setError('Description should be at least 50 characters');
          return false;
        }
        return true;

      case 4:
        // Media is optional for first camp
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    if (!profile?.organisation_id) {
      toast.error('Organization not found');
      return;
    }

    setLoading(true);

    try {
      const campData: any = {
        organisation_id: profile.organisation_id,
        name: campName,
        category,
        start_date: startDate,
        end_date: endDate,
        age_min: ageMin,
        age_max: ageMax,
        location,
        capacity,
        price: parseFloat(price),
        currency,
        description,
        status: 'draft',
        created_by: user!.id,
      };

      if (earlyBirdPrice) {
        campData.early_bird_price = parseFloat(earlyBirdPrice);
      }
      if (earlyBirdDeadline) {
        campData.early_bird_deadline = earlyBirdDeadline;
      }
      if (whatToBring) {
        campData.what_to_bring = whatToBring;
      }
      if (featuredImageUrl) {
        campData.featured_image_url = featuredImageUrl;
      }

      const { error } = await supabase.from('camps').insert(campData);

      if (error) throw error;

      toast.success('Camp saved as draft!');
      navigate('/organizer-dashboard');
    } catch (err: any) {
      console.error('Error saving draft:', err);
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateStep(currentStep)) return;
    if (!profile?.organisation_id) {
      toast.error('Organization not found');
      return;
    }

    setLoading(true);

    try {
      const campData: any = {
        organisation_id: profile.organisation_id,
        name: campName,
        category,
        start_date: startDate,
        end_date: endDate,
        age_min: ageMin,
        age_max: ageMax,
        location,
        capacity,
        price: parseFloat(price),
        currency,
        description,
        status: 'pending_review', // Submit for admin approval
        created_by: user!.id,
        submitted_for_review_at: new Date().toISOString(),
      };

      if (earlyBirdPrice) {
        campData.early_bird_price = parseFloat(earlyBirdPrice);
      }
      if (earlyBirdDeadline) {
        campData.early_bird_deadline = earlyBirdDeadline;
      }
      if (whatToBring) {
        campData.what_to_bring = whatToBring;
      }
      if (featuredImageUrl) {
        campData.featured_image_url = featuredImageUrl;
      }

      const { error } = await supabase.from('camps').insert(campData);

      if (error) throw error;

      // Don't mark onboarding complete yet - will complete on Stripe step
      toast.success('Camp submitted for review! One more step: Set up payments');

      // Redirect to Stripe connection page
      setTimeout(() => {
        navigate('/onboarding/stripe-connect');
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting camp:', err);
      setError(err.message || 'Failed to submit camp');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Camp Basics</h2>
                <p className="text-gray-600">Essential information about your camp</p>
              </div>
            </div>

            {/* Camp Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Camp Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                placeholder="Summer Adventure Camp 2026"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              >
                <option value="general">General</option>
                <option value="sports">Sports & Athletics</option>
                <option value="arts">Arts & Crafts</option>
                <option value="stem">STEM & Technology</option>
                <option value="language">Language & Culture</option>
                <option value="adventure">Outdoor & Adventure</option>
                <option value="academic">Academic</option>
                <option value="creative">Creative Arts</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={ageMin}
                  onChange={(e) => setAgeMin(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={ageMax}
                  onChange={(e) => setAgeMax(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder="San Francisco, CA"
              />
              <p className="mt-1 text-xs text-gray-500">City and state or general area</p>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacity (Number of Spots) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
                <p className="text-gray-600">Set your camp pricing</p>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Camper <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                  placeholder="299.00"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            {/* Early Bird Pricing */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Early Bird Pricing <span className="text-gray-500 font-normal">(Optional)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Early Bird Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={earlyBirdPrice}
                      onChange={(e) => setEarlyBirdPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="249.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Early Bird Deadline
                  </label>
                  <input
                    type="date"
                    value={earlyBirdDeadline}
                    onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    After this date, the regular price will apply
                  </p>
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-blue-900">
                <strong>Your Earnings:</strong> You'll keep {formatRatePercentage(1 - commissionRate)} of ${price || '0'} = ${((parseFloat(price) || 0) * (1 - commissionRate)).toFixed(2)} per booking.
                We keep {formatRatePercentage(commissionRate)} (${((parseFloat(price) || 0) * commissionRate).toFixed(2)}) as our commission.
              </p>

              {hasPromoOffer && offer && (
                <div className="text-sm text-green-700 font-medium">
                  🎉 Promotional offer active: {offer.display_text}
                  {bookingsRemaining !== null && ` (${bookingsRemaining} bookings remaining)`}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Description</h2>
                <p className="text-gray-600">Tell parents about your camp</p>
              </div>
            </div>

            {/* Camp Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Camp Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none"
                placeholder="Describe your camp in detail. What activities will campers enjoy? What makes your camp special? What will they learn?"
              />
              <p className="mt-1 text-xs text-gray-500">
                {description.length} characters (minimum 50 recommended)
              </p>
            </div>

            {/* Tips Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Tips for a great description:</h4>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Highlight unique activities and experiences</li>
                <li>Mention qualified staff and safety measures</li>
                <li>Describe a typical day at camp</li>
                <li>Include any certifications or accreditations</li>
              </ul>
            </div>

            {/* What to Bring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What to Bring <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={whatToBring}
                onChange={(e) => setWhatToBring(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                placeholder="List items campers should bring (e.g., water bottle, sunscreen, lunch, comfortable shoes)"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
                <p className="text-gray-600">Add a featured image (optional but recommended)</p>
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste a link to an image hosted online (e.g., from Google Drive, Dropbox, or your website)
              </p>
            </div>

            {/* Image Preview */}
            {featuredImageUrl && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                  <img
                    src={featuredImageUrl}
                    alt="Featured camp"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Don't have images yet?</strong> No problem! You can skip this step and add photos
                later from your dashboard. Camps with photos get 3x more bookings, so we recommend adding
                them before your camp goes live.
              </p>
            </div>

            {/* Placeholder  if no image */}
            {!featuredImageUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No image added yet</p>
                <p className="text-sm text-gray-500">You can add images later from your dashboard</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                <p className="text-gray-600">Double-check your camp details</p>
              </div>
            </div>

            {/* Camp Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
              {featuredImageUrl && (
                <img
                  src={featuredImageUrl}
                  alt={campName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{campName}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Ages {ageMin}-{ageMax}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ${price} {currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium text-gray-900">{location}</span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-2 font-medium text-gray-900">{capacity} spots</span>
                </div>
                <div>
                  <span className="text-gray-600">Start:</span>
                  <span className="ml-2 font-medium text-gray-900">{new Date(startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">End:</span>
                  <span className="ml-2 font-medium text-gray-900">{new Date(endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{description.substring(0, 200)}...</p>
            </div>

            {/* What Happens Next */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Your camp will be submitted to our team for review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>We'll review it within 24 hours and approve or provide feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Once approved, your camp goes live and parents can start booking!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>You'll get notified of every booking and receive payouts automatically</span>
                </li>
              </ol>
            </div>

            {/* Submit Options */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save as Draft
              </button>

              <button
                onClick={handleSubmitForReview}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    Submit for Review
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step <= currentStep
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-12 sm:w-20 h-1 transition-all ${
                      step < currentStep ? 'bg-pink-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of 5
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
