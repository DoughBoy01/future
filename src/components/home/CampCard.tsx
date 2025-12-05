import { Heart, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
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

  const badgeColors = {
    Limited: 'bg-red-500',
    Popular: 'bg-green-600',
    New: 'bg-blue-500',
  };

  const getUrgencyBadge = () => {
    if (spotsRemaining !== undefined) {
      if (spotsRemaining === 0) {
        return { text: 'Sold Out', color: 'bg-gray-500', show: true };
      }
      if (spotsRemaining <= 3) {
        return { text: `Only ${spotsRemaining} left!`, color: 'bg-red-500 animate-pulse', show: true };
      }
      if (spotsRemaining <= 5) {
        return { text: `${spotsRemaining} spots left`, color: 'bg-orange-500', show: true };
      }
    }
    return { text: '', color: '', show: false };
  };

  const urgencyBadge = getUrgencyBadge();
  const showSocialProof = bookingsThisWeek && bookingsThisWeek > 5;
  const fallbackImage = 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800';

  const cardContent = (
    <>
      <div className="relative h-40">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className={`w-full h-40 object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        {badge && !urgencyBadge.show && (
          <div className={`absolute top-4 left-4 ${badgeColors[badge]} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
            {badge}
          </div>
        )}
        {urgencyBadge.show && (
          <div className={`absolute top-4 left-4 ${urgencyBadge.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}>
            <AlertCircle className="w-4 h-4" />
            {urgencyBadge.text}
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        {showSocialProof && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{bookingsThisWeek} families booked this week</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 truncate pr-2">{location}</span>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm">
              {rating > 0 ? rating : 'New'} {reviewCount > 0 && <span className="text-gray-500">({reviewCount})</span>}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]">{title}</h3>

        <div className="text-sm text-gray-600 mb-1">{category}</div>
        <div className="text-sm text-gray-600 mb-4">{ageRange}</div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(price, currency)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">{formatCurrency(originalPrice, currency)}</span>
            )}
          </div>
          {spotsRemaining !== 0 && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Book Now
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (id) {
    return (
      <Link
        to={`/camps/${id}`}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col group"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col">
      {cardContent}
    </div>
  );
}
