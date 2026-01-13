import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import * as Icons from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  color_theme: string;
}

interface InterestsQuestionProps {
  name?: string;
  value?: string[];
  onChange: (interests: string[]) => void;
}

export function InterestsQuestion({ name = 'your child', value = [], onChange }: InterestsQuestionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(value);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('camp_categories')
        .select('id, name, slug, icon_name, color_theme')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback with consistent structure
      setCategories([
        { id: 'sports', name: 'Sports & Adventure', slug: 'sports', icon_name: 'Dumbbell', color_theme: 'blue' },
        { id: 'arts', name: 'Arts & Creativity', slug: 'arts', icon_name: 'Palette', color_theme: 'purple' },
        { id: 'stem', name: 'STEM & Technology', slug: 'stem', icon_name: 'Microscope', color_theme: 'green' },
        { id: 'language', name: 'Language & Culture', slug: 'language', icon_name: 'Globe', color_theme: 'orange' },
        { id: 'academic', name: 'Academic Enrichment', slug: 'academic', icon_name: 'BookOpen', color_theme: 'indigo' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (categoryId: string) => {
    let newInterests: string[];

    if (selectedInterests.includes(categoryId)) {
      newInterests = selectedInterests.filter((id) => id !== categoryId);
    } else {
      if (selectedInterests.length < 3) {
        newInterests = [...selectedInterests, categoryId];
      } else {
        newInterests = [...selectedInterests.slice(1), categoryId];
      }
    }

    setSelectedInterests(newInterests);
    onChange(newInterests);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  const getColorClasses = (colorTheme: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
      blue: { bg: 'bg-blue-50', shadow: 'border-blue-200', border: isSelected ? 'border-blue-500' : 'border-blue-200', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-50', shadow: 'border-purple-200', border: isSelected ? 'border-purple-500' : 'border-purple-200', text: 'text-purple-600' },
      green: { bg: 'bg-green-50', shadow: 'border-green-200', border: isSelected ? 'border-green-500' : 'border-green-200', text: 'text-green-600' },
      orange: { bg: 'bg-orange-50', shadow: 'border-orange-200', border: isSelected ? 'border-orange-500' : 'border-orange-200', text: 'text-orange-600' },
      indigo: { bg: 'bg-indigo-50', shadow: 'border-indigo-200', border: isSelected ? 'border-indigo-500' : 'border-indigo-200', text: 'text-indigo-600' },
      pink: { bg: 'bg-pink-50', shadow: 'border-pink-200', border: isSelected ? 'border-pink-500' : 'border-pink-200', text: 'text-pink-600' },
    };
    return colorMap[colorTheme] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-8 border-airbnb-pink-100 border-t-airbnb-pink-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pt-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.id);
          const IconComponent = getIconComponent(category.icon_name);
          const colors = getColorClasses(category.color_theme, isSelected);

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInterest(category.id)}
              className={`
                relative flex flex-col items-center justify-center
                aspect-square p-6 rounded-[2rem]
                border-2 ${colors.border} border-b-[8px]
                transition-all duration-100
                ${isSelected ? `${colors.bg} ${colors.shadow}` : 'bg-white hover:bg-airbnb-grey-50'}
                active:border-b-2
              `}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#58cc02] border-4 border-white flex items-center justify-center shadow-lg z-10"
                  >
                    <Check className="w-6 h-6 text-white stroke-[4px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`mb-4 ${isSelected ? colors.text : 'text-airbnb-grey-400'}`}>
                <IconComponent className="w-16 h-16" strokeWidth={2} />
              </div>
              <h3 className="text-sm md:text-lg font-black text-airbnb-grey-900 text-center leading-tight uppercase tracking-tight">
                {category.name}
              </h3>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedInterests.length === 3 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-black text-airbnb-pink-600 uppercase tracking-widest text-sm"
          >
            Maximum reached! Tap one to swap.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
