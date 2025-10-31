import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, Calendar, MapPin, Users, X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];
type Category = Database['public']['Tables']['camp_categories']['Row'];

export function CampsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [ageFilter, setAgeFilter] = useState('');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [campsResponse, categoriesResponse, assignmentsResponse] = await Promise.all([
        supabase
          .from('camps')
          .select('*')
          .eq('status', 'published')
          .order('start_date', { ascending: true }),
        supabase
          .from('camp_categories')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('camp_category_assignments')
          .select('camp_id, category_id, camp_categories(slug)')
      ]);

      if (campsResponse.error) throw campsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (assignmentsResponse.error) throw assignmentsResponse.error;

      const campsWithCategories = (campsResponse.data || []).map(camp => ({
        ...camp,
        category_slugs: (assignmentsResponse.data || [])
          .filter(a => a.camp_id === camp.id)
          .map(a => (a.camp_categories as any)?.slug)
          .filter(Boolean)
      }));

      setCamps(campsWithCategories as any);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setAgeFilter('');
    setSearchParams({});
  };

  // Extract unique locations from camps
  const uniqueLocations = Array.from(new Set(camps.map(camp => camp.location))).sort();

  const filteredCamps = camps.filter((camp: any) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAge = !ageFilter || (
      parseInt(ageFilter) >= camp.age_min &&
      parseInt(ageFilter) <= camp.age_max
    );

    const matchesCategory = selectedCategories.length === 0 ||
      (camp.category_slugs && selectedCategories.some((slug: string) => camp.category_slugs.includes(slug)));

    const matchesLocation = selectedLocations.length === 0 ||
      selectedLocations.includes(camp.location);

    return matchesSearch && matchesAge && matchesCategory && matchesLocation;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-airbnb-grey-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-500 mx-auto mb-4"></div>
          <p className="text-airbnb-grey-600">Loading camps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-airbnb-grey-50">
      {/* Filters Header with Description */}
      <div className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Header Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Explore the perfect experiences for your child
          </h1>

          {/* Age Filter Pills & Clear Button */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-white/90 whitespace-nowrap">Age:</span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age) => {
                const isSelected = ageFilter === age.toString();
                return (
                  <button
                    key={age}
                    onClick={() => setAgeFilter(isSelected ? '' : age.toString())}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-airbnb whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? 'bg-white text-airbnb-pink-600 shadow-sm'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
            {(selectedCategories.length > 0 || selectedLocations.length > 0 || ageFilter) && (
              <button
                onClick={clearAllFilters}
                className="ml-auto px-3 py-1.5 text-xs text-white hover:bg-white/20 rounded-lg font-medium transition-standard whitespace-nowrap flex-shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Pills Row - Horizontal Scroll */}
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-white/90 flex-shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.slug);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-airbnb whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? 'bg-white text-airbnb-pink-600 shadow-sm'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Pills Row - Horizontal Scroll */}
          {uniqueLocations.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/90 flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {uniqueLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location);
                  return (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-airbnb whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? 'bg-white text-airbnb-pink-600 shadow-sm'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {location}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camp Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <p className="text-sm text-airbnb-grey-600 mb-6">
          {filteredCamps.length} {filteredCamps.length === 1 ? 'camp' : 'camps'} available
        </p>

        {filteredCamps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-airbnb-grey-600 text-lg">No camps found matching your criteria.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 text-airbnb-pink-500 hover:text-airbnb-pink-600 font-medium transition-standard"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredCamps.map((camp) => (
              <Link
                key={camp.id}
                to={`/camps/${camp.id}`}
                className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-airbnb overflow-hidden group hover:-translate-y-1"
              >
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-airbnb-pink-400 to-airbnb-pink-600 overflow-hidden">
                  {camp.featured_image_url ? (
                    <img
                      src={camp.featured_image_url}
                      alt={camp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                    </div>
                  )}
                  {camp.featured && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-airbnb-grey-100 text-airbnb-grey-700 rounded-full text-xs font-medium capitalize border border-airbnb-grey-200">
                      {camp.category}
                    </span>
                    <span className="text-sm text-airbnb-grey-500">
                      Ages {camp.age_min}-{camp.age_max}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-airbnb-grey-900 mb-2 group-hover:text-airbnb-pink-500 transition-standard">
                    {camp.name}
                  </h3>

                  <p className="text-airbnb-grey-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {camp.description}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-airbnb-grey-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-airbnb-grey-400" />
                      {formatDate(camp.start_date)} - {formatDate(camp.end_date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-airbnb-grey-400" />
                      {camp.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-airbnb-grey-400" />
                      Capacity: {camp.capacity}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-airbnb-grey-200 flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-airbnb-grey-900">
                        ${camp.price}
                      </div>
                      {camp.early_bird_price && camp.early_bird_deadline && new Date(camp.early_bird_deadline) > new Date() && (
                        <div className="text-xs text-green-600 font-medium">
                          Early bird: ${camp.early_bird_price}
                        </div>
                      )}
                    </div>
                    <span className="text-sm sm:text-base text-airbnb-pink-500 font-medium group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
