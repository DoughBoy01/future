import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api, ApiError, fromCents, type PublicCamp } from '../lib/api';
import { formatCurrency } from '../utils/currency';
import { formatPrice, getConvertedPrice, detectUserCurrency } from '../lib/currency';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Info,
  Shield,
  AlertCircle,
  Share2,
  Heart,
  X,
  Home,
  ChevronRight
} from 'lucide-react';
import { ImageGallery } from '../components/camps/ImageGallery';
import { VideoPlayer } from '../components/camps/VideoPlayer';
import { EnhancedBookingWidget } from '../components/camps/EnhancedBookingWidget';
import { HostInformation } from '../components/camps/HostInformation';
import { AmenitiesSection } from '../components/camps/AmenitiesSection';
import { ReviewsSection } from '../components/camps/ReviewsSection';
import { FAQSection } from '../components/camps/FAQSection';
import { CountdownTimer } from '../components/urgency/CountdownTimer';
import { SocialMeta } from '../components/seo/SocialMeta';
type Camp = PublicCamp;

interface Organisation {
  id: string;
  name: string;
  logo_url?: string;
  about?: string;
  verified: boolean;
  response_rate: number;
  response_time_hours: number;
  total_camps_hosted: number;
  established_year?: number;
}

interface EnquiryModalProps {
  isOpen: boolean;
  campName: string;
  onClose: () => void;
  onSubmit: (data: {
    parent_name: string;
    parent_email: string;
    parent_phone: string;
    subject: string;
    message: string;
  }) => Promise<void>;
}

function EnquiryModal({ isOpen, campName, onClose, onSubmit }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          parent_name: '',
          parent_email: '',
          parent_phone: '',
          subject: '',
          message: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-airbnb-grey-200">
          <h2 className="text-2xl font-bold text-airbnb-grey-900">Ask about {campName}</h2>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-airbnb-pink-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-airbnb-grey-900 mb-2">Enquiry Sent!</h3>
            <p className="text-airbnb-grey-600">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">Your Name *</label>
              <input
                type="text"
                required
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.parent_email}
                onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Question about dietary requirements"
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">Message *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Ask us anything about this camp..."
                className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-airbnb-grey-300 rounded-lg text-airbnb-grey-700 font-medium hover:bg-airbnb-grey-50 transition-airbnb"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-airbnb-pink-600 text-white rounded-md font-medium hover:bg-airbnb-pink-700 hover:scale-[1.02] transition-airbnb disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {submitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function CampDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [availablePlaces, setAvailablePlaces] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [stickyBar, setStickyBar] = useState(false);
  // Reviews return with the reviews feature; until then there is nothing to show.
  const reviews: any[] = [];
  const ratingsSummary: any = null;
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Initialize favorite state from localStorage
  const [isFavorite, setIsFavorite] = useState(() => {
    if (!id) return false;
    try {
      const favorites = JSON.parse(localStorage.getItem('campFavorites') || '[]');
      return favorites.includes(id);
    } catch {
      return false;
    }
  });

  // Initialize user's preferred currency from localStorage
  const [userCurrency, setUserCurrency] = useState<string>(() => {
    return localStorage.getItem('preferredCurrency') || detectUserCurrency();
  });

  // Listen for currency changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newCurrency = localStorage.getItem('preferredCurrency') || detectUserCurrency();
      setUserCurrency(newCurrency);
    };

    const handleCurrencyChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      setUserCurrency(customEvent.detail.currency);
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom currency change events from same tab
    window.addEventListener('currencyChanged', handleCurrencyChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currencyChanged', handleCurrencyChanged);
    };
  }, []);

  useEffect(() => {
    if (id) {
      loadCampData();
      // Update favorite state when id changes
      try {
        const favorites = JSON.parse(localStorage.getItem('campFavorites') || '[]');
        setIsFavorite(favorites.includes(id));
      } catch {
        setIsFavorite(false);
      }
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setStickyBar(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function loadCampData() {
    try {
      const campData = await api.camps.get(id!);
      setCamp(campData);
      setAvailablePlaces(campData.capacity - campData.enrolled);
      setOrganisation({
        id: campData.organisation.id,
        name: campData.organisation.name,
        logo_url: campData.organisation.logoUrl ?? undefined,
        verified: campData.organisation.verified,
        response_rate: 0,
        response_time_hours: 0,
        total_camps_hosted: 0,
      });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) console.error('Error loading camp data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEnquirySubmit = async (data: any) => {
    if (!camp) return;

    await api.enquiries.create({
      campId: camp.id,
      name: data.parent_name,
      email: data.parent_email,
      phone: data.parent_phone || undefined,
      subject: data.subject,
      message: data.message,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleFavorite = () => {
    if (!id) return;

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Persist to localStorage
    try {
      const favorites = JSON.parse(localStorage.getItem('campFavorites') || '[]');
      if (newFavoriteState) {
        // Add to favorites
        if (!favorites.includes(id)) {
          favorites.push(id);
        }
      } else {
        // Remove from favorites
        const index = favorites.indexOf(id);
        if (index > -1) {
          favorites.splice(index, 1);
        }
      }
      localStorage.setItem('campFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const handleShare = async () => {
    if (!camp) return;

    const shareData = {
      title: camp.name,
      text: `Check out this amazing camp: ${camp.name}! ${camp.category} camp in ${camp.location} for ages ${camp.ageMin}-${camp.ageMax}. Starting at ${formatCurrency(fromCents(camp.priceCents), camp.currency)}.`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowCopyToast(true);
          setTimeout(() => setShowCopyToast(false), 3000);
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading camp details...</p>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Camp Not Found</h2>
          <p className="text-gray-600 mb-6">This camp may not exist or is no longer available.</p>
          <Link
            to="/camps"
            className="inline-flex items-center px-6 py-3 bg-airbnb-pink-600 text-white rounded-md hover:bg-airbnb-pink-700 hover:scale-[1.02] transition-airbnb shadow-sm hover:shadow-md"
          >
            Browse All Camps
          </Link>
        </div>
      </div>
    );
  }

  const availabilityStatus = availablePlaces <= 0 ? 'full' : availablePlaces <= 5 ? 'limited' : 'available';
  const price = fromCents(camp.priceCents);
  const earlyBirdActive = camp.earlyBirdCents && camp.earlyBirdDeadline && new Date(camp.earlyBirdDeadline) > new Date();
  const currentPrice = earlyBirdActive && camp.earlyBirdCents ? fromCents(camp.earlyBirdCents) : price;

  const images = [
    camp.image || 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    ...camp.gallery
  ].filter(Boolean).slice(0, 10);

  const extractYouTubeThumbnail = (url: string): string | undefined => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/,
      /youtube\.com\/embed\/([^&\s?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
    return undefined;
  };

  const videoData = camp.videos.map((url, idx) => {
    const isYouTube = /youtu\.?be/.test(url);
    return {
      url,
      title: idx === 0 ? 'Camp Introduction' : `Camp Video ${idx + 1}`,
      thumbnail: isYouTube ? extractYouTubeThumbnail(url) : undefined,
      description: undefined as string | undefined,
      type: (isYouTube ? 'youtube' : 'direct') as 'youtube' | 'direct',
    };
  });

  const highlights = camp.highlights;
  const amenities = camp.amenities;
  const faqs = camp.faqs;

  // Create meta description
  const metaDescription = camp.description
    ? camp.description.substring(0, 155) + (camp.description.length > 155 ? '...' : '')
    : `${camp.category} camp in ${camp.location} for ages ${camp.ageMin}-${camp.ageMax}. Starting at ${formatCurrency(fromCents(camp.priceCents), camp.currency)}.`;

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate structured data for SEO (JSON-LD)
  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;

    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalEvent',
      name: camp.name,
      description: camp.description || metaDescription,
      image: images,
      startDate: camp.startDate,
      endDate: camp.endDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: camp.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: camp.location,
        },
      },
      offers: {
        '@type': 'Offer',
        url: currentUrl,
        price: fromCents(camp.priceCents),
        priceCurrency: camp.currency,
        availability: availablePlaces > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        validFrom: new Date().toISOString(),
      },
      organizer: organisation ? {
        '@type': 'Organization',
        name: organisation.name,
        url: baseUrl,
      } : undefined,
      performer: organisation ? {
        '@type': 'Organization',
        name: organisation.name,
      } : undefined,
      ...(ratingsSummary && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingsSummary.average,
          reviewCount: ratingsSummary.total,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      ...(reviews.length > 0 && {
        review: reviews.slice(0, 5).map(review => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.parent_name || 'Anonymous',
          },
          datePublished: review.submitted_at,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.overall_rating,
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody: review.comment,
        })),
      }),
    };
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Camps',
        item: `${window.location.origin}/camps`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: camp.name,
        item: window.location.href,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>

        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />

        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content={`${camp.category} camp, ${camp.location}, ages ${camp.ageMin}-${camp.ageMax}, summer camp, kids activities`} />
        <meta name="author" content={organisation?.name || 'FutureEdge Camps'} />
        <meta name="robots" content="index, follow" />

        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Helmet>

      <SocialMeta
        title={camp.name}
        description={metaDescription}
        image={camp.image || undefined}
        type="website"
        price={formatCurrency(fromCents(camp.priceCents), camp.currency)}
        location={camp.location}
        dates={`${formatDateShort(camp.startDate)} - ${formatDateShort(camp.endDate)}`}
      />
      {/* Sticky CTA Bar - Improved Mobile UX */}
      {stickyBar && availabilityStatus !== 'full' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 py-2 sm:py-3 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{camp.name}</h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {ratingsSummary && (
                  <span className="text-gray-600 flex items-center gap-1">
                    ⭐ {ratingsSummary.average.toFixed(1)}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="text-airbnb-pink-600 font-semibold">
                    {formatPrice(currentPrice, camp.currency)}
                  </span>
                  {userCurrency !== camp.currency && (
                    <span className="text-xs text-gray-500">
                      ≈ {formatPrice(getConvertedPrice(currentPrice, camp.currency, userCurrency).amount, userCurrency)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to={`/camps/${camp.id}/register`}
              className="px-4 sm:px-6 py-2 bg-airbnb-pink-600 text-white rounded-md hover:bg-airbnb-pink-700 hover:scale-[1.02] transition-airbnb font-semibold shadow-sm hover:shadow-md text-sm sm:text-base whitespace-nowrap"
            >
              Reserve
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Bottom CTA Bar - Only show when spots available */}
      {availabilityStatus !== 'full' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-2xl border-t border-gray-200 p-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(currentPrice, camp.currency)}
                </span>
                {earlyBirdActive && camp.earlyBirdCents && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(price, camp.currency)}
                  </span>
                )}
              </div>
              {userCurrency !== camp.currency && (
                <span className="text-xs text-gray-500">
                  ≈ {formatPrice(getConvertedPrice(currentPrice, camp.currency, userCurrency).amount, userCurrency)}
                </span>
              )}
              {availablePlaces <= 5 && availablePlaces > 0 && (
                <span className="text-xs text-red-600 font-medium">Only {availablePlaces} spots left!</span>
              )}
            </div>
            <Link
              to={`/camps/${camp.id}/register`}
              className="px-6 py-3 bg-airbnb-pink-600 text-white rounded-lg hover:bg-airbnb-pink-700 font-bold shadow-lg hover:shadow-xl transition-airbnb text-base"
            >
              Reserve Now
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-airbnb-pink-500 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/camps" className="hover:text-airbnb-pink-500 transition-colors">
            Camps
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{camp.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{camp.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {ratingsSummary && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">⭐ {ratingsSummary.average.toFixed(1)}</span>
                  <span className="text-gray-600">({ratingsSummary.total} reviews)</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{camp.location}</span>
                </div>
                {camp.address && (
                  <div className="text-sm text-gray-500 ml-5">
                    {camp.address}
                  </div>
                )}
              </div>
              <span className="px-3 py-1 bg-airbnb-pink-50 text-airbnb-pink-700 rounded-full text-xs font-medium uppercase">
                {camp.category}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              aria-label="Share this camp"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleFavorite}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors border ${
                isFavorite ? 'border-airbnb-pink-500 bg-airbnb-pink-50' : 'border-gray-300'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-airbnb-pink-500 text-airbnb-pink-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        </div>

        <ImageGallery
          images={images}
          videos={videoData}
          campName={camp.name}
          onVideoClick={(videoIndex) => {
            setSelectedVideoIndex(videoIndex);
            setIsVideoModalOpen(true);
          }}
        />

        {/* Quick Info Summary Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-airbnb-pink-50 rounded-lg">
                <Calendar className="w-5 h-5 text-airbnb-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Duration</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.ceil(
                    (new Date(camp.endDate).getTime() - new Date(camp.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Age Range</p>
                <p className="text-sm font-bold text-gray-900">
                  {camp.ageMin}-{camp.ageMax} yrs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm font-bold text-gray-900 truncate">{camp.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Spots Left</p>
                <p className={`text-sm font-bold ${availablePlaces <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                  {availablePlaces} / {camp.capacity}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pb-24 lg:pb-8">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Camp</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {camp.description || 'No description available.'}
              </p>
            </div>

            {highlights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Camp Highlights</h2>
                <ul className="space-y-3">
                  {highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-airbnb-pink-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {earlyBirdActive && camp.earlyBirdDeadline && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-3">Early Bird Special!</h3>
                <CountdownTimer targetDate={camp.earlyBirdDeadline} label="Offer expires in" size="lg" />
              </div>
            )}


            {ratingsSummary && reviews.length > 0 && (
              <ReviewsSection
                campId={camp.id}
                averageRating={ratingsSummary.average}
                totalReviews={ratingsSummary.total}
                ratingBreakdown={ratingsSummary.breakdown}
                starDistribution={ratingsSummary.distribution}
                reviews={reviews}
                recommendPercentage={ratingsSummary.recommendPercentage}
              />
            )}

            {amenities.length > 0 && <AmenitiesSection amenities={amenities} />}

            {camp.whatToBring && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{camp.whatToBring}</p>
              </div>
            )}

            {camp.requirements && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{camp.requirements}</p>
              </div>
            )}

            {camp.safety && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-7 h-7 text-airbnb-pink-500" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-gray-900">Safety & Insurance</h2>
                </div>
                {camp.safety && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Safety Protocols</h3>
                    <p className="text-gray-700 leading-relaxed">{camp.safety}</p>
                  </div>
                )}
              </div>
            )}

            {camp.cancellationPolicy && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-7 h-7 text-airbnb-grey-700" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-gray-900">Cancellation & Refund Policy</h2>
                </div>
                {camp.cancellationPolicy && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-700 leading-relaxed">{camp.cancellationPolicy}</p>
                  </div>
                )}
              </div>
            )}

            {organisation && (
              <HostInformation
                organisation={organisation}
                onContactClick={() => setShowEnquiryModal(true)}
              />
            )}

            {faqs.length > 0 && <FAQSection faqs={faqs} />}
          </div>

          <div className="lg:col-span-1 min-w-0">
            <div className="lg:sticky lg:top-24">
              <EnhancedBookingWidget
                campId={camp.id}
                price={fromCents(camp.priceCents)}
                currency={camp.currency}
                earlyBirdPrice={camp.earlyBirdCents ? fromCents(camp.earlyBirdCents) : undefined}
                earlyBirdDeadline={camp.earlyBirdDeadline || undefined}
                availablePlaces={availablePlaces}
                capacity={camp.capacity}
                startDate={camp.startDate}
                endDate={camp.endDate}
                averageRating={ratingsSummary?.average}
                totalReviews={ratingsSummary?.total}
                cancellationPolicy={camp.cancellationPolicy ?? undefined}
                onEnquiryClick={() => setShowEnquiryModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={showEnquiryModal}
        campName={camp.name}
        onClose={() => setShowEnquiryModal(false)}
        onSubmit={handleEnquirySubmit}
      />

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-airbnb-grey-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}

      {isVideoModalOpen && selectedVideoIndex !== null && videoData[selectedVideoIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVideoModalOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors z-10"
            aria-label="Close video"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoPlayer
              url={videoData[selectedVideoIndex].url}
              title={videoData[selectedVideoIndex].title}
              thumbnail={videoData[selectedVideoIndex].thumbnail}
              autoplay={true}
              className="w-full shadow-2xl"
            />
            {(videoData[selectedVideoIndex].title || videoData[selectedVideoIndex].description) && (
              <div className="mt-4 text-white">
                {videoData[selectedVideoIndex].title && (
                  <h3 className="text-xl font-bold mb-2">{videoData[selectedVideoIndex].title}</h3>
                )}
                {videoData[selectedVideoIndex].description && (
                  <p className="text-gray-300">{videoData[selectedVideoIndex].description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
