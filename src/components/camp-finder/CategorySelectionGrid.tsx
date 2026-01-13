import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type Category = Database['public']['Tables']['camp_categories']['Row'];

interface CategorySelectionGridProps {
  selected: string[];
  onSelectionChange: (categoryIds: string[]) => void;
  maxSelections?: number;
}

export function CategorySelectionGrid({
  selected,
  onSelectionChange,
  maxSelections = 3,
}: CategorySelectionGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selected);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('camp_categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if fetch fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (categoryId: string) => {
    let newSelection: string[];

    if (selectedCategories.includes(categoryId)) {
      // Deselect
      newSelection = selectedCategories.filter((id) => id !== categoryId);
    } else {
      // Select (if under max limit)
      if (selectedCategories.length >= maxSelections) {
        // Already at max, don't add
        return;
      }
      newSelection = [...selectedCategories, categoryId];
    }

    setSelectedCategories(newSelection);
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#fe4d39] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        role="group"
        aria-label="Select up to 3 interests"
      >
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const isAtMaxLimit =
            selectedCategories.length >= maxSelections && !isSelected;

          return (
            <button
              key={category.id}
              onClick={() => handleToggle(category.id)}
              disabled={isAtMaxLimit}
              className={`
                relative aspect-square rounded-2xl
                border-2 transition-all duration-200
                flex flex-col items-center justify-center
                p-4 gap-2 min-h-[120px]
                ${
                  isSelected
                    ? 'bg-[#dcfce7] border-[#58cc02] shadow-lg scale-[1.02]'
                    : isAtMaxLimit
                    ? 'bg-white border-[#DDDDDD] opacity-50 cursor-not-allowed'
                    : 'bg-white border-[#DDDDDD] hover:border-[#fe4d39] hover:bg-[#FFE8EA] active:scale-95'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${category.name}`}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#58cc02] rounded-full border-3 border-white flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Category icon (emoji or icon name) */}
              <div className="text-3xl">
                {category.icon_name || '🎯'}
              </div>

              {/* Category name */}
              <span
                className={`
                  text-sm font-medium text-center leading-tight
                  ${isSelected ? 'text-[#222222]' : 'text-[#222222]'}
                `}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection counter */}
      <div className="text-sm text-center text-[#717171]">
        {selectedCategories.length === 0 ? (
          <span>Select up to {maxSelections} interests</span>
        ) : (
          <span>
            {selectedCategories.length} of {maxSelections} selected
            {selectedCategories.length === maxSelections && (
              <span className="text-[#58cc02] font-medium ml-1">✓</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
