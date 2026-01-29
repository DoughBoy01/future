interface StripeConnectionBannerProps {
  onDismiss?: () => void;
}

/**
 * StripeConnectionBanner - Disabled
 *
 * This component has been disabled as Stripe connection functionality
 * is now handled through the OnboardingChecklist component.
 * Keeping this file for potential future use.
 */
export function StripeConnectionBanner({ onDismiss }: StripeConnectionBannerProps) {
  // Always hide - Stripe connection managed via onboarding checklist
  return null;
}
