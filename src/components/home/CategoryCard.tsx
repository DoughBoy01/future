import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  colorTheme: string;
}

const colorMap: Record<string, { bg: string; hover: string; border: string; text: string; icon: string }> = {
  blue: {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'text-blue-600'
  },
  indigo: {
    bg: 'bg-sky-50',
    hover: 'hover:bg-sky-100',
    border: 'border-sky-200',
    text: 'text-sky-900',
    icon: 'text-sky-600'
  },
  green: {
    bg: 'bg-green-50',
    hover: 'hover:bg-green-100',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-600'
  },
  pink: {
    bg: 'bg-pink-50',
    hover: 'hover:bg-pink-100',
    border: 'border-pink-200',
    text: 'text-pink-900',
    icon: 'text-pink-600'
  },
  orange: {
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-900',
    icon: 'text-orange-600'
  },
  purple: {
    bg: 'bg-violet-50',
    hover: 'hover:bg-violet-100',
    border: 'border-violet-200',
    text: 'text-violet-900',
    icon: 'text-violet-600'
  },
  teal: {
    bg: 'bg-teal-50',
    hover: 'hover:bg-teal-100',
    border: 'border-teal-200',
    text: 'text-teal-900',
    icon: 'text-teal-600'
  },
  amber: {
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-600'
  }
};

export function CategoryCard({ name, slug, description, iconName, colorTheme }: CategoryCardProps) {
  const navigate = useNavigate();
  const colors = colorMap[colorTheme] || colorMap.blue;
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement>(null);

  const IconComponent = (Icons as Record<string, LucideIcon>)[iconName] || Icons.Tag;

  const handleClick = () => {
    navigate(`/camps?category=${slug}`);
  };

  // Magnetic cursor effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.hover} p-6 sm:p-8 transition-all duration-500 text-left w-full ${isHovered ? 'shadow-2xl scale-110 -translate-y-1' : 'shadow-lg scale-100 translate-y-0'}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Animated gradient background on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.3) 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles effect */}
      {isHovered && (
        <>
          <div className={`absolute w-2 h-2 rounded-full ${colors.icon} opacity-40 animate-ping`}
               style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
          <div className={`absolute w-1.5 h-1.5 rounded-full ${colors.icon} opacity-30 animate-ping`}
               style={{ top: '60%', right: '20%', animationDelay: '0.3s' }} />
          <div className={`absolute w-2.5 h-2.5 rounded-full ${colors.icon} opacity-35 animate-ping`}
               style={{ bottom: '25%', left: '25%', animationDelay: '0.6s' }} />
        </>
      )}

      <div className="flex flex-col items-center text-center space-y-4 relative z-10">
        {/* Enhanced icon with 3D rotation effect */}
        <div
          className={`${colors.icon} transform transition-all duration-500 ${isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}`}
          style={{
            transform: isHovered
              ? `scale(1.25) rotateY(${(mousePosition.x - 50) / 10}deg) rotateX(${(50 - mousePosition.y) / 10}deg)`
              : 'scale(1) rotateY(0) rotateX(0)',
          }}
        >
          <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg" strokeWidth={1.5} />
        </div>

        {/* Content with staggered animation */}
        <div className="transition-all duration-300">
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-2 transition-all duration-300 ${isHovered ? 'scale-105 tracking-wide' : 'scale-100'}`}>
            {name}
          </h3>
          <p className={`text-sm sm:text-base ${colors.text} opacity-80 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
            {description}
          </p>
        </div>

        {/* Decorative background icon with enhanced animation */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 ${colors.icon} opacity-5 transform translate-x-8 -translate-y-8 transition-all duration-700 ${isHovered ? 'scale-[2] rotate-45 opacity-10' : 'scale-100 rotate-0 opacity-5'}`}
        >
          <IconComponent className="w-full h-full" strokeWidth={1} />
        </div>

        {/* Additional decorative icon bottom left */}
        <div
          className={`absolute bottom-0 left-0 w-24 h-24 ${colors.icon} opacity-5 transform -translate-x-6 translate-y-6 transition-all duration-700 ${isHovered ? 'scale-[2] -rotate-45 opacity-10' : 'scale-100 rotate-0 opacity-5'}`}
        >
          <IconComponent className="w-full h-full" strokeWidth={1} />
        </div>
      </div>

      {/* Shine effect overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 transition-all duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`}
        style={{ width: '50%' }}
      />
    </button>
  );
}
