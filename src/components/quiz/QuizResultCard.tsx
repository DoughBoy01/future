import { MapPin, Calendar, Users, DollarSign, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'] & {
  organisations?: { name: string } | null;
  camp_category_assignments?: Array<{
    camp_categories: { id: string; name: string; slug: string } | null;
  }>;
};

interface QuizResultCardProps {
  camp: Camp;
  matchLabel: 'perfect' | 'great' | 'good';
  matchReasons: string[];
  ranking: number;
  onCampClick?: () => void;
}

export function QuizResultCard({
  camp,
  matchLabel,
  matchReasons,
  ranking,
  onCampClick,
}: QuizResultCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    onCampClick?.();
    navigate(`/camps/${camp.id}`);
  };

  const getMatchBadgeStyles = () => {
    switch (matchLabel) {
      case 'perfect':
        return {
          bg: 'bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600',
          text: 'text-white',
          label: 'Perfect Match',
          icon: '✨',
        };
      case 'great':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          text: 'text-white',
          label: 'Great Fit',
          icon: '⭐',
        };
      case 'good':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          text: 'text-white',
          label: 'Good Option',
          icon: '👍',
        };
    }
  };

  const matchBadge = getMatchBadgeStyles();

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price TBA';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: camp.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const availablePlaces =
    camp.capacity && camp.enrolled_count ? camp.capacity - camp.enrolled_count : null;

  return (
    <div className="group bg-white rounded-xl border-2 border-airbnb-grey-200 hover:border-airbnb-pink-400 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Ranking Badge */}
      <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-airbnb-grey-200">
        <span className="text-lg font-bold text-airbnb-pink-600">#{ranking}</span>
      </div>

      {/* Match Label Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`${matchBadge.bg} ${matchBadge.text} px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2`}
        >
          <span aria-hidden="true">{matchBadge.icon}</span>
          {matchBadge.label}
        </div>
      </div>

      {/* Camp Image */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-airbnb-grey-100">
        {camp.featured_image_url ? (
          <img
            src={camp.featured_image_url}
            alt={camp.name || 'Camp image'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-airbnb-pink-100 to-purple-100">
            <span className="text-6xl" aria-hidden="true">
              🏕️
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Camp Name & Organization */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-airbnb-grey-900 mb-1 line-clamp-2">
            {camp.name}
          </h3>
          {camp.organisations?.name && (
            <p className="text-sm text-airbnb-grey-600">by {camp.organisations.name}</p>
          )}
        </div>

        {/* Match Reasons */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-airbnb-grey-900">Why this matches:</p>
          <ul className="space-y-1.5">
            {matchReasons.slice(0, 3).map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-airbnb-grey-700"
              >
                <Check className="w-4 h-4 text-airbnb-pink-600 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Camp Details */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-airbnb-grey-200">
          {/* Location */}
          {camp.location && (
            <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
              <MapPin className="w-4 h-4 text-airbnb-grey-500 flex-shrink-0" />
              <span className="truncate">{camp.location}</span>
            </div>
          )}

          {/* Dates */}
          {camp.start_date && camp.end_date && (
            <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
              <Calendar className="w-4 h-4 text-airbnb-grey-500 flex-shrink-0" />
              <span className="truncate">
                {formatDate(camp.start_date)} - {formatDate(camp.end_date)}
              </span>
            </div>
          )}

          {/* Availability */}
          {availablePlaces !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-airbnb-grey-500 flex-shrink-0" />
              <span
                className={`font-medium ${
                  availablePlaces > 5
                    ? 'text-green-600'
                    : availablePlaces > 0
                    ? 'text-orange-600'
                    : 'text-red-600'
                }`}
              >
                {availablePlaces > 0 ? `${availablePlaces} spots left` : 'Full'}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
            <DollarSign className="w-4 h-4 text-airbnb-grey-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-airbnb-grey-900">
                {formatPrice(camp.early_bird_price || camp.price)}
              </span>
              {camp.early_bird_price && camp.early_bird_price < (camp.price || 0) && (
                <span className="text-xs text-green-600 font-medium">Early bird!</span>
              )}
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-4 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white py-3 px-6 rounded-lg font-bold transition-all hover:shadow-lg hover:scale-102 focus:outline-none focus:ring-2 focus:ring-airbnb-pink-600 focus:ring-offset-2 flex items-center justify-center gap-2"
          aria-label={`View details for ${camp.name}`}
        >
          View Details
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
