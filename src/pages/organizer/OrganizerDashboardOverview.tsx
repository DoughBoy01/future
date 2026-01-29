import { OrganizerDashboardLayout } from '../../components/dashboard/OrganizerDashboardLayout';
import { OrganizerCampsView } from './OrganizerCampsView';
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist';
import { StripeConnectionBanner } from '../../components/organizer/StripeConnectionBanner';
import { WelcomeBanner } from '../../components/organizer/WelcomeBanner';

/**
 * Camp Organizer Dashboard - Shows camps management interface
 * Organizers can only see and manage camps from their own organization
 */
export default function OrganizerDashboardOverview() {
  console.log('🎯 OrganizerDashboardOverview component rendering');

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-4">
        {/* Personalized Welcome - Always show */}
        <WelcomeBanner />

        {/* Onboarding Checklist - Only shows if not 100% complete */}
        <OnboardingChecklist />

        {/* Stripe Connection Reminder - Shows if Stripe not connected and has camps */}
        <StripeConnectionBanner />

        {/* Main Camps View */}
        <OrganizerCampsView />
      </div>
    </OrganizerDashboardLayout>
  );
}
