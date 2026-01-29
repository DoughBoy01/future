/**
 * Booking Confirmation Email Template
 *
 * Sent when a parent successfully books a camp.
 * Includes booking details and prompts for child details form completion.
 */

import { renderBaseLayout } from './base.ts';

export interface BookingConfirmationData {
  parentName: string;
  campName: string;
  campStartDate: string;
  campEndDate: string;
  campLocation: string;
  children: Array<{
    firstName: string;
    lastName: string;
  }>;
  totalAmount: number;
  bookingId: string;
  childDetailsUrl: string;
}

export function renderBookingConfirmation(
  data: BookingConfirmationData
): {
  subject: string;
  html: string;
  previewText: string;
} {
  const {
    parentName,
    campName,
    campStartDate,
    campEndDate,
    campLocation,
    children,
    totalAmount,
    bookingId,
    childDetailsUrl,
  } = data;

  const childCount = children.length;
  const previewText = `Booking confirmed for ${campName}! ${childCount} spot${childCount > 1 ? 's' : ''} secured.`;

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const startDate = formatDate(campStartDate);
  const endDate = formatDate(campEndDate);

  // Children list
  const childrenList = children
    .map((child, idx) => `
      <tr>
        <td style="padding: 8px 0; color: #222222;">
          ${idx + 1}. <strong>${child.firstName} ${child.lastName}</strong>
        </td>
      </tr>
    `)
    .join('');

  const content = `
    <!-- Header -->
    <div class="header">
      <h1>🎊 Booking Confirmed!</h1>
      <p>Welcome to ${campName}</p>
    </div>

    <!-- Main content -->
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 24px;">Hi ${parentName},</p>

      <p><strong>Great news!</strong> Your camp booking is confirmed. We can't wait to see
      your ${childCount === 1 ? 'child' : 'children'} at camp!</p>

      <!-- Booking details box -->
      <div class="info-box">
        <h3 style="margin-top: 0;">📋 Booking Details</h3>

        <table class="details-table">
          <tr>
            <td><strong>Camp:</strong></td>
            <td>${campName}</td>
          </tr>
          <tr>
            <td><strong>Starts:</strong></td>
            <td>${startDate}</td>
          </tr>
          <tr>
            <td><strong>Ends:</strong></td>
            <td>${endDate}</td>
          </tr>
          <tr>
            <td><strong>Location:</strong></td>
            <td>${campLocation}</td>
          </tr>
          <tr>
            <td><strong>Total Paid:</strong></td>
            <td style="color: #059669; font-size: 18px;">
              <strong>$${totalAmount.toFixed(2)}</strong>
            </td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #BFDBFE;">
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #1E40AF;">
            Registered ${childCount === 1 ? 'Child' : 'Children'} (${childCount}):
          </p>
          <table style="width: 100%;">
            ${childrenList}
          </table>
        </div>
      </div>

      <!-- Action required warning box -->
      <div class="warning-box">
        <h3>⚠️ Action Required</h3>
        <p style="margin: 12px 0;">Please complete the child information ${childCount === 1 ? 'form' : 'forms'}
        before camp starts. This helps us provide the best experience and ensures we have
        all necessary medical and contact information.</p>

        <a href="${childDetailsUrl}" class="button" style="margin: 16px 0;">
          Complete Child Details Now
        </a>

        <p style="font-size: 12px; margin-bottom: 0; opacity: 0.9;">
          Takes only 3-5 minutes per child
        </p>
      </div>

      <hr class="divider">

      <h3>📝 What Information We Need</h3>
      <p>To ensure your child's safety and comfort, please provide:</p>
      <ul>
        <li><strong>Medical Information</strong> – Allergies, medications, conditions</li>
        <li><strong>Dietary Restrictions</strong> – Food allergies or preferences</li>
        <li><strong>Emergency Contact</strong> – Backup contact person and phone</li>
        <li><strong>Permissions</strong> – Photo/video consent and activity permissions</li>
      </ul>

      <hr class="divider">

      <h3>📅 What Happens Next?</h3>

      <table style="width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 40px;">
            <span style="font-size: 24px;">1️⃣</span>
          </td>
          <td style="padding: 12px 0 12px 8px; vertical-align: top;">
            <strong>Complete child details form</strong> (within 7 days recommended)
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top;">
            <span style="font-size: 24px;">2️⃣</span>
          </td>
          <td style="padding: 12px 0 12px 8px; vertical-align: top;">
            <strong>Receive camp details email</strong> 1 week before camp starts
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top;">
            <span style="font-size: 24px;">3️⃣</span>
          </td>
          <td style="padding: 12px 0 12px 8px; vertical-align: top;">
            <strong>Prepare for camp</strong> using the what-to-bring checklist
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top;">
            <span style="font-size: 24px;">4️⃣</span>
          </td>
          <td style="padding: 12px 0 12px 8px; vertical-align: top;">
            <strong>Drop off on first day</strong> and enjoy peace of mind!
          </td>
        </tr>
      </table>

      <hr class="divider">

      <div style="background: #F7F7F7; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #222222;">📧 Save This Email</p>
        <p style="margin: 0; font-size: 14px; color: #484848;">
          Keep this email for your records. You can view your booking anytime in your
          dashboard.
        </p>
      </div>

      <h3>ℹ️ Booking Reference</h3>
      <p style="font-family: 'Courier New', monospace; font-size: 16px; background: #F7F7F7; padding: 12px; border-radius: 4px; display: inline-block;">
        ${bookingId.substring(0, 8).toUpperCase()}
      </p>

      <p style="margin-top: 32px;">If you have any questions about your booking or the camp,
      please don't hesitate to reach out. We're here to help!</p>

      <p><strong>Questions?</strong><br>
      Reply to this email or contact us at
      <a href="mailto:support@futureedge.com" style="color: #FF385C; text-decoration: none;">support@futureedge.com</a>
      </p>

      <p style="margin-top: 32px;">We're excited for your ${childCount === 1 ? 'child' : 'children'}
      to have an amazing camp experience! 🏕️</p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>The FutureEdge Team</strong>
      </p>
    </div>
  `;

  return {
    subject: `🎉 Booking Confirmed: ${campName}`,
    html: renderBaseLayout(content, { previewText }),
    previewText,
  };
}
