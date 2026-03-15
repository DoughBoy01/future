# Features

## Public Features (No Login Required)

### Camp Discovery

**Browse Camps** (`/camps`)
- Paginated catalog of all published camps
- Sidebar filter panel with: category, price range, age group, duration, program type, dietary options, language support, quality tier
- Mobile-responsive filter drawer
- Sort and search

**Camp Detail Page** (`/camps/:id`)
- Full camp description, schedule, and pricing
- Image gallery with lightbox
- Video gallery (YouTube embeds + uploaded videos)
- Amenities section
- Host information
- FAQ section
- Reviews and ratings
- Availability calendar
- Booking widget with capacity indicators and urgency signals (countdown timer, low spots alert, social proof)
- Share functionality (native share API)

**Camp Finder Quiz** (`/find-your-camp`)
- Multi-step questionnaire collecting:
  - Child's name and age
  - Interests (multi-select with categories)
  - Special needs or requirements
  - Parent goals for the camp experience
  - Budget range
  - Preferred duration
  - Location preference
- Email capture for results delivery
- Results page with scored camp matches and recommended camps
- Mascot images for engagement (thinking, happy, celebrating)

**AI Conversational Advisor** (`/talk-to-advisor`)
- Voice-based chat powered by Vapi
- Natural language camp discovery conversation
- Real-time transcript display
- Orb visualization with states: idle, listening, speaking, thinking
- Microphone permission handling
- Fallback text-based interface

**Advanced Filters Demo** (`/filter-demo`)
- Showcase of all available filter components
- Demonstrates filter UI patterns

**Marketing Pages**
- `/partners` — Information for camp owners wanting to list on the platform. Includes revenue calculator and comparison table
- `/for-parents` — Benefits and guides for parents
- `/for-schools` — Information for schools and educational institutions

---

## Parent Features (Authentication Required)

### Registration & Booking

**Camp Registration** (`/camps/:id/register`)
- Single-child or multi-child registration in one transaction
- Discount code validation and application
- Registration summary with pricing breakdown
- Stripe Checkout integration
- Guest checkout supported (creates parent record automatically)

**Payment Success** (`/payment-success`)
- Confirms successful payment
- Shows registration details
- Prompts to complete child health details form
- Displays booking reference

**Child Details Form** (`/registration/:registrationId/child-details`)
- Post-payment health and dietary information form
- Fields: allergies, medical conditions, dietary restrictions, special needs, emergency contact, medications
- Saved per registration to inform camp staff

### Parent Dashboard (`/dashboard`)

**Children Management**
- Add, view, and manage multiple children
- Each child record stores: name, date of birth, grade, allergies, medical conditions, dietary needs, special needs

**Registrations Overview**
- Incomplete registrations (pending payment or missing child details) with quick-action prompts
- Upcoming camps with dates and locations
- Past camps with option to leave feedback

**Profile Management**
- Update personal information
- Manage emergency contacts
- Email and notification preferences

---

## Camp Organizer Features

### Onboarding Wizard

A four-step guided setup flow that new camp organizers complete before accessing the full dashboard.

**Step 1: Welcome** (`/onboarding/welcome`)
- Introduction to the platform
- Overview of the setup process

**Step 2: Organization Setup** (`/onboarding/organization`)
- Organization name and description
- Contact information
- Logo upload
- Business details

**Step 3: First Camp Wizard** (`/onboarding/first-camp`)
- Multi-step camp creation:
  - Basic info (name, description, category)
  - Schedule and dates
  - Pricing and capacity
  - Age range and grade levels
  - Location and address
  - Images and media upload
- Saves as draft for admin review

**Step 4: Stripe Connect** (`/onboarding/stripe-connect`)
- Connect a Stripe Express account to receive payments
- Deferred onboarding option (can skip temporarily, payments held until complete)
- Direct link to Stripe's hosted onboarding flow

### Organizer Dashboard

**Overview** (`/organizer-dashboard`)
- Welcome banner with organizer name
- Onboarding checklist with progress indicator
- Stripe connection status banner (if not connected)
- Camp listings summary

**Camps View** (`/organizer/organization/profile` area)
- Table of all camps with status indicators
- Quick actions: edit, publish/unpublish, view bookings
- Camp approval status display

**Profile Settings**
- `/organizer/profile` — Personal profile (name, email, contact)
- `/organizer/organization/profile` — Organization details, logo, description
- `/organizer/settings/payments` — Stripe Connect status and management

---

## Admin Features

All admin routes are prefixed `/admin/` and use the `DashboardLayout` component with a sidebar navigation.

### Dashboard Overview (`/admin/dashboard`)

Key metrics cards:
- Total registrations
- Revenue
- Active camps
- Total parents
- Pending payments

Alerts and action items:
- Camps pending approval
- Flagged registrations
- Recent activity feed

Camp status breakdown chart.

### Camps Management (`/admin/dashboard/camps`)
- Full table of all camps across all organizations
- Filter by status, organization, category
- Approve, reject, or request changes on pending camps
- View full camp details inline
- Edit camp details directly

### Approval Dashboard (`/admin/approvals`)
- Pending approval workflows
- Approve or reject with notes
- Approval history log

### Customers Management (`/admin/dashboard/customers`)
- All registered parents
- Search by name or email
- View registrations per customer

### Registrations Management (`/admin/dashboard/registrations`)
- All registrations across all camps
- Filter by status, date, camp, organization
- Registration details with payment and child info

### Bookings Management (`/admin/dashboard/bookings`)
- Detailed booking records
- Payment status tracking
- Cancellation and refund management

### Enquiries Management (`/admin/dashboard/enquiries`)
- Incoming customer support inquiries
- Status tracking (open, in-progress, resolved)
- Reply and assign functionality

### Communications Center (`/admin/dashboard/communications`)
- Send targeted emails to parents or organizers
- Message history
- Template-based messaging

### Analytics Dashboard (`/admin/dashboard/analytics`)
- Registration trends over time
- Revenue by camp and category
- Geographic distribution
- Quiz engagement metrics
- Conversion funnel analysis

### Commissions Management (`/admin/dashboard/commissions`)
- View all commission records
- Filter by organization, date range, status
- Commission totals and summaries

### Commission Rates Management (`/admin/dashboard/commission-rates`)
- Set system-wide default commission rate
- Override commission rate per organization
- Commission rate history per organization
- Effective rate resolution logic

### Payouts Management (`/admin/dashboard/payouts`)
- View pending payouts by organization
- Process payout batches
- Payout history
- Failed payout tracking

### Payment Analytics (`/admin/dashboard/payment-analytics`)
- Payment volume trends
- Revenue by payment method
- Refund rates
- Stripe Connect status by organizer

### Organizations Management (`/admin/dashboard/organisations`)
- All registered organizations
- Stripe Connect status per org
- Commission rate per org
- Member management

### Camp Organizer Management (`/admin/camp-organizers`)
- Manage camp organizer accounts
- Invite new organizers (email invite with token link)
- View organizer organizations and camps

### User Role Management (`/admin/user-roles`)
- Assign or change user roles
- View all users with roles

### Role Management (`/admin/roles`)
- Configure which permissions each role has
- Fine-grained permission assignment

### Data Management (`/admin/data-management`)
- Import data from CSV/JSON
- Export data to CSV/JSON
- Bulk operations on records
- Data validation and preview

### Promotional Offers Management (`/admin/promotions`)
- Create and manage time-limited promotional offers
- Set commission discounts or incentives for new organizers
- Track enrollment and conversion

### Onboarding Analytics (`/admin/onboarding-analytics`)
- Track organizer onboarding completion rates
- Identify drop-off points in the onboarding funnel

### System Settings (`/admin/settings`)
- Platform-wide configuration values
- Feature flags
- Business rule settings

### System Diagnostics (`/admin/diagnostics`)
- Database health checks
- Edge Function status
- Error log review
- System performance indicators

---

## Cross-Cutting Features

### Email Notifications

Automated emails sent via Resend through the `send-email` Edge Function:

| Trigger | Template | Recipient |
|---|---|---|
| Parent sign-up | `signup-welcome-parent` | New parent |
| Organizer sign-up | `signup-welcome-organizer` | New organizer |
| Booking confirmed | `booking-confirmation` | Parent |

Emails are sent non-blocking (failures don't prevent the main operation). An email queue (`email_queue` table) enables async processing via the `process-email-queue` Edge Function.

### Audit Logging

All data mutations are logged to `audit_logs` with:
- User ID
- Action (create, update, delete)
- Table and record ID
- Before and after values
- Timestamp

### Urgency & Social Proof

Camp detail pages show urgency signals to encourage bookings:
- Countdown timer for limited-time offers
- Low availability alerts (e.g., "3 spots left")
- Booking notifications (e.g., "2 families booked this week")
- Social proof indicators

### Multi-language Support

The UI supports English, Spanish, Japanese, and Chinese via i18next. The browser language is automatically detected and applied. Translation strings are loaded from `public/locales/{lang}/`.

### Responsive Design

All pages are fully responsive with Tailwind CSS breakpoints. Mobile-specific components include:
- Mobile filter drawer for the camps catalog
- Touch-friendly booking widget
- Compact navigation for small screens
