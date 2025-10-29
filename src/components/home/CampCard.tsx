import { Heart, Star, TrendingUp, AlertCircle, Sparkles, Users, Award } from 'lucide-react';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

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
  price: number;
  currency?: string;
  originalPrice?: number;
  spotsRemaining?: number;
  bookingsThisWeek?: number;
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
  price,
  currency = 'USD',
  originalPrice,
  spotsRemaining,
  bookingsThisWeek,
}: CampCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const badgeColors = {
    Limited: 'bg-red-500',
    Popular: 'bg-green-600',
    New: 'bg-blue-500',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    setJustFavorited(true);
    setTimeout(() => setJustFavorited(false), 600);
  };

  const getUrgencyBadge = () => {
    if (spotsRemaining !== undefined) {
      if (spotsRemaining === 0) {
        return { text: 'Fully Booked', color: 'bg-gray-500', show: true, icon: null };
      }
      if (spotsRemaining <= 3) {
        return { text: `Only ${spotsRemaining} spots left!`, color: 'bg-red-500 animate-pulse', show: true, icon: AlertCircle };
      }
      if (spotsRemaining <= 5) {
        return { text: `${spotsRemaining} spots remaining`, color: 'bg-orange-500', show: true, icon: Users };
      }
    }
    return { text: '', color: '', show: false, icon: null };
  };

  const urgencyBadge = getUrgencyBadge();
  const showSocialProof = bookingsThisWeek && bookingsThisWeek > 5;
  const fallbackImage = 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800';

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
      <div className="relative h-44 sm:h-40 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className={`w-full h-44 sm:h-40 object-cover transition-all duration-500 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Badge with enhanced styling */}
        {badge && !urgencyBadge.show && (
          <div className={`absolute top-3 left-3 ${badgeColors[badge]} text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1.5 transform transition-all duration-300 ${isHovered ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
            {badge === 'Popular' && <Award className="w-3.5 h-3.5" />}
            {badge === 'New' && <Sparkles className="w-3.5 h-3.5" />}
            {badge}
          </div>
        )}
        {/* Urgency badge with icon */}
        {urgencyBadge.show && (
          <div className={`absolute top-3 left-3 ${urgencyBadge.color} text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5 transform transition-all duration-300`}>
            {urgencyBadge.icon && <urgencyBadge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {urgencyBadge.text}
          </div>
        )}
        {/* Enhanced favorite button with satisfying animation */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg ${justFavorited ? 'animate-bounce' : ''} ${isHovered ? 'scale-105' : 'scale-100'}`}
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
              isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600 hover:text-red-400'
            } ${justFavorited && isFavorite ? 'animate-ping' : ''}`}
          />
        </button>
        {/* Enhanced social proof with animation */}
        {showSocialProof && (
          <div className={`absolute bottom-3 left-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur-sm transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-95'}`}>
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span className="truncate flex-1">
              {bookingsThisWeek > 20 ? '🔥 ' : ''}{bookingsThisWeek} families joined this week!
            </span>
          </div>
        )}
      </div>

      {/* Content section with staggered animations */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow relative">
        {/* Benefit message ribbon */}
        {getBenefitMessage() && (
          <div className={`absolute -top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold py-1 px-3 text-center transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <Sparkles className="w-3 h-3 inline mr-1" />
            {getBenefitMessage()}
          </div>
        )}

        <div className="flex items-center justify-between mb-2 transition-all duration-300 delay-75" style={{ opacity: isHovered ? 1 : 0.9 }}>
          <span className="text-xs sm:text-sm text-gray-600 truncate pr-2 font-medium">{location}</span>
          <div className="flex items-center space-x-1 flex-shrink-0 bg-amber-50 px-2 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-xs sm:text-sm text-amber-900">
              {rating > 0 ? rating : 'New'} {reviewCount > 0 && <span className="text-gray-600 font-normal">({reviewCount})</span>}
            </span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] transition-all duration-300 delay-100 group-hover:text-blue-600">{title}</h3>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 transition-all duration-300 delay-150">
          <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">{category}</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{ageRange}</span>
        </div>

        <div className="mb-3 sm:mb-4"></div>

        {/* Enhanced pricing section */}
        <div className="flex items-center justify-between mt-auto gap-3 transition-all duration-300 delay-200">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                {formatCurrency(price, currency)}
              </span>
              {savingsPercentage && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-pulse">
                  Save {savingsPercentage}%
                </span>
              )}
            </div>
            {originalPrice && originalPrice > price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">{formatCurrency(originalPrice, currency)}</span>
            )}
          </div>
          {spotsRemaining !== 0 && (
            <button className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isHovered ? 'scale-105 -translate-y-0.5' : 'scale-100'}`}>
              Book Now
            </button>
          )}
          {spotsRemaining === 0 && (
            <div className="text-xs sm:text-sm font-bold text-gray-400 bg-gray-100 px-4 py-2 rounded-xl flex-shrink-0">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (id) {
    return (
      <Link
        to={`/camps/${id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all duration-500 w-full h-full flex flex-col group relative ${isHovered ? 'shadow-2xl -translate-y-2 scale-[1.02]' : 'shadow-lg translate-y-0 scale-100'}`}
        ref={cardRef as React.RefObject<HTMLAnchorElement>}
      >
        {/* Shine effect border on hover */}
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-20' : 'opacity-0'} -z-10 blur-xl`} />
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all duration-500 w-full h-full flex flex-col relative ${isHovered ? 'shadow-2xl -translate-y-2 scale-[1.02]' : 'shadow-lg translate-y-0 scale-100'}`}
      ref={cardRef as React.RefObject<HTMLDivElement>}
    >
      {/* Shine effect border on hover */}
      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-20' : 'opacity-0'} -z-10 blur-xl`} />
      {cardContent}
    </div>
  );
}
