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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setAgeFilter('');
    setSearchParams({});
  };

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

    return matchesSearch && matchesAge && matchesCategory;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading camps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Explore Activity Camps</h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100">
            Find the perfect camp experience for your child from {camps.length} available options
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search Camps
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Age
                </label>
                <input
                  type="number"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  placeholder="Enter age..."
                  min="5"
                  max="18"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Categories
                </label>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.slug);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                      {isSelected && <X className="w-3 h-3 inline ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategories.map((slug) => {
                  const category = categories.find(c => c.slug === slug);
                  return category ? (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {category.name}
                      <button
                        onClick={() => toggleCategory(slug)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {filteredCamps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No camps found matching your criteria.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCamps.map((camp) => (
              <Link
                key={camp.id}
                to={`/camps/${camp.id}`}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                  {camp.featured_image_url ? (
                    <img
                      src={camp.featured_image_url}
                      alt={camp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                    </div>
                  )}
                  {camp.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {camp.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      Ages {camp.age_min}-{camp.age_max}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {camp.name}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {camp.description}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(camp.start_date)} - {formatDate(camp.end_date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {camp.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      Capacity: {camp.capacity}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${camp.price}
                      </div>
                      {camp.early_bird_price && camp.early_bird_deadline && new Date(camp.early_bird_deadline) > new Date() && (
                        <div className="text-xs text-green-600 font-medium">
                          Early bird: ${camp.early_bird_price}
                        </div>
                      )}
                    </div>
                    <span className="text-sm sm:text-base text-blue-600 font-medium group-hover:underline">
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
