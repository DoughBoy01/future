import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Check, Loader2 } from 'lucide-react';

interface LocationData {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
}

interface LocationPreferenceQuestionProps {
  value?: {
    type: 'nearby' | 'anywhere';
    location?: LocationData;
  };
  onChange: (preference: { type: 'nearby' | 'anywhere'; location?: LocationData }) => void;
  onSelect?: () => void;
}

export function LocationPreferenceQuestion({
  value,
  onChange,
  onSelect
}: LocationPreferenceQuestionProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);
  const [selectedType, setSelectedType] = useState<'nearby' | 'anywhere' | undefined>(value?.type);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [locationFailed, setLocationFailed] = useState(false);

  // Auto-detect user's location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country_name) {
          const location: LocationData = {
            country: data.country_name,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
          };
          setDetectedLocation(location);
          setLocationFailed(false);

          // If we have a previous value, restore it
          if (value?.location) {
            setDetectedLocation(value.location);
          }
        } else {
          setLocationFailed(true);
        }
      } catch (error) {
        console.log('Location detection not available');
        setLocationFailed(true);
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, []);

  const getLocationDisplay = (location: LocationData | null) => {
    if (!location) return 'your area';
    if (location.city && location.region) {
      return `${location.city}, ${location.region}`;
    }
    if (location.region) {
      return `${location.region}, ${location.country}`;
    }
    return location.country;
  };

  const handleTypeSelect = (type: 'nearby' | 'anywhere') => {
    setSelectedType(type);

    if (type === 'anywhere') {
      onChange({ type: 'anywhere' });
      setTimeout(() => onSelect?.(), 0);
    } else {
      // For "nearby", we need location data
      if (detectedLocation) {
        onChange({ type: 'nearby', location: detectedLocation });
      } else {
        // No location detected - show input form
        setShowLocationEdit(true);
      }
    }
  };

  const handleLocationConfirm = () => {
    if (customLocation.trim()) {
      // Parse custom location - simple approach: treat as city/region
      const newLocation: LocationData = {
        country: detectedLocation?.country || 'Unknown',
        countryCode: detectedLocation?.countryCode || 'XX',
        city: customLocation.trim(),
      };
      setDetectedLocation(newLocation);
      onChange({ type: 'nearby', location: newLocation });
    }
    setShowLocationEdit(false);
  };

  // Show loading state while detecting
  if (isDetecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-airbnb-pink-500 animate-spin" />
        <p className="text-airbnb-grey-500 font-bold">Finding your location...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4">
      {/* Detected Location Display */}
      {detectedLocation && !selectedType && !showLocationEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-green-50 border-2 border-green-200 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Your location</p>
                <p className="text-lg font-black text-green-800">{getLocationDisplay(detectedLocation)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationEdit(true)}
              className="text-sm font-bold text-green-700 hover:text-green-900 underline"
            >
              Change
            </button>
          </div>
        </motion.div>
      )}

      {/* Location Failed - Show input prompt */}
      {locationFailed && !detectedLocation && !showLocationEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Location needed</p>
                <p className="text-sm font-bold text-amber-800">We couldn't detect your location automatically</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationEdit(true)}
              className="text-sm font-bold text-amber-700 hover:text-amber-900 underline"
            >
              Enter location
            </button>
          </div>
        </motion.div>
      )}

      {/* Location Edit Modal */}
      <AnimatePresence>
        {showLocationEdit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-white border-2 border-airbnb-grey-200 rounded-2xl space-y-4"
          >
            <p className="text-sm font-bold text-airbnb-grey-600">Enter your city or region:</p>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g. San Francisco, London, Sydney..."
              className="w-full px-4 py-3 border-2 border-airbnb-grey-200 rounded-xl font-medium focus:border-airbnb-pink-500 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationEdit(false)}
                className="flex-1 px-4 py-2 text-airbnb-grey-600 font-bold rounded-xl hover:bg-airbnb-grey-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationConfirm}
                disabled={!customLocation.trim()}
                className="flex-1 px-4 py-2 bg-airbnb-pink-500 text-white font-bold rounded-xl hover:bg-airbnb-pink-600 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Nearby Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTypeSelect('nearby')}
          className={`
            relative flex flex-col items-start p-8 rounded-[2rem]
            border-2 border-b-[8px] transition-all duration-100
            ${selectedType === 'nearby'
              ? 'bg-airbnb-pink-50 border-airbnb-pink-500 border-b-airbnb-pink-700'
              : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50'
            }
          `}
        >
          <AnimatePresence>
            {selectedType === 'nearby' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-airbnb-pink-600 border-4 border-white flex items-center justify-center shadow-lg z-10"
              >
                <Check className="w-6 h-6 text-white stroke-[4px]" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mb-6 shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-1 text-left">
            <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
              Camps Near Me
            </h3>
            <p className="text-airbnb-grey-400 font-bold text-sm leading-relaxed">
              {detectedLocation
                ? `Find camps in ${getLocationDisplay(detectedLocation)}`
                : 'Find camps in your local area'}
            </p>
          </div>
        </motion.button>

        {/* Anywhere Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTypeSelect('anywhere')}
          className={`
            relative flex flex-col items-start p-8 rounded-[2rem]
            border-2 border-b-[8px] transition-all duration-100
            ${selectedType === 'anywhere'
              ? 'bg-airbnb-pink-50 border-airbnb-pink-500 border-b-airbnb-pink-700'
              : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50'
            }
          `}
        >
          <AnimatePresence>
            {selectedType === 'anywhere' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-airbnb-pink-600 border-4 border-white flex items-center justify-center shadow-lg z-10"
              >
                <Check className="w-6 h-6 text-white stroke-[4px]" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mb-6 shadow-md">
            <Globe className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-1 text-left">
            <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
              Open to Anywhere
            </h3>
            <p className="text-airbnb-grey-400 font-bold text-sm leading-relaxed">
              Show me the best camps, wherever they are
            </p>
          </div>
        </motion.button>
      </div>

      {/* Info box */}
      <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">💡</div>
        <p className="text-sm text-blue-800 font-bold leading-relaxed">
          {selectedType === 'nearby'
            ? `We'll prioritize camps near ${getLocationDisplay(detectedLocation)} and include options within reasonable travel distance.`
            : 'We\'ll show you the best camps based on your other preferences - perfect for families open to travel or exploring summer programs abroad.'}
        </p>
      </div>
    </div>
  );
}
