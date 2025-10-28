import { BadgeCheck, Star, MessageSquare, Clock, Award } from 'lucide-react';

interface Organisation {
  id: string;
  name: string;
  logo_url?: string;
  about?: string;
  verified: boolean;
  response_rate: number;
  response_time_hours: number;
  total_camps_hosted: number;
  established_year?: number;
}

interface HostInformationProps {
  organisation: Organisation;
  onContactClick: () => void;
}

export function HostInformation({ organisation, onContactClick }: HostInformationProps) {
  const currentYear = new Date().getFullYear();
  const yearsInOperation = organisation.established_year
    ? currentYear - organisation.established_year
    : null;

  const getResponseTimeText = (hours: number) => {
    if (hours < 1) return 'within minutes';
    if (hours === 1) return 'within an hour';
    if (hours < 24) return `within ${hours} hours`;
    const days = Math.floor(hours / 24);
    return `within ${days} ${days === 1 ? 'day' : 'days'}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hosted by {organisation.name}</h2>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          {organisation.logo_url ? (
            <img
              src={organisation.logo_url}
              alt={organisation.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl">
              {organisation.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{organisation.name}</h3>
            {organisation.verified && (
              <div className="flex items-center gap-1 text-blue-600" title="Verified Organization">
                <BadgeCheck className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {organisation.response_rate > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{organisation.response_rate}% response rate</span>
              </div>
            )}
            {organisation.response_time_hours > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Responds {getResponseTimeText(organisation.response_time_hours)}</span>
              </div>
            )}
            {organisation.total_camps_hosted > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span>{organisation.total_camps_hosted} camps hosted</span>
              </div>
            )}
            {yearsInOperation && (
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span>{yearsInOperation}+ years experience</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {organisation.about && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{organisation.about}</p>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={onContactClick}
          className="w-full md:w-auto px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Contact Host
        </button>
      </div>

      {organisation.verified && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Verified Organization</h4>
              <p className="text-sm text-gray-600">
                This organization has been verified by our team. They've completed identity verification,
                provided necessary certifications, and maintain high standards of safety and quality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
