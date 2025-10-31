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
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tierDisplay.bg} ${tierDisplay.border} ${className}`}
      >
        <Icon className={`w-4 h-4 ${tierDisplay.color}`} />
        <span className={`text-sm font-semibold ${tierDisplay.color}`}>
          {tierDisplay.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`${tierDisplay.bg} rounded-xl p-6 border ${tierDisplay.border} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 ${tierDisplay.bg} rounded-full flex items-center justify-center border-2 ${tierDisplay.border}`}>
          <Icon className={`w-6 h-6 ${tierDisplay.color}`} />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${tierDisplay.color}`}>
            {tierDisplay.label}
          </h3>
          <p className="text-sm text-airbnb-grey-600">
            Trusted by FutureEdge
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {responseRate !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
              <TrendingUp className="w-4 h-4" />
              <span>Response Rate</span>
            </div>
            <span className={`font-semibold ${tierDisplay.color}`}>
              {responseRate}%
            </span>
          </div>
        )}

        {responseTimeHours !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
              <Clock className="w-4 h-4" />
              <span>Response Time</span>
            </div>
            <span className="font-semibold text-airbnb-grey-900">
              {responseTimeHours < 1
                ? 'Within 1 hour'
                : `${responseTimeHours} hours`}
            </span>
          </div>
        )}

        {repeatBookingRate !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-airbnb-grey-700">
              <Users className="w-4 h-4" />
              <span>Repeat Bookings</span>
            </div>
            <span className={`font-semibold ${tierDisplay.color}`}>
              {repeatBookingRate}%
            </span>
          </div>
        )}

        {yearsOnPlatform !== undefined && (
          <div className="pt-3 border-t border-airbnb-grey-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-airbnb-grey-900">
                  {yearsOnPlatform}
                </div>
                <div className="text-xs text-airbnb-grey-600">
                  {yearsOnPlatform === 1 ? 'Year' : 'Years'} on Platform
                </div>
              </div>
              {totalCampersServed !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-airbnb-grey-900">
                    {totalCampersServed.toLocaleString()}
                  </div>
                  <div className="text-xs text-airbnb-grey-600">
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
