import { useState, useEffect } from 'react';
import { X, Search, Calendar, Users, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Camp {
  id: string;
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  capacity: number;
  featured_image_url?: string;
  average_rating?: number;
  review_count?: number;
}

interface CampSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamp: (camp: { id: string; name: string }) => void;
}

export function CampSelectionModal({ isOpen, onClose, onSelectCamp }: CampSelectionModalProps) {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCamps();
    }
  }, [isOpen]);

  async function loadCamps() {
    try {
      setLoading(true);
      const { data: campsData, error } = await supabase
        .from('camps')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      if (campsData) {
        const campsWithStats = await Promise.all(
          campsData.map(async (camp) => {
            const { data: feedbackData } = await supabase
              .from('feedback')
              .select('overall_rating')
              .eq('camp_id', camp.id);

            const reviewCount = feedbackData?.length || 0;
            const averageRating = reviewCount > 0
              ? feedbackData!.reduce((sum, f) => sum + f.overall_rating, 0) / reviewCount
              : 0;

            return {
              ...camp,
              review_count: reviewCount,
              average_rating: averageRating,
            };
          })
        );

        setCamps(campsWithStats);
      }
    } catch (error) {
      console.error('Error loading camps:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCamps = camps.filter((camp) =>
    camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCamp = (camp: Camp) => {
    onSelectCamp({ id: camp.id, name: camp.name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select a Camp</h2>
            <p className="text-sm text-gray-600 mt-1">Choose which camp to add a review for</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search camps by name or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCamps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No camps found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCamps.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => handleSelectCamp(camp)}
                  className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-4">
                    {camp.featured_image_url ? (
                      <img
                        src={camp.featured_image_url}
                        alt={camp.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {camp.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {camp.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize mt-1">{camp.category}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(camp.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{camp.capacity}</span>
                        </div>
                      </div>

                      {camp.review_count! > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium text-gray-900">
                              {camp.average_rating!.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({camp.review_count} {camp.review_count === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {camp.review_count === 0 && (
                        <p className="text-xs text-gray-400 mt-2">No reviews yet</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
