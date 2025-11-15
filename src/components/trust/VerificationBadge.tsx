import { CheckCircle, Shield, Star, Crown } from 'lucide-react';
import type { VerificationLevel } from '../../types/verification';
import { VERIFICATION_LEVELS } from '../../types/verification';

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  className?: string;
}

export function VerificationBadge({
  level,
  size = 'medium',
  showTooltip = true,
  className = '',
}: VerificationBadgeProps) {
  if (level === 'unverified') return null;

  const config = VERIFICATION_LEVELS[level];

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const iconSize = sizeClasses[size];

  const getIcon = () => {
    switch (level) {
      case 'verified':
        return <CheckCircle className={iconSize} />;
      case 'premium':
        return <Shield className={iconSize} />;
      case 'elite':
        return <Crown className={iconSize} />;
      default:
        return <CheckCircle className={iconSize} />;
    }
  };

  const getColorClasses = () => {
    switch (config.color) {
      case 'green':
        return 'bg-trust-success-50 text-trust-success-700 border-trust-success-200';
      case 'blue':
        return 'bg-trust-verified-50 text-trust-verified-700 border-trust-verified-200';
      case 'gold':
        return 'bg-trust-elite-50 text-trust-elite-700 border-trust-elite-200';
      default:
        return 'bg-airbnb-grey-100 text-airbnb-grey-700 border-airbnb-grey-300';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border ${getColorClasses()} font-medium text-xs sm:text-sm ${className} group relative shrink-0`}>
      {getIcon()}
      <span className="whitespace-nowrap">{config.label}</span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-airbnb-grey-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-44 sm:w-48 max-w-[90vw] text-center z-20 pointer-events-none">
          {config.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-airbnb-grey-900"></div>
        </div>
      )}
    </div>
  );
}
