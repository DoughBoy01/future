import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Check } from 'lucide-react';

interface LocationPreferenceQuestionProps {
  name?: string;
  value?: {
    type: 'local' | 'international';
    county?: string;
  };
  onChange: (preference: { type: 'local' | 'international'; county?: string }) => void;
  onSelect?: () => void;
}

// Irish counties for selection
const IRISH_COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin',
  'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim',
  'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan',
  'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
  'Wexford', 'Wicklow'
];

export function LocationPreferenceQuestion({
  name = 'your child',
  value,
  onChange,
  onSelect
}: LocationPreferenceQuestionProps) {
  const [locationType, setLocationType] = useState<'local' | 'international' | undefined>(value?.type);
  const [selectedCounty, setSelectedCounty] = useState<string | undefined>(value?.county);
  const [detectedCounty, setDetectedCounty] = useState<string | null>(null);

  // Attempt to detect location via IP (optional enhancement)
  useEffect(() => {
    // This is a placeholder for IP-based location detection
    // You could integrate with a service like ipapi.co or ipgeolocation.io
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        // Check if the user is in Ireland
        if (data.country === 'IE' && data.region) {
          // Map region to county if possible
          const region = data.region;
          // Check if region matches any of our counties
          const matchedCounty = IRISH_COUNTIES.find(
            county => county.toLowerCase() === region.toLowerCase()
          );
          if (matchedCounty) {
            setDetectedCounty(matchedCounty);
          }
        }
      } catch (error) {
        // Silently fail - location detection is optional
        console.log('Location detection not available');
      }
    };

    if (!value?.county && !selectedCounty) {
      detectLocation();
    }
  }, [value?.county, selectedCounty]);

  const handleLocationTypeSelect = (type: 'local' | 'international') => {
    setLocationType(type);

    if (type === 'international') {
      // Auto-advance for international camps
      onChange({ type: 'international' });
      setTimeout(() => {
        onSelect?.();
      }, 0);
    } else {
      // For local, we need county selection
      // If we detected a county, pre-select it
      if (detectedCounty && !selectedCounty) {
        setSelectedCounty(detectedCounty);
        onChange({ type: 'local', county: detectedCounty });
      } else if (selectedCounty) {
        onChange({ type: 'local', county: selectedCounty });
      }
    }
  };

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    onChange({ type: 'local', county });
  };

  const locationOptions = [
    {
      key: 'local',
      label: 'Local Camps',
      description: 'Find camps near you in Ireland',
      icon: MapPin,
      color: 'from-green-400 to-emerald-400',
    },
    {
      key: 'international',
      label: 'International Camps',
      description: 'Explore camps around the world',
      icon: Globe,
      color: 'from-blue-400 to-purple-400',
    },
  ];

  return (
    <div className="space-y-10 pt-4">
      {/* Step 1: Choose Local or International */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {locationOptions.map((option) => {
          const isSelected = locationType === option.key;
          const IconComponent = option.icon;

          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={option.key}
              onClick={() => handleLocationTypeSelect(option.key as 'local' | 'international')}
              className={`
                relative flex flex-col items-start
                p-8 rounded-[2rem]
                border-2 border-b-[8px] transition-all duration-100
                ${isSelected
                  ? 'bg-airbnb-pink-50 border-airbnb-pink-500 border-b-airbnb-pink-700 active:border-b-2'
                  : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50 active:border-b-2'
                }
              `}
            >
              <AnimatePresence>
                {isSelected && (
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

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-6 shadow-md`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1 text-left">
                <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
                  {option.label}
                </h3>
                <p className="text-airbnb-grey-400 font-bold text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Step 2: If Local, show county selection */}
      <AnimatePresence>
        {locationType === 'local' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px bg-airbnb-grey-200 flex-1" />
              <span className="text-sm font-black text-airbnb-grey-400 uppercase tracking-widest">
                Select Your County
              </span>
              <div className="h-px bg-airbnb-grey-200 flex-1" />
            </div>

            {detectedCounty && !selectedCounty && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border-2 border-green-100 rounded-2xl flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-bold">
                    We detected you're in <strong>{detectedCounty}</strong>. Select it below or choose another county.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {IRISH_COUNTIES.map((county) => {
                const isSelected = selectedCounty === county;
                const isDetected = detectedCounty === county;

                return (
                  <motion.button
                    key={county}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCountySelect(county)}
                    className={`
                      relative flex items-center justify-center
                      px-4 py-3 rounded-xl font-bold text-sm
                      transition-all duration-100
                      ${isSelected
                        ? 'bg-airbnb-pink-50 text-airbnb-pink-600 border-2 border-airbnb-pink-500 border-b-[4px] active:border-b-2'
                        : isDetected
                        ? 'bg-green-50 text-green-700 border-2 border-green-300 border-b-[4px] hover:bg-green-100 active:border-b-2'
                        : 'bg-white text-airbnb-grey-700 border-2 border-airbnb-grey-200 border-b-[4px] hover:bg-airbnb-grey-50 active:border-b-2'
                      }
                    `}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 mr-1 stroke-[3px]" />
                    )}
                    {county}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info box */}
      <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">💡</div>
        <p className="text-sm text-blue-800 font-bold leading-relaxed">
          {locationType === 'local'
            ? 'We\'ll prioritize camps in your county and nearby areas for the best matches.'
            : 'Don\'t worry! We\'ll show you the best camps tailored to your preferences, wherever they are.'}
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
