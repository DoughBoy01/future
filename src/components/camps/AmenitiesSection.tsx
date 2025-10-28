import {
  Wifi,
  Utensils,
  Car,
  Wind,
  Shield,
  Heart,
  Camera,
  Users,
  Droplet,
  Sun,
  Zap,
  CheckCircle
} from 'lucide-react';

interface Amenity {
  category: string;
  items: string[];
}

interface AmenitiesSectionProps {
  amenities: Amenity[];
}

const iconMap: Record<string, any> = {
  wifi: Wifi,
  food: Utensils,
  parking: Car,
  aircon: Wind,
  safety: Shield,
  health: Heart,
  photos: Camera,
  groups: Users,
  water: Droplet,
  outdoor: Sun,
  equipment: Zap,
};

const getIconForAmenity = (amenity: string): any => {
  const lowerAmenity = amenity.toLowerCase();

  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
  if (lowerAmenity.includes('food') || lowerAmenity.includes('lunch') || lowerAmenity.includes('snack') || lowerAmenity.includes('meal')) return Utensils;
  if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return Car;
  if (lowerAmenity.includes('air') || lowerAmenity.includes('conditioned') || lowerAmenity.includes('cooling')) return Wind;
  if (lowerAmenity.includes('safety') || lowerAmenity.includes('secure') || lowerAmenity.includes('cctv') || lowerAmenity.includes('emergency')) return Shield;
  if (lowerAmenity.includes('first aid') || lowerAmenity.includes('medical') || lowerAmenity.includes('health')) return Heart;
  if (lowerAmenity.includes('photo') || lowerAmenity.includes('picture')) return Camera;
  if (lowerAmenity.includes('group') || lowerAmenity.includes('ratio') || lowerAmenity.includes('staff')) return Users;
  if (lowerAmenity.includes('water') || lowerAmenity.includes('pool') || lowerAmenity.includes('swim')) return Droplet;
  if (lowerAmenity.includes('outdoor') || lowerAmenity.includes('playground') || lowerAmenity.includes('field')) return Sun;
  if (lowerAmenity.includes('equipment') || lowerAmenity.includes('materials') || lowerAmenity.includes('supplies')) return Zap;

  return CheckCircle;
};

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What this camp offers</h2>

      <div className="space-y-8">
        {amenities.map((amenityGroup, groupIndex) => {
          if (!amenityGroup || !amenityGroup.items || !Array.isArray(amenityGroup.items) || amenityGroup.items.length === 0) {
            return null;
          }

          return (
            <div key={groupIndex}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{amenityGroup.category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenityGroup.items.map((item, itemIndex) => {
                  const Icon = getIconForAmenity(item);
                  return (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
