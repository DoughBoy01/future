/**
 * Template Registry
 *
 * Central router for all email templates.
 * Maps template names to render functions.
 */

import {
  renderSignupWelcomeParent,
  SignupWelcomeParentData,
} from './templates/signup-welcome-parent.ts';

import {
  renderSignupWelcomeOrganizer,
  SignupWelcomeOrganizerData,
} from './templates/signup-welcome-organizer.ts';

import {
  renderBookingConfirmation,
  BookingConfirmationData,
} from './templates/booking-confirmation.ts';

/**
 * Available template names
 */
export type TemplateName =
  | 'signup-welcome-parent'
  | 'signup-welcome-organizer'
  | 'booking-confirmation';

/**
 * Union type of all template data types
 */
export type TemplateData =
  | SignupWelcomeParentData
  | SignupWelcomeOrganizerData
  | BookingConfirmationData;

/**
 * Template render result
 */
export interface TemplateRenderResult {
  subject: string;
  html: string;
  previewText: string;
}

/**
 * Renders a template by name with provided data
 *
 * @param template - Template identifier
 * @param data - Template-specific data
 * @returns Rendered email content with subject, HTML, and preview text
 * @throws Error if template name is unknown
 */
export function renderTemplate(
  template: TemplateName,
  data: TemplateData
): TemplateRenderResult {
  switch (template) {
    case 'signup-welcome-parent':
      return renderSignupWelcomeParent(data as SignupWelcomeParentData);

    case 'signup-welcome-organizer':
      return renderSignupWelcomeOrganizer(data as SignupWelcomeOrganizerData);

    case 'booking-confirmation':
      return renderBookingConfirmation(data as BookingConfirmationData);

    default:
      // Type-safe exhaustiveness check
      const exhaustiveCheck: never = template;
      throw new Error(`Unknown template: ${exhaustiveCheck}`);
  }
}

/**
 * Validates that template data has required fields
 *
 * @param template - Template name
 * @param data - Template data to validate
 * @returns Validation result with error message if invalid
 */
export function validateTemplateData(
  template: TemplateName,
  data: any
): { valid: boolean; error?: string } {
  switch (template) {
    case 'signup-welcome-parent':
      if (!data.firstName || !data.email || !data.dashboardUrl) {
        return {
          valid: false,
          error: 'Missing required fields: firstName, email, or dashboardUrl',
        };
      }
      break;

    case 'signup-welcome-organizer':
      if (!data.firstName || !data.email || !data.dashboardUrl) {
        return {
          valid: false,
          error: 'Missing required fields: firstName, email, or dashboardUrl',
        };
      }
      break;

    case 'booking-confirmation':
      if (
        !data.parentName ||
        !data.campName ||
        !data.campStartDate ||
        !data.campEndDate ||
        !data.campLocation ||
        !data.children ||
        data.totalAmount === undefined ||
        !data.bookingId ||
        !data.childDetailsUrl
      ) {
        return {
          valid: false,
          error:
            'Missing required fields for booking confirmation template',
        };
      }

      if (!Array.isArray(data.children) || data.children.length === 0) {
        return {
          valid: false,
          error: 'children must be a non-empty array',
        };
      }

      for (const child of data.children) {
        if (!child.firstName || !child.lastName) {
          return {
            valid: false,
            error: 'Each child must have firstName and lastName',
          };
        }
      }
      break;
  }

  return { valid: true };
}

/**
 * Gets metadata about a template
 *
 * @param template - Template name
 * @returns Template metadata
 */
export function getTemplateMetadata(template: TemplateName): {
  name: string;
  description: string;
  category: 'auth' | 'booking' | 'notification';
  priority: 1 | 2 | 3 | 4 | 5;
} {
  switch (template) {
    case 'signup-welcome-parent':
      return {
        name: 'Parent Signup Welcome',
        description: 'Welcome email sent to new parent users',
        category: 'auth',
        priority: 2,
      };

    case 'signup-welcome-organizer':
      return {
        name: 'Organizer Signup Welcome',
        description: 'Welcome email sent to new camp organizer users',
        category: 'auth',
        priority: 2,
      };

    case 'booking-confirmation':
      return {
        name: 'Booking Confirmation',
        description: 'Confirmation email sent after successful camp booking',
        category: 'booking',
        priority: 1, // Highest priority
      };

    default:
      const exhaustiveCheck: never = template;
      throw new Error(`Unknown template: ${exhaustiveCheck}`);
  }
}
