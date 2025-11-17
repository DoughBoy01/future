import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, X, DollarSign, MapPin } from 'lucide-react';
import { getConvertedPrice, detectUserCurrency, getPopularCurrencies, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../lib/currency';
import { CampCard } from '../components/home/CampCard';
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
  const [userCurrency, setUserCurrency] = useState<string>(() => {
    // Try to get saved currency preference or detect from browser
    return localStorage.getItem('preferredCurrency') || detectUserCurrency();
  });
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

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

  const handleCurrencyChange = (currency: string) => {
    setUserCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
    setShowCurrencyMenu(false);
    // Dispatch custom event to notify other components immediately
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
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
          {/* Header Title with Currency Selector */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Explore the perfect experiences for your child
            </h1>

            {/* Currency Selector - Subtle and non-intrusive */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-sm font-medium backdrop-blur-sm"
                title="Change currency"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">{userCurrency}</span>
              </button>

              {/* Currency Dropdown Menu */}
              {showCurrencyMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCurrencyMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="p-2 bg-airbnb-grey-50 border-b border-airbnb-grey-200">
                      <p className="text-xs font-medium text-airbnb-grey-600 px-2">Display prices in:</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {getPopularCurrencies().map((currency) => (
                        <button
                          key={currency}
                          onClick={() => handleCurrencyChange(currency)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-airbnb-grey-50 transition-colors flex items-center justify-between ${
                            userCurrency === currency ? 'bg-airbnb-pink-50 text-airbnb-pink-600 font-medium' : 'text-airbnb-grey-900'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-xs w-8">{CURRENCY_SYMBOLS[currency]}</span>
                            <span>{currency}</span>
                          </span>
                          <span className="text-xs text-airbnb-grey-500">{CURRENCY_NAMES[currency]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 bg-airbnb-grey-50 border-t border-airbnb-grey-200">
                      <p className="text-xs text-airbnb-grey-500 px-2">Prices are estimates. Check with organizer for exact rates.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

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
            {filteredCamps.map((camp) => {
              const enrolledCount = (camp as any).enrolled_count || 0;
              const spotsRemaining = camp.capacity - enrolledCount;
              const earlyBirdActive = camp.early_bird_price &&
                camp.early_bird_deadline &&
                new Date(camp.early_bird_deadline) > new Date();

              return (
                <CampCard
                  key={camp.id}
                  id={camp.id}
                  badge={spotsRemaining <= 5 ? ('Limited' as const) :
                         camp.featured ? ('Popular' as const) :
                         ('New' as const)}
                  image={camp.featured_image_url || 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  location={camp.location}
                  rating={0}
                  reviewCount={0}
                  title={camp.name}
                  category={camp.category}
                  ageRange={`Ages ${camp.age_min}-${camp.age_max}`}
                  ageMin={camp.age_min}
                  ageMax={camp.age_max}
                  price={earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price}
                  currency={camp.currency}
                  originalPrice={earlyBirdActive && camp.early_bird_price ? camp.price : undefined}
                  spotsRemaining={spotsRemaining}
                  startDate={camp.start_date}
                  endDate={camp.end_date}
                  description={camp.description || undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
