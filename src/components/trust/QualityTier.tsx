import { Award, TrendingUp, Clock, Users } from 'lucide-react';
import type { QualityIndicators } from '../../types/verification';

interface QualityTierProps {
  indicators: Partial<QualityIndicators>;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function QualityTier({
  indicators,
  variant = 'compact',
  className = '',
}: QualityTierProps) {
  const {
    tier = 'basic',
    responseRate,
    responseTimeHours,
    repeatBookingRate,
    yearsOnPlatform,
    totalCampersServed,
  } = indicators;

  const getTierDisplay = () => {
    switch (tier) {
      case 'elite':
        return {
          label: 'Elite Partner',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: Award,
        };
      case 'premium':
        return {
          label: 'Premium Partner',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: TrendingUp,
        };
      case 'verified':
        return {
          label: 'Verified Partner',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: Award,
        };
      default:
        return {
          label: 'Partner',
          color: 'text-airbnb-grey-600',
          bg: 'bg-airbnb-grey-50',
          border: 'border-airbnb-grey-200',
          icon: Users,
        };
    }
  };

  const tierDisplay = getTierDisplay();
  const Icon = tierDisplay.icon;

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${tierDisplay.bg} ${tierDisplay.border} ${className} shrink-0`}
      >
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tierDisplay.color} shrink-0`} />
        <span className={`text-xs sm:text-sm font-semibold ${tierDisplay.color} whitespace-nowrap`}>
          {tierDisplay.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`${tierDisplay.bg} rounded-xl p-4 sm:p-6 border ${tierDisplay.border} ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${tierDisplay.bg} rounded-full flex items-center justify-center border-2 ${tierDisplay.border} shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tierDisplay.color}`} />
        </div>
        <div className="min-w-0">
          <h3 className={`text-base sm:text-lg font-bold ${tierDisplay.color} truncate`}>
            {tierDisplay.label}
          </h3>
          <p className="text-xs sm:text-sm text-airbnb-grey-600 truncate">
            Trusted by FutureEdge
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {responseRate !== undefined && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-airbnb-grey-700 min-w-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Response Rate</span>
            </div>
            <span className={`font-semibold text-sm sm:text-base ${tierDisplay.color} shrink-0`}>
              {responseRate}%
            </span>
          </div>
        )}

        {responseTimeHours !== undefined && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-airbnb-grey-700 min-w-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Response Time</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-airbnb-grey-900 shrink-0 whitespace-nowrap">
              {responseTimeHours < 1
                ? '< 1 hour'
                : `${responseTimeHours}h`}
            </span>
          </div>
        )}

        {repeatBookingRate !== undefined && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-airbnb-grey-700 min-w-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Repeat Bookings</span>
            </div>
            <span className={`font-semibold text-sm sm:text-base ${tierDisplay.color} shrink-0`}>
              {repeatBookingRate}%
            </span>
          </div>
        )}

        {yearsOnPlatform !== undefined && (
          <div className="pt-3 border-t border-airbnb-grey-200">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-airbnb-grey-900">
                  {yearsOnPlatform}
                </div>
                <div className="text-[10px] sm:text-xs text-airbnb-grey-600">
                  {yearsOnPlatform === 1 ? 'Year' : 'Years'} on Platform
                </div>
              </div>
              {totalCampersServed !== undefined && (
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-airbnb-grey-900 truncate">
                    {totalCampersServed >= 1000
                      ? `${(totalCampersServed / 1000).toFixed(1)}k`
                      : totalCampersServed.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-airbnb-grey-600">
                    Campers Served
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
