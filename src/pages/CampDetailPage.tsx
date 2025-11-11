import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/currency';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Info,
  Shield,
  AlertCircle,
  Share2,
  Heart,
  ChevronLeft,
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
import { SocialProof } from '../components/urgency/SocialProof';
import { CountdownTimer } from '../components/urgency/CountdownTimer';
import { SocialMeta } from '../components/seo/SocialMeta';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];

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
                className="flex-1 px-6 py-3 bg-airbnb-pink-500 text-white rounded-md font-medium hover:bg-airbnb-pink-600 hover:scale-[1.02] transition-airbnb disabled:opacity-50 shadow-sm hover:shadow-md"
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
  const [bookingsLast24h, setBookingsLast24h] = useState(0);
  const [bookingsLastWeek, setBookingsLastWeek] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [stickyBar, setStickyBar] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingsSummary, setRatingsSummary] = useState<any>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    if (id) {
      loadCampData();
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
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (campError) throw campError;
      if (!campData) {
        setLoading(false);
        return;
      }

      setCamp(campData);

      const enrolledCount = (campData as any).enrolled_count || 0;
      setAvailablePlaces(campData.capacity - enrolledCount);

      const { data: orgData } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', (campData as any).organisation_id)
        .maybeSingle();

      if (orgData) {
        setOrganisation(orgData as any);
      }

      const { data: analyticsData } = await supabase
        .from('camp_analytics')
        .select('bookings_last_24h, bookings_last_week')
        .eq('camp_id', id)
        .maybeSingle();

      if (analyticsData) {
        setBookingsLast24h(analyticsData.bookings_last_24h || 0);
        setBookingsLastWeek(analyticsData.bookings_last_week || 0);
      }

      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .eq('camp_id', id)
        .order('submitted_at', { ascending: false });

      if (feedbackData && feedbackData.length > 0) {
        setReviews(feedbackData.map(f => ({
          ...f,
          helpful_count: (f as any).helpful_count || 0,
          verified_booking: (f as any).verified_booking ?? true,
        })));

        const avgOverall = feedbackData.reduce((sum, f) => sum + f.overall_rating, 0) / feedbackData.length;
        const avgStaff = feedbackData.reduce((sum, f) => sum + (f.staff_rating || 0), 0) / feedbackData.length;
        const avgActivities = feedbackData.reduce((sum, f) => sum + (f.activities_rating || 0), 0) / feedbackData.length;
        const avgFacilities = feedbackData.reduce((sum, f) => sum + (f.facilities_rating || 0), 0) / feedbackData.length;
        const avgValue = feedbackData.reduce((sum, f) => sum + (f.value_rating || 0), 0) / feedbackData.length;

        const starDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        feedbackData.forEach(f => {
          const rating = f.overall_rating as keyof typeof starDist;
          if (rating >= 1 && rating <= 5) {
            starDist[rating]++;
          }
        });

        const recommendCount = feedbackData.filter(f => f.would_recommend).length;
        const recommendPct = (recommendCount / feedbackData.length) * 100;

        setRatingsSummary({
          average: avgOverall,
          total: feedbackData.length,
          breakdown: {
            overall: avgOverall,
            staff: avgStaff,
            activities: avgActivities,
            facilities: avgFacilities,
            value: avgValue,
          },
          distribution: starDist,
          recommendPercentage: Math.round(recommendPct),
        });
      }
    } catch (error) {
      console.error('Error loading camp data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEnquirySubmit = async (data: any) => {
    if (!camp) return;

    await supabase.from('enquiries').insert({
      camp_id: camp.id,
      parent_name: data.parent_name,
      parent_email: data.parent_email,
      parent_phone: data.parent_phone || null,
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

  const handleShare = async () => {
    if (!camp) return;

    const shareData = {
      title: camp.name,
      text: `Check out this amazing camp: ${camp.name}! ${camp.category} camp in ${camp.location} for ages ${camp.age_min}-${camp.age_max}. Starting at ${formatCurrency(camp.price, camp.currency)}.`,
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
            className="inline-flex items-center px-6 py-3 bg-airbnb-pink-500 text-white rounded-md hover:bg-airbnb-pink-600 hover:scale-[1.02] transition-airbnb shadow-sm hover:shadow-md"
          >
            Browse All Camps
          </Link>
        </div>
      </div>
    );
  }

  const availabilityStatus = availablePlaces <= 0 ? 'full' : availablePlaces <= 5 ? 'limited' : 'available';
  const earlyBirdActive = camp.early_bird_price && camp.early_bird_deadline && new Date(camp.early_bird_deadline) > new Date();

  const images = [
    camp.featured_image_url || 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    ...(Array.isArray((camp as any).gallery_urls) ? (camp as any).gallery_urls : [])
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

  const videoData = [];
  if ((camp as any).video_url) {
    const url = (camp as any).video_url;
    videoData.push({
      url,
      title: 'Camp Introduction',
      thumbnail: extractYouTubeThumbnail(url),
      type: 'youtube' as const
    });
  }
  if (Array.isArray((camp as any).video_urls)) {
    videoData.push(...(camp as any).video_urls.map((url: string, idx: number) => ({
      url,
      title: `Camp Video ${idx + 2}`,
      thumbnail: extractYouTubeThumbnail(url),
      type: 'youtube' as const
    })));
  }
  if (Array.isArray((camp as any).video_metadata)) {
    const metadataVideos = (camp as any).video_metadata.map((meta: any) => ({
      url: meta.url,
      title: meta.title,
      description: meta.description,
      thumbnail: meta.thumbnail_url || extractYouTubeThumbnail(meta.url),
      type: meta.video_type || 'youtube'
    }));
    videoData.push(...metadataVideos);
  }

  const highlights = Array.isArray((camp as any).highlights) ? (camp as any).highlights : [];
  const amenities = Array.isArray((camp as any).amenities) ? (camp as any).amenities : [];
  const faqs = Array.isArray((camp as any).faqs) ? (camp as any).faqs : [];

  // Create meta description
  const metaDescription = camp.description
    ? camp.description.substring(0, 155) + (camp.description.length > 155 ? '...' : '')
    : `${camp.category} camp in ${camp.location} for ages ${camp.age_min}-${camp.age_max}. Starting at ${formatCurrency(camp.price, camp.currency)}.`;

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
      startDate: camp.start_date,
      endDate: camp.end_date,
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
        price: camp.price,
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
        <meta name="keywords" content={`${camp.category} camp, ${camp.location}, ages ${camp.age_min}-${camp.age_max}, summer camp, kids activities`} />
        <meta name="author" content={organisation?.name || 'FutureEdge Camps'} />
        <meta name="robots" content="index, follow" />

        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Helmet>

      <SocialMeta
        title={camp.name}
        description={metaDescription}
        image={camp.featured_image_url || undefined}
        type="website"
        price={formatCurrency(camp.price, camp.currency)}
        location={camp.location}
        dates={`${formatDateShort(camp.start_date)} - ${formatDateShort(camp.end_date)}`}
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
                <span className="text-airbnb-pink-600 font-semibold">
                  {formatCurrency(earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price, camp.currency)}
                </span>
              </div>
            </div>
            <Link
              to={`/camps/${camp.id}/register`}
              className="px-4 sm:px-6 py-2 bg-airbnb-pink-500 text-white rounded-md hover:bg-airbnb-pink-600 hover:scale-[1.02] transition-airbnb font-semibold shadow-sm hover:shadow-md text-sm sm:text-base whitespace-nowrap"
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
                  {formatCurrency(earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price, camp.currency)}
                </span>
                {earlyBirdActive && camp.early_bird_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(camp.price, camp.currency)}
                  </span>
                )}
              </div>
              {availablePlaces <= 5 && availablePlaces > 0 && (
                <span className="text-xs text-red-600 font-medium">Only {availablePlaces} spots left!</span>
              )}
            </div>
            <Link
              to={`/camps/${camp.id}/register`}
              className="px-6 py-3 bg-airbnb-pink-500 text-white rounded-lg hover:bg-airbnb-pink-600 font-bold shadow-lg hover:shadow-xl transition-airbnb text-base"
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
                {(camp as any).camp_address && (
                  <div className="text-sm text-gray-500 ml-5">
                    {(camp as any).camp_address}
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              aria-label="Save to favorites"
            >
              <Heart className="w-5 h-5 text-gray-600" />
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
                    (new Date(camp.end_date).getTime() - new Date(camp.start_date).getTime()) /
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
                  {camp.age_min}-{camp.age_max} yrs
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

            {earlyBirdActive && camp.early_bird_deadline && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-3">Early Bird Special!</h3>
                <CountdownTimer targetDate={camp.early_bird_deadline} label="Offer expires in" size="lg" />
              </div>
            )}

            {(bookingsLast24h > 0 || bookingsLastWeek > 0) && (
              <SocialProof
                bookingsLast24h={bookingsLast24h}
                bookingsLastWeek={bookingsLastWeek}
                showViewers={false}
              />
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

            {camp.what_to_bring && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{camp.what_to_bring}</p>
              </div>
            )}

            {camp.requirements && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{camp.requirements}</p>
              </div>
            )}

            {((camp as any).safety_protocols || (camp as any).insurance_info) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-7 h-7 text-airbnb-pink-500" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-gray-900">Safety & Insurance</h2>
                </div>
                {(camp as any).safety_protocols && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Safety Protocols</h3>
                    <p className="text-gray-700 leading-relaxed">{(camp as any).safety_protocols}</p>
                  </div>
                )}
                {(camp as any).insurance_info && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Insurance Information</h3>
                    <p className="text-gray-700 leading-relaxed">{(camp as any).insurance_info}</p>
                  </div>
                )}
              </div>
            )}

            {((camp as any).cancellation_policy || (camp as any).refund_policy) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-7 h-7 text-airbnb-grey-700" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-gray-900">Cancellation & Refund Policy</h2>
                </div>
                {(camp as any).cancellation_policy && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-700 leading-relaxed">{(camp as any).cancellation_policy}</p>
                  </div>
                )}
                {(camp as any).refund_policy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Refund Policy</h3>
                    <p className="text-gray-700 leading-relaxed">{(camp as any).refund_policy}</p>
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
                price={camp.price}
                currency={camp.currency}
                earlyBirdPrice={camp.early_bird_price || undefined}
                earlyBirdDeadline={camp.early_bird_deadline || undefined}
                availablePlaces={availablePlaces}
                capacity={camp.capacity}
                startDate={camp.start_date}
                endDate={camp.end_date}
                averageRating={ratingsSummary?.average}
                totalReviews={ratingsSummary?.total}
                cancellationPolicy={(camp as any).cancellation_policy}
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
