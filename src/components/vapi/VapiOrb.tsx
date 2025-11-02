import type { OrbState } from '../../types/vapi';

interface VapiOrbProps {
  state: OrbState;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function VapiOrb({ state, size = 'large', className = '' }: VapiOrbProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48 sm:w-64 sm:h-64',
  };

  const getStateClasses = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse-fast';
      case 'speaking':
        return 'animate-heartbeat';
      case 'thinking':
        return 'animate-pulse-fast'; // Use pulse animation instead of shimmer to keep orb fixed
      case 'error':
        return 'animate-pulse-error';
      case 'idle':
      default:
        return 'animate-pulse-slow';
    }
  };

  const getOrbColor = () => {
    switch (state) {
      case 'error':
        return 'from-red-500 to-red-600';
      case 'thinking':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-[#FF385C] to-[#E31C5F]';
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'error':
        return 'bg-red-300';
      case 'thinking':
        return 'bg-purple-300';
      default:
        return 'bg-[#FFE8EA]';
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Main orb */}
      <div
        className={`
          absolute inset-0 rounded-full
          bg-gradient-to-br ${getOrbColor()}
          shadow-lg ${getStateClasses()}
          transition-all duration-300
        `}
      />

      {/* Inner highlight */}
      <div
        className={`
          absolute top-[15%] left-[20%]
          w-[30%] h-[30%]
          rounded-full
          bg-white/30
          blur-md
          ${state !== 'idle' ? 'opacity-100' : 'opacity-50'}
          transition-opacity duration-300
        `}
      />

      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-full
          ${getGlowColor()}
          ${state === 'idle' ? 'opacity-20' : 'opacity-40'}
          ${state === 'speaking' || state === 'listening' ? 'blur-2xl' : 'blur-xl'}
          ${getStateClasses()}
          transition-all duration-300
        `}
      />

      {/* Outer ring for active states */}
      {(state === 'listening' || state === 'speaking') && (
        <div
          className={`
            absolute inset-0 rounded-full
            border-4 border-[#FF385C]/30
            ${state === 'listening' ? 'animate-ping-slow' : 'animate-spin-slow'}
          `}
        />
      )}

      {/* Center indicator */}
      <div
        className={`
          absolute top-1/2 left-1/2
          transform -translate-x-1/2 -translate-y-1/2
          w-4 h-4 sm:w-6 sm:h-6
          rounded-full
          bg-white
          ${state === 'speaking' ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
      />
    </div>
  );
}
