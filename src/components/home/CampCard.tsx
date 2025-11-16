import { Heart, Star, TrendingUp, AlertCircle, Sparkles, Users, Award, Share2, CheckCircle, Calendar } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { shareCamp } from '../../utils/share';
import { VerificationBadge } from '../trust/VerificationBadge';
import type { VerificationLevel } from '../../types/verification';

interface CampCardProps {
  id?: string;
  badge?: 'Limited' | 'Popular' | 'New';
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  title: string;
  category: string;
  ageRange: string;
  ageMin?: number;
  ageMax?: number;
  price: number;
  currency?: string;
  originalPrice?: number;
  spotsRemaining?: number;
  verificationLevel?: VerificationLevel;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export function CampCard({
  id,
  badge,
  image,
  location,
  rating,
  reviewCount,
  title,
  category,
  ageRange,
  ageMin,
  ageMax,
  price,
  currency = 'USD',
  originalPrice,
  spotsRemaining,
  verificationLevel,
  startDate,
  endDate,
  description,
}: CampCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Format dates for display
  const formatDateRange = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', formatOptions);
    const endStr = end.toLocaleDateString('en-US', formatOptions);

    // If same year, show year once at the end
    if (start.getFullYear() === end.getFullYear()) {
      return `${startStr} - ${endStr}, ${start.getFullYear()}`;
    }
    // Different years
    return `${startStr}, ${start.getFullYear()} - ${endStr}, ${end.getFullYear()}`;
  };

  // Get a short excerpt from description
  const getDescriptionExcerpt = () => {
    if (!description) return null;
    const maxLength = 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  const badgeColors = {
    Limited: 'bg-airbnb-pink-600',
    Popular: 'bg-airbnb-pink-500',
    New: 'bg-airbnb-pink-500',
  };

  const handleFavoriteClick = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('❤️ Favorite button clicked!', { id, title });
    e.preventDefault();
    e.stopPropagation();

    if (!id) {
      console.warn('⚠️ No ID provided for this camp - cannot favorite static/demo camps');
      alert('This is a demo camp. Favorite feature works with real camps from the database.');
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setJustFavorited(true);
    setTimeout(() => setJustFavorited(false), 600);

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
      console.log('✅ Favorite saved to localStorage:', newFavoriteState);
    } catch (error) {
      console.error('❌ Error saving favorite:', error);
    }
  };

  const handleShareClick = async (e: React.MouseEvent | React.TouchEvent) => {
    console.log('📤 Share button clicked!', { id, title });
    e.preventDefault();
    e.stopPropagation();

    if (!id || !ageMin || !ageMax) {
      console.warn('⚠️ Missing required data for sharing - this is likely a demo camp:', { id, ageMin, ageMax });
      alert('This is a demo camp. Share feature works with real camps from the database.');
      return;
    }

    const success = await shareCamp(
      {
        id,
        name: title,
        category,
        location,
        ageMin,
        ageMax,
        price,
        currency,
      },
      () => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
        console.log('✅ Share successful, toast shown');
      }
    );
    console.log('📊 Share result:', success);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-swipe="true"]')) {
      return;
    }

    // Navigate to camp detail page
    if (id) {
      navigate(`/camps/${id}`);
    }
  };

  const getUrgencyBadge = () => {
    if (spotsRemaining !== undefined) {
      if (spotsRemaining === 0) {
        return { text: 'Fully Booked', color: 'bg-gray-500', show: true, icon: null };
      }
      if (spotsRemaining <= 3) {
        return { text: `Only ${spotsRemaining} Spots Left!`, color: 'bg-red-500 animate-pulse', show: true, icon: AlertCircle };
      }
      if (spotsRemaining <= 5) {
        return { text: `${spotsRemaining} Spots Remaining`, color: 'bg-orange-500', show: true, icon: Users };
      }
    }
    return { text: '', color: '', show: false, icon: null };
  };

  const urgencyBadge = getUrgencyBadge();
  const fallbackImage = 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800';

  // More believable social proof messages - only show for truly exceptional cases
  const getSocialProofMessage = () => {
    // Priority 1: High ratings with substantial reviews (rare, highly credible)
    if (rating >= 4.9 && reviewCount >= 20) {
      return { text: `${reviewCount} Parents Recommend`, icon: Award, show: true };
    }

    // Priority 2: Genuine urgency - almost sold out (rare)
    if (spotsRemaining && spotsRemaining <= 3 && spotsRemaining > 0) {
      return { text: 'Almost Full', icon: Users, show: true };
    }

    // Priority 3: Significant savings only (15%+)
    if (originalPrice && originalPrice > price) {
      const savings = Math.round(((originalPrice - price) / originalPrice) * 100);
      if (savings >= 15) {
        return { text: `Save ${savings}%`, icon: Sparkles, show: true };
      }
    }

    // Default: No social proof (most camps won't show anything)
    return { text: '', icon: null, show: false };
  };

  const socialProof = getSocialProofMessage();

  // Benefit-focused messaging
  const getBenefitMessage = () => {
    if (rating >= 4.8) return "Parent's Top Choice";
    if (badge === 'Popular') return "Loved by Families";
    if (badge === 'New') return "Brand New Experience";
    if (originalPrice && originalPrice > price) return "Special Offer";
    return null;
  };

  const savingsPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const cardContent = (
    <>
      {/* Tighter image section - overflow-hidden ensures all elements stay within bounds */}
      <div className="relative h-48 sm:h-52 overflow-hidden rounded-t-lg" style={{ isolation: 'isolate' }}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-airbnb-grey-200 via-airbnb-grey-300 to-airbnb-grey-200 animate-pulse flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 border-4 border-airbnb-grey-300 border-t-airbnb-pink-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className={`w-full h-48 sm:h-52 object-cover transition-all duration-500 ease-out pointer-events-none ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        {/* Shimmer overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"
               style={{ animation: 'shimmer 2s infinite' }} />
        )}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {/* Compact badge - better spacing from top edge */}
        {badge && !urgencyBadge.show && (
          <div className={`absolute top-3 left-3 ${badgeColors[badge]} text-white px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-md backdrop-blur-sm flex items-center gap-1 transition-standard pointer-events-none`}>
            {badge === 'Popular' && <Award className="w-2.5 h-2.5" aria-hidden="true" />}
            {badge === 'New' && <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />}
            {badge}
          </div>
        )}
        {/* Urgency badge - better spacing from top edge */}
        {urgencyBadge.show && (
          <div className={`absolute top-3 left-3 ${urgencyBadge.color} text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm flex items-center gap-1 transition-standard pointer-events-none`}>
            {urgencyBadge.icon && <urgencyBadge.icon className="w-3 h-3" aria-hidden="true" />}
            {urgencyBadge.text}
          </div>
        )}
        {/* Action buttons - better spacing from top edge */}
        <div
          className="absolute top-3 right-3 flex gap-2"
          style={{
            zIndex: 9999,
            pointerEvents: 'auto',
            position: 'absolute',
            isolation: 'isolate'
          }}
          data-no-swipe="true"
        >
          <button
            type="button"
            onClick={handleShareClick}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Share this camp"
            className="bg-white p-1.5 rounded-full hover:bg-gray-50 transition-standard shadow-lg hover:shadow-xl touch-manipulation select-none"
            data-no-swipe="true"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Share2
              className="w-4 h-4 text-airbnb-grey-600 hover:text-airbnb-pink-400 transition-standard pointer-events-none"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`bg-white p-1.5 rounded-full hover:bg-gray-50 transition-standard shadow-lg hover:shadow-xl touch-manipulation select-none ${justFavorited ? 'animate-bounce' : ''}`}
            data-no-swipe="true"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Heart
              className={`w-4 h-4 transition-standard pointer-events-none ${
                isFavorite ? 'fill-airbnb-pink-500 text-airbnb-pink-500' : 'text-airbnb-grey-600 hover:text-airbnb-pink-400'
              } ${justFavorited && isFavorite ? 'animate-heartbeat' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
        {/* Category and Age Pills - stacked above date pill */}
        <div className="absolute bottom-14 left-3 flex flex-col gap-1 pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-airbnb-grey-700 px-2 py-0.5 rounded-full font-medium text-[10px] shadow-sm w-fit">
            {category}
          </span>
          <span className="bg-white/90 backdrop-blur-sm text-airbnb-pink-700 px-2 py-0.5 rounded-full font-medium text-[10px] shadow-sm w-fit">
            {ageRange}
          </span>
        </div>

        {/* Camp Dates - overlaid at bottom of image */}
        {formatDateRange() && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-standard pointer-events-none">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {formatDateRange()}
            </span>
          </div>
        )}

        {/* Believable social proof - repositioned to bottom right when dates present */}
        {socialProof.show && (
          <div className={`absolute bottom-3 ${formatDateRange() ? 'right-3' : 'left-3 right-3'} bg-white/95 backdrop-blur-sm text-airbnb-grey-900 px-2.5 py-1.5 rounded-md text-[10px] font-medium shadow-md flex items-center gap-1.5 border border-airbnb-grey-200 transition-standard pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-95'}`}>
            {socialProof.icon && <socialProof.icon className="w-3 h-3 flex-shrink-0 text-airbnb-pink-500" aria-hidden="true" />}
            <span className="truncate flex-1">
              {socialProof.text}
            </span>
          </div>
        )}
      </div>

      {/* Content section - Tighter, more internal space */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow relative overflow-hidden">
        {/* Benefit message ribbon - stays within card bounds */}
        {getBenefitMessage() && (
          <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white text-xs font-bold py-1 px-3 text-center transform transition-standard pointer-events-none ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <Sparkles className="w-3 h-3 inline mr-1" aria-hidden="true" />
            {getBenefitMessage()}
          </div>
        )}

        {/* Title - Focus on what the camp is, not where */}
        <h3 className="text-base sm:text-lg font-bold text-airbnb-grey-900 mb-2 line-clamp-2 leading-snug transition-standard group-hover:text-airbnb-pink-500">
          {title}
        </h3>

        {/* Description text */}
        {getDescriptionExcerpt() && (
          <p className="text-airbnb-grey-600 text-xs leading-relaxed mb-3 line-clamp-2">
            {getDescriptionExcerpt()}{' '}
            {description && description.length > 120 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (id) navigate(`/camps/${id}`);
                }}
                className="text-airbnb-pink-500 hover:text-airbnb-pink-600 font-medium underline transition-standard inline"
                data-no-swipe="true"
              >
                Read more
              </button>
            )}
          </p>
        )}

        {/* Benefits-focused badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 flex-wrap">
          {verificationLevel && verificationLevel !== 'unverified' && (
            <VerificationBadge level={verificationLevel} size="small" showTooltip={true} />
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="font-bold text-xs text-amber-900 whitespace-nowrap">
                {rating} {reviewCount > 0 && <span className="text-airbnb-grey-500 font-book">({reviewCount})</span>}
              </span>
            </div>
          )}
        </div>

        {/* Location - de-emphasized */}
        <div className="flex items-center gap-1 text-xs text-airbnb-grey-500 mb-4">
          <span className="truncate">{location}</span>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow"></div>

        {/* Compact footer - smaller price, smaller button */}
        <div className="flex items-end justify-between gap-3 mt-auto pt-3 border-t border-airbnb-grey-100">
          <div className="flex flex-col">
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-airbnb-grey-400 line-through mb-0.5">
                {formatCurrency(originalPrice, currency)}
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-airbnb-grey-900">
                {formatCurrency(price, currency)}
              </span>
              {savingsPercentage && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  -{savingsPercentage}%
                </span>
              )}
            </div>
          </div>
          {spotsRemaining !== 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Navigate to registration or open booking modal
                if (id) {
                  navigate(`/camps/${id}/register`);
                }
              }}
              className="bg-airbnb-pink-500 hover:bg-airbnb-pink-600 text-white px-4 py-2 rounded-md font-medium text-xs transition-airbnb shadow-sm hover:shadow-md flex-shrink-0"
              aria-label={`Book ${title}`}
              data-no-swipe="true"
            >
              Reserve
            </button>
          )}
          {spotsRemaining === 0 && (
            <div className="text-xs font-medium text-airbnb-grey-400 bg-airbnb-grey-100 px-3 py-2 rounded-md flex-shrink-0">
              Sold Out
            </div>
          )}
        </div>
      </div>

      {/* Share Toast - Positioned relative to card */}
      {showShareToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-airbnb-grey-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-slide-in">
            <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
            <span className="text-sm font-medium">Link copied!</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-airbnb w-full h-full flex flex-col group relative ${id ? 'cursor-pointer' : ''} ${isHovered ? 'shadow-xl -translate-y-1 scale-[1.02]' : 'shadow-md translate-y-0 scale-100'}`}
      ref={cardRef}
      style={{ position: 'relative', zIndex: 1 }}
    >
      {cardContent}
    </div>
  );
}
