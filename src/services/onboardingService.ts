import { supabase } from '../lib/supabase';

export type OnboardingStep = 'welcome' | 'organization' | 'first_camp' | 'completed';

export interface OnboardingStatus {
  completed: boolean;
  currentStep: OnboardingStep | null;
  completedAt?: string;
}

export interface OnboardingChecklist {
  accountCreated: boolean;
  organizationSetup: boolean;
  firstCampCreated: boolean;
  firstBookingReceived: boolean;
  stripeConnected: boolean;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionable: boolean; // Can user click to navigate
}

export interface OnboardingStats {
  step: string;
  count: number;
  avg_days_since_signup: number;
}

/**
 * Get current user's onboarding status
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed, onboarding_step, onboarding_completed_at')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    completed: data.onboarding_completed || false,
    currentStep: data.onboarding_step as OnboardingStep | null,
    completedAt: data.onboarding_completed_at,
  };
}

/**
 * Update onboarding step for current user
 */
export async function updateOnboardingStep(
  userId: string,
  step: OnboardingStep
): Promise<void> {
  const { error } = await supabase.rpc('update_onboarding_step', {
    p_profile_id: userId,
    p_step: step,
  });

  if (error) throw error;
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(userId: string): Promise<void> {
  await updateOnboardingStep(userId, 'completed');
}

/**
 * Complete Stripe onboarding step and finalize onboarding
 * This is called when user successfully connects Stripe during onboarding
 */
export async function completeStripeOnboarding(userId: string): Promise<void> {
  return completeOnboarding(userId);
}

/**
 * Skip Stripe connection but mark onboarding as complete
 * User can connect Stripe later from payment settings
 */
export async function skipStripeOnboarding(userId: string): Promise<void> {
  return completeOnboarding(userId);
}

/**
 * Get onboarding checklist for camp organizer
 */
export async function getOnboardingChecklist(userId: string): Promise<OnboardingChecklistItem[]> {
  // Get profile to check account created
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, organisation_id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Check if organization is set up (has basic info)
  const { data: organization, error: orgError } = await supabase
    .from('organisations')
    .select('id, name, contact_email, onboarding_status, stripe_account_id')
    .eq('id', profile.organisation_id)
    .single();

  const organizationSetup = organization && organization.name && organization.contact_email;

  // Check if first camp created
  const { count: campCount, error: campError } = await supabase
    .from('camps')
    .select('*', { count: 'exact', head: true })
    .eq('organisation_id', profile.organisation_id);

  if (campError && campError.code !== 'PGRST116') throw campError;


  // Check Stripe connection
  const stripeConnected = organization && organization.stripe_account_id !== null;

  // Return array of checklist items
  return [
    {
      id: 'account_created',
      title: 'Create Account',
      description: 'Sign up and verify your email',
      completed: true, // If we're querying, account exists
      actionable: false,
    },
    {
      id: 'organization_profile',
      title: 'Set Up Organization',
      description: 'Complete your organization profile and details',
      completed: !!organizationSetup,
      actionable: !organizationSetup,
    },
    {
      id: 'first_camp',
      title: 'Create First Camp',
      description: 'List your first camp to start accepting bookings',
      completed: (campCount || 0) > 0,
      actionable: (campCount || 0) === 0,
    },
    {
      id: 'stripe_connection',
      title: 'Connect Stripe',
      description: 'Set up payments to receive your earnings and go live',
      completed: !!stripeConnected,
      actionable: !stripeConnected,
    },
  ];
}

/**
 * Get incomplete onboarding statistics (admin only)
 */
export async function getIncompleteOnboardingStats(): Promise<OnboardingStats[]> {
  const { data, error } = await supabase.rpc('get_incomplete_onboarding_stats');

  if (error) throw error;
  return data || [];
}

/**
 * Calculate onboarding completion percentage
 */
export function calculateCompletionPercentage(checklist: OnboardingChecklist): number {
  const items = [
    checklist.accountCreated,
    checklist.organizationSetup,
    checklist.firstCampCreated,
    checklist.firstBookingReceived,
  ];

  const completed = items.filter(Boolean).length;
  return Math.round((completed / items.length) * 100);
}

/**
 * Get next onboarding action
 */
export function getNextAction(checklist: OnboardingChecklist): {
  action: string;
  route: string;
  description: string;
} {
  if (!checklist.organizationSetup) {
    return {
      action: 'Complete Your Organization Profile',
      route: '/onboarding/organization',
      description: 'Add your organization details to get started',
    };
  }

  if (!checklist.firstCampCreated) {
    return {
      action: 'Create Your First Camp',
      route: '/onboarding/first-camp',
      description: 'List your first camp to start accepting bookings',
    };
  }

  if (!checklist.stripeConnected) {
    return {
      action: 'Connect Stripe for Payouts',
      route: '/organizer/organization/profile#stripe',
      description: 'Connect your bank account to receive payments',
    };
  }

  return {
    action: 'Promote Your Camps',
    route: '/organizer-dashboard',
    description: "You're all set! Start promoting your camps to get bookings",
  };
}

/**
 * Check if user needs Stripe connection reminder
 */
export async function shouldShowStripeReminder(organizationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('organisations')
    .select('stripe_account_id, stripe_connection_required_at')
    .eq('id', organizationId)
    .single();

  if (error || !data) return false;

  // Show reminder if Stripe not connected and connection is required
  return !data.stripe_account_id && !!data.stripe_connection_required_at;
}

/**
 * Mark that Stripe connection is now required (after first booking)
 */
export async function requireStripeConnection(organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('organisations')
    .update({
      stripe_connection_required_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .is('stripe_connection_required_at', null); // Only set if not already set

  if (error) throw error;
}

/**
 * Record that a Stripe reminder was sent
 */
export async function recordStripeReminderSent(organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('organisations')
    .update({
      stripe_connection_reminder_sent_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) throw error;
}

/**
 * Get organizations that need Stripe connection reminders
 */
export async function getOrganizationsNeedingStripeReminders(): Promise<any[]> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data, error } = await supabase
    .from('organisations')
    .select('id, name, contact_email, stripe_connection_required_at, stripe_connection_reminder_sent_at')
    .is('stripe_account_id', null)
    .not('stripe_connection_required_at', 'is', null)
    .or(`stripe_connection_reminder_sent_at.is.null,stripe_connection_reminder_sent_at.lt.${threeDaysAgo.toISOString()}`);

  if (error) throw error;
  return data || [];
}
