import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

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

  const IconComponent = (Icons as Record<string, LucideIcon>)[iconName] || Icons.Tag;

  const handleClick = () => {
    navigate(`/camps?category=${slug}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.hover} p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left w-full`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`${colors.icon} transform group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
        </div>

        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-2`}>
            {name}
          </h3>
          <p className={`text-sm sm:text-base ${colors.text} opacity-80`}>
            {description}
          </p>
        </div>

        <div className={`absolute top-0 right-0 w-32 h-32 ${colors.icon} opacity-5 transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}>
          <IconComponent className="w-full h-full" strokeWidth={1} />
        </div>
      </div>
    </button>
  );
}
