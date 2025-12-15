import { OrganizerDashboardLayout } from '../../components/dashboard/OrganizerDashboardLayout';
import { OrganizerCampsView } from './OrganizerCampsView';

/**
 * Camp Organizer Dashboard - Shows camps management interface
 * Organizers can only see and manage camps from their own organization
 */
export default function OrganizerDashboardOverview() {
  return (
    <OrganizerDashboardLayout>
      <OrganizerCampsView />
    </OrganizerDashboardLayout>
  );
}
