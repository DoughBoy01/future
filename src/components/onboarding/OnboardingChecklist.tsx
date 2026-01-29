import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingChecklist, OnboardingChecklistItem } from '../../services/onboardingService';

export function OnboardingChecklist() {
  const { user, organization } = useAuth();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<OnboardingChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChecklist() {
      if (!user?.id) return;

      try {
        const items = await getOnboardingChecklist(user.id);
        setChecklist(items);
      } catch (error) {
        console.error('Error loading onboarding checklist:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChecklist();
  }, [user]);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if everything is complete
  if (completionPercentage === 100) {
    return null;
  }

  const handleItemClick = (item: OnboardingChecklistItem) => {
    if (item.completed) return; // Don't navigate if already completed

    switch (item.id) {
      case 'organization_profile':
        navigate('/organizer/organization/profile');
        break;
      case 'first_camp':
        navigate('/onboarding/first-camp');
        break;
      case 'stripe_connection':
        // Navigate to Stripe Connect page or show instructions
        if (organization?.stripe_account_id) {
          window.open(`https://dashboard.stripe.com/connect/accounts/${organization.stripe_account_id}`, '_blank');
        } else {
          navigate('/organizer/settings/payments');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Get Started with Your Camp Business
        </h2>
        <p className="text-sm text-gray-600">
          Complete these 4 steps to go live and start accepting bookings
        </p>
      </div>

      {/* Progress Bar - Compact */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-700">
            {completedCount} of {totalCount} completed
          </span>
          <span className="text-xs font-bold text-pink-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-600 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items - Compact */}
      <div className="space-y-2">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.completed || !item.actionable}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
              item.completed
                ? 'bg-green-50 border-green-200'
                : item.actionable
                ? 'bg-white border-gray-200 hover:border-pink-300 hover:shadow cursor-pointer'
                : 'bg-gray-50 border-gray-100 opacity-60'
            }`}
          >
            {/* Icon - Smaller */}
            <div className="flex-shrink-0 mt-0.5">
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </div>

            {/* Content - Compact */}
            <div className="flex-1 text-left">
              <h3 className={`text-sm font-semibold ${
                item.completed ? 'text-green-900' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {item.description}
              </p>
            </div>

            {/* Action Arrow - Smaller */}
            {!item.completed && item.actionable && (
              <div className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-pink-600" />
              </div>
            )}

            {/* External Link for Stripe */}
            {!item.completed && item.id === 'stripe_connection' && organization?.stripe_account_id && (
              <div className="flex-shrink-0">
                <ExternalLink className="w-4 h-4 text-pink-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
