/**
 * Signup Welcome Email Template (Camp Organizer)
 *
 * Sent when a camp organizer creates a new account.
 * Welcomes them and explains next steps for listing camps.
 */

import { renderBaseLayout } from './base.ts';

export interface SignupWelcomeOrganizerData {
  firstName: string;
  email: string;
  dashboardUrl: string;
  organisationName?: string;
}

export function renderSignupWelcomeOrganizer(
  data: SignupWelcomeOrganizerData
): {
  subject: string;
  html: string;
  previewText: string;
} {
  const { firstName, dashboardUrl, organisationName } = data;

  const previewText = `Welcome to FutureEdge, ${firstName}! Let's get your camps listed.`;

  const content = `
    <!-- Header -->
    <div class="header">
      <h1>🎊 Welcome to FutureEdge!</h1>
      <p>Let's get your camps in front of thousands of families</p>
    </div>

    <!-- Main content -->
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 24px;">Hi ${firstName},</p>

      <p>Welcome to FutureEdge! We're excited to partner with you${organisationName ? ` and ${organisationName}` : ''}
      to connect your amazing camps with families looking for enriching experiences.</p>

      <p>Our platform makes it easy to list your camps, manage registrations, collect payments,
      and grow your reach — all in one place.</p>

      <!-- Success box -->
      <div class="success-box">
        <h3>💰 Transparent Pricing</h3>
        <p style="margin-bottom: 8px;"><strong>You keep 85% of every booking.</strong></p>
        <p style="margin: 0;">We charge a simple 15% platform fee with no hidden costs.
        Plus, we handle payment processing, customer support, and marketing — so you can
        focus on creating great camp experiences.</p>
      </div>

      <!-- CTA button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" class="button">
          Go to Organizer Dashboard
        </a>
      </div>

      <hr class="divider">

      <h3>🚀 Your Quick Start Checklist</h3>
      <p style="margin-bottom: 16px;">Here's what to do next to get your first camp live:</p>

      <table class="details-table" style="border: none;">
        <tr>
          <td style="padding: 16px 0; vertical-align: top; width: 50px;">
            <span style="display: inline-block; width: 36px; height: 36px; background: #EBF4FF; color: #3B82F6; border-radius: 50%; text-align: center; line-height: 36px; font-weight: 700;">1</span>
          </td>
          <td style="padding: 16px 0 16px 12px; vertical-align: top; text-align: left;">
            <strong>Complete Organization Profile</strong><br>
            <span style="color: #717171; font-size: 14px;">Add your organization details, logo, and contact information</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 0; vertical-align: top;">
            <span style="display: inline-block; width: 36px; height: 36px; background: #EBF4FF; color: #3B82F6; border-radius: 50%; text-align: center; line-height: 36px; font-weight: 700;">2</span>
          </td>
          <td style="padding: 16px 0 16px 12px; vertical-align: top; text-align: left;">
            <strong>Create Your First Camp</strong><br>
            <span style="color: #717171; font-size: 14px;">Use our simple wizard to add camp details, photos, and pricing</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 0; vertical-align: top;">
            <span style="display: inline-block; width: 36px; height: 36px; background: #EBF4FF; color: #3B82F6; border-radius: 50%; text-align: center; line-height: 36px; font-weight: 700;">3</span>
          </td>
          <td style="padding: 16px 0 16px 12px; vertical-align: top; text-align: left;">
            <strong>Connect Stripe for Payments</strong><br>
            <span style="color: #717171; font-size: 14px;">Set up secure payment processing (takes 5-10 minutes)</span>
          </td>
        </tr>
        <tr style="border: none;">
          <td style="padding: 16px 0; vertical-align: top; border: none;">
            <span style="display: inline-block; width: 36px; height: 36px; background: #EBF4FF; color: #3B82F6; border-radius: 50%; text-align: center; line-height: 36px; font-weight: 700;">4</span>
          </td>
          <td style="padding: 16px 0 16px 12px; vertical-align: top; text-align: left; border: none;">
            <strong>Publish Your Camp</strong><br>
            <span style="color: #717171; font-size: 14px;">Submit for quick review and go live to start receiving bookings!</span>
          </td>
        </tr>
      </table>

      <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border: 2px solid #F59E0B; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>⚡ Quick Start Option:</strong> Choose "Quick Start" mode when connecting Stripe
          to publish camps immediately while completing full verification later. Perfect for getting
          started fast!
        </p>
      </div>

      <hr class="divider">

      <h3>✨ What Makes FutureEdge Different?</h3>
      <ul>
        <li><strong>Built for Camp Organizers</strong> – Tools designed specifically for your needs</li>
        <li><strong>Instant Payouts</strong> – Get paid directly after each booking</li>
        <li><strong>Zero Upfront Costs</strong> – No listing fees, only pay when you get bookings</li>
        <li><strong>Powerful Dashboard</strong> – Manage camps, bookings, and payments in one place</li>
        <li><strong>Marketing Support</strong> – We promote your camps to thousands of families</li>
        <li><strong>Dedicated Support</strong> – Our team is here to help you succeed</li>
      </ul>

      <hr class="divider">

      <h3>📚 Helpful Resources</h3>
      <ul>
        <li><a href="https://futureedge.com/organizer-guide" style="color: #FF385C; text-decoration: none;">Camp Organizer Guide</a> – Complete walkthrough</li>
        <li><a href="https://futureedge.com/payment-setup" style="color: #FF385C; text-decoration: none;">Payment Setup Tutorial</a> – Step-by-step Stripe integration</li>
        <li><a href="https://futureedge.com/best-practices" style="color: #FF385C; text-decoration: none;">Camp Listing Best Practices</a> – Tips to maximize bookings</li>
        <li><a href="mailto:organizers@futureedge.com" style="color: #FF385C; text-decoration: none;">Organizer Support</a> – Direct email support</li>
      </ul>

      <p style="margin-top: 32px;">Have questions? Reply to this email or reach out to our
      organizer support team at <a href="mailto:organizers@futureedge.com" style="color: #FF385C; text-decoration: none;">organizers@futureedge.com</a>.
      We're here to help you every step of the way!</p>

      <p>Let's create amazing camp experiences together! 🏕️</p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>The FutureEdge Team</strong>
      </p>
    </div>
  `;

  return {
    subject: `Welcome to FutureEdge, ${firstName}! Let's get started 🚀`,
    html: renderBaseLayout(content, { previewText }),
    previewText,
  };
}
