import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, X, DollarSign } from 'lucide-react';
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

    // Filter out camps that have already started
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    const campStartDate = camp.start_date ? new Date(camp.start_date) : null;
    const isNotStarted = !campStartDate || campStartDate >= today;

    return matchesSearch && matchesAge && matchesCategory && matchesLocation && isNotStarted;
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

  const activeFilterCount = (ageFilter ? 1 : 0) + selectedCategories.length + selectedLocations.length + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-airbnb-grey-50">
      {/* Filter Header */}
      <div className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">

          {/* Row 1: Title + Currency */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Find the perfect experience for your child
            </h1>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-sm font-medium backdrop-blur-sm"
                title="Change currency"
              >
                <DollarSign className="w-4 h-4" />
                <span>{userCurrency}</span>
              </button>
              {showCurrencyMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyMenu(false)} />
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

          {/* Row 2: Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search camps by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/20 hover:bg-white/25 focus:bg-white/30 text-white placeholder-white/60 rounded-xl text-sm outline-none transition-all border border-white/20 focus:border-white/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row 3: Age filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Child's age</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age) => {
                const isSelected = ageFilter === age.toString();
                return (
                  <button
                    key={age}
                    onClick={() => setAgeFilter(isSelected ? '' : age.toString())}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-all flex-shrink-0 flex items-center justify-center ${
                      isSelected
                        ? 'bg-white text-airbnb-pink-600 shadow-md scale-110'
                        : 'bg-white/20 text-white hover:bg-white/35 hover:scale-105'
                    }`}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Category filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Category</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.slug);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.slug)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? 'bg-white text-airbnb-pink-600 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/35'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}{category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Location filter */}
          {uniqueLocations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Location</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                {uniqueLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location);
                  return (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? 'bg-white text-airbnb-pink-600 shadow-md'
                          : 'bg-white/20 text-white hover:bg-white/35'
                      }`}
                    >
                      {isSelected && <span className="mr-1">✓</span>}{location}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active filter summary + clear */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/20">
              <p className="text-xs text-white/80">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                {ageFilter && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full">Age {ageFilter}</span>}
                {selectedCategories.map(s => (
                  <span key={s} className="ml-1 bg-white/20 px-2 py-0.5 rounded-full">{categories.find(c => c.slug === s)?.name}</span>
                ))}
                {selectedLocations.map(l => (
                  <span key={l} className="ml-1 bg-white/20 px-2 py-0.5 rounded-full">{l}</span>
                ))}
              </p>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
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
