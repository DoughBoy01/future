/**
 * Signup Welcome Email Template (Parent)
 *
 * Sent when a parent creates a new account.
 * Welcomes them to the platform and guides next steps.
 */

import { renderBaseLayout } from './base.ts';

export interface SignupWelcomeParentData {
  firstName: string;
  email: string;
  dashboardUrl: string;
}

export function renderSignupWelcomeParent(
  data: SignupWelcomeParentData
): {
  subject: string;
  html: string;
  previewText: string;
} {
  const { firstName, dashboardUrl } = data;

  const previewText = `Welcome to FutureEdge, ${firstName}! Let's find the perfect camp for your child.`;

  const content = `
    <!-- Header -->
    <div class="header">
      <h1>🎉 Welcome to FutureEdge!</h1>
      <p>Your journey to finding amazing camps starts here</p>
    </div>

    <!-- Main content -->
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 24px;">Hi ${firstName},</p>

      <p>Welcome to FutureEdge! We're thrilled to have you join our community of parents
      finding enriching camp experiences for their children.</p>

      <p>Whether you're looking for sports camps, arts programs, STEM activities, or outdoor
      adventures, we've got you covered with hundreds of carefully curated camps.</p>

      <!-- Info box -->
      <div class="info-box">
        <h3>🚀 What's Next?</h3>
        <p style="margin-bottom: 12px;"><strong>Here's how to get started:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Browse our featured camps</li>
          <li style="margin: 8px 0;">Take our 2-minute quiz for personalized recommendations</li>
          <li style="margin: 8px 0;">Add your child's information to speed up future bookings</li>
          <li style="margin: 8px 0;">Save your favorite camps to review later</li>
        </ul>
      </div>

      <!-- CTA button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" class="button">
          Go to My Dashboard
        </a>
      </div>

      <hr class="divider">

      <h3>✨ Why Parents Love FutureEdge</h3>
      <ul>
        <li><strong>Verified Camps</strong> – All camps are reviewed and verified by our team</li>
        <li><strong>Secure Payments</strong> – Safe, encrypted payment processing</li>
        <li><strong>Easy Management</strong> – Track all bookings in one place</li>
        <li><strong>Personalized Match</strong> – Our quiz finds camps perfect for your child</li>
        <li><strong>Dedicated Support</strong> – Real humans ready to help, always</li>
      </ul>

      <hr class="divider">

      <h3>📋 Quick Tips</h3>
      <p><strong>Complete your profile:</strong> Adding your child's information now makes
      booking faster and easier. You can manage all your children in one dashboard.</p>

      <p><strong>Save favorites:</strong> Found a camp you like? Save it to your favorites
      so you can compare and come back later.</p>

      <p><strong>Read reviews:</strong> See what other parents have to say about camps
      before booking.</p>

      <p><strong>Book early:</strong> Popular camps fill up fast! Many offer early bird
      discounts too.</p>

      <hr class="divider">

      <div style="background: #F7F7F7; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #484848;">
          <strong>💡 Pro Tip:</strong> Take our quick quiz to get personalized camp recommendations
          based on your child's age, interests, and your preferences. It takes just 2 minutes!
        </p>
      </div>

      <p style="margin-top: 32px;">If you have any questions or need help getting started,
      just reply to this email. Our support team is here to help!</p>

      <p>Happy camp hunting! 🏕️</p>

      <p style="margin-top: 24px;">
        Warm regards,<br>
        <strong>The FutureEdge Team</strong>
      </p>
    </div>
  `;

  return {
    subject: `Welcome to FutureEdge, ${firstName}! 🎉`,
    html: renderBaseLayout(content, { previewText }),
    previewText,
  };
}
