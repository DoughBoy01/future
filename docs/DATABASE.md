# Database

FutureEdge uses PostgreSQL via Supabase. All tables have Row Level Security (RLS) enabled. The schema has evolved through many migrations — the current live state reflects all applied migrations in `supabase/migrations/`.

---

## Core Design Principles

- Every table has RLS enabled — no data is accessible without explicit policies
- `auth.uid()` is used in all policies to identify the current user
- Separate policies for SELECT, INSERT, UPDATE, DELETE (never `FOR ALL` on protected tables)
- `updated_at` timestamps are maintained via database triggers
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- UUIDs (`gen_random_uuid()`) are used for all primary keys

---

## Tables Reference

### `profiles`

Extended user profile linked to Supabase `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | References `auth.users(id)` |
| `role` | text | `parent`, `camp_organizer`, `school_admin`, `marketing`, `operations`, `risk`, `super_admin` |
| `first_name` | text | |
| `last_name` | text | |
| `phone` | text | Nullable |
| `avatar_url` | text | Nullable |
| `organisation_id` | uuid | References `organisations(id)`, nullable |
| `onboarding_status` | text | `not_started`, `in_progress`, `completed` |
| `onboarding_completed_at` | timestamptz | Nullable |
| `preferences` | jsonb | User preferences object |
| `last_seen_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

RLS: Users can read and update their own profile. Admin roles can read profiles within their scope.

---

### `organisations`

Camp organizer organizations that list camps on the platform.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `description` | text | Nullable |
| `logo_url` | text | Nullable |
| `website` | text | Nullable |
| `contact_email` | text | |
| `contact_phone` | text | Nullable |
| `address` | jsonb | Structured address |
| `stripe_account_id` | text | Stripe Connect account ID, nullable |
| `stripe_account_status` | text | `not_connected`, `pending`, `active`, `restricted` |
| `stripe_charges_enabled` | boolean | |
| `stripe_payouts_enabled` | boolean | |
| `commission_rate` | decimal | Org-specific override rate (nullable, falls back to system default) |
| `onboarding_status` | text | |
| `created_by` | uuid | References `profiles(id)` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

RLS: Organization members can read their org. Super admins can read all.

---

### `organisation_members`

Maps profiles to organizations with roles.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organisation_id` | uuid | References `organisations(id)` |
| `profile_id` | uuid | References `profiles(id)` |
| `role` | text | `owner`, `admin`, `member` |
| `created_at` | timestamptz | |

---

### `camps`

Activity camp listings created by organizers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organisation_id` | uuid | References `organisations(id)` |
| `name` | text | |
| `slug` | text | URL-friendly identifier |
| `description` | text | |
| `category` | text | `sports`, `arts`, `stem`, `language`, `adventure`, `academic`, `creative`, `general` |
| `age_min` | integer | Minimum age |
| `age_max` | integer | Maximum age |
| `grade_min` | text | Nullable |
| `grade_max` | text | Nullable |
| `start_date` | date | |
| `end_date` | date | |
| `schedule` | jsonb | Daily schedule details |
| `capacity` | integer | Max registrations |
| `price` | decimal(10,2) | Full price |
| `currency` | text | Default `USD` |
| `early_bird_price` | decimal(10,2) | Nullable |
| `early_bird_deadline` | date | Nullable |
| `featured_image_url` | text | Nullable |
| `gallery_urls` | jsonb | Array of image URLs |
| `video_urls` | jsonb | Array of video URLs |
| `location` | text | |
| `address` | text | Full address string |
| `what_to_bring` | text | Nullable |
| `requirements` | text | Nullable |
| `amenities` | jsonb | Array of amenity strings |
| `faqs` | jsonb | Array of FAQ objects |
| `status` | text | `draft`, `pending_review`, `approved`, `requires_changes`, `rejected`, `published`, `full`, `cancelled`, `completed` |
| `published` | boolean | Whether camp is live |
| `featured` | boolean | Featured on homepage |
| `published_at` | timestamptz | Nullable |
| `stripe_required` | boolean | Whether Stripe must be connected |
| `created_by` | uuid | References `profiles(id)` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

RLS: Published camps readable by anyone. Organizers can manage their own organization's camps. Admins can manage all.

---

### `camp_categories`

Lookup table for activity categories.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Display name |
| `slug` | text | URL identifier |
| `icon` | text | Icon name |
| `description` | text | Nullable |
| `color` | text | Hex color |
| `active` | boolean | |

---

### `camp_category_assignments`

Many-to-many: camps to categories.

| Column | Type | Notes |
|---|---|---|
| `camp_id` | uuid | References `camps(id)` |
| `category_id` | uuid | References `camp_categories(id)` |
| `created_by` | uuid | Who assigned |

---

### `parents`

Parent/guardian profile linked to a user profile.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `profile_id` | uuid | References `profiles(id)` |
| `emergency_contact_name` | text | Nullable |
| `emergency_contact_phone` | text | Nullable |
| `emergency_contact_relationship` | text | Nullable |
| `address` | jsonb | Home address |
| `notes` | text | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

RLS: Parent can access their own record. Admins can read all.

---

### `children`

Children registered under a parent.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `parent_id` | uuid | References `parents(id)` |
| `first_name` | text | |
| `last_name` | text | |
| `date_of_birth` | date | |
| `gender` | text | Nullable |
| `grade` | text | Nullable |
| `medical_conditions` | text | Nullable |
| `allergies` | text | Nullable |
| `medications` | text | Nullable |
| `dietary_restrictions` | text | Nullable |
| `special_needs` | text | Nullable |
| `photo_url` | text | Nullable |
| `notes` | text | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

RLS: Parent can access their own children. Admins can read all.

---

### `bookings` (formerly `registrations`)

Registration linking a child to a camp. Note: the table was renamed from `registrations` to `bookings` in migration 009.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `camp_id` | uuid | References `camps(id)` |
| `child_id` | uuid | References `children(id)` |
| `parent_id` | uuid | References `parents(id)` |
| `status` | text | `pending`, `confirmed`, `waitlisted`, `cancelled`, `completed` |
| `payment_status` | text | `unpaid`, `partial`, `paid`, `refunded` |
| `amount_paid` | decimal | |
| `amount_due` | decimal | |
| `stripe_session_id` | text | Stripe checkout session ID |
| `stripe_payment_intent_id` | text | Nullable |
| `registration_date` | timestamptz | |
| `confirmation_date` | timestamptz | Nullable |
| `cancellation_date` | timestamptz | Nullable |
| `cancellation_reason` | text | Nullable |
| `discount_code` | text | Nullable |
| `discount_amount` | decimal | Default 0 |
| `forms_submitted` | boolean | Default false |
| `photo_permission` | boolean | Default false |
| `notes` | text | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

RLS: Parents can see their own bookings. Organizers can see bookings for their camps. Admins can see all.

---

### `child_registrations`

Post-booking form with detailed health and medical information submitted by parents.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid | References `bookings(id)` |
| `child_id` | uuid | References `children(id)` |
| `parent_id` | uuid | References `parents(id)` |
| `medical_conditions` | text | Nullable |
| `allergies` | text | Nullable |
| `medications` | text | Nullable |
| `dietary_restrictions` | text | Nullable |
| `special_needs` | text | Nullable |
| `emergency_contact_name` | text | |
| `emergency_contact_phone` | text | |
| `emergency_contact_relationship` | text | Nullable |
| `additional_notes` | text | Nullable |
| `submitted_at` | timestamptz | |
| `created_at` | timestamptz | |

---

### `payment_records`

Stripe payment transaction records.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid | References `bookings(id)` |
| `stripe_session_id` | text | |
| `stripe_payment_intent_id` | text | Nullable |
| `stripe_charge_id` | text | Nullable |
| `amount` | integer | In cents |
| `currency` | text | |
| `status` | text | `pending`, `succeeded`, `failed`, `refunded` |
| `application_fee_amount` | integer | Platform commission in cents |
| `created_at` | timestamptz | |

---

### `commission_records`

Calculated commissions per payment.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid | References `bookings(id)` |
| `organisation_id` | uuid | References `organisations(id)` |
| `payment_amount` | decimal | Gross payment |
| `commission_rate` | decimal | Rate applied (as percentage, e.g. 15.0) |
| `commission_amount` | decimal | Calculated commission |
| `net_amount` | decimal | Amount to organizer |
| `status` | text | `pending`, `paid`, `disputed` |
| `stripe_transfer_id` | text | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `commission_rates`

Commission rate configurations — system default and per-organization overrides.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organisation_id` | uuid | Nullable — null means system default |
| `rate` | decimal | Percentage (e.g. 15.0 = 15%) |
| `effective_from` | date | When rate takes effect |
| `effective_until` | date | Nullable |
| `notes` | text | Nullable |
| `created_by` | uuid | References `profiles(id)` |
| `created_at` | timestamptz | |

---

### `payouts`

Payout batches processed to organizations.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organisation_id` | uuid | References `organisations(id)` |
| `amount` | decimal | Total payout amount |
| `currency` | text | |
| `status` | text | `pending`, `processing`, `completed`, `failed` |
| `stripe_payout_id` | text | Nullable |
| `period_start` | date | |
| `period_end` | date | |
| `notes` | text | Nullable |
| `processed_by` | uuid | References `profiles(id)` |
| `processed_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |

---

### `camp_organizer_invites`

Invitation tokens for new camp organizers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `email` | text | Invited email |
| `token` | text | Unique invite token |
| `organisation_id` | uuid | Nullable |
| `role` | text | Default `camp_organizer` |
| `invited_by` | uuid | References `profiles(id)` |
| `accepted_at` | timestamptz | Nullable |
| `expires_at` | timestamptz | |
| `created_at` | timestamptz | |

---

### `feedback`

Post-camp reviews from parents.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `camp_id` | uuid | References `camps(id)` |
| `parent_id` | uuid | References `parents(id)` |
| `child_id` | uuid | References `children(id)` |
| `booking_id` | uuid | References `bookings(id)` |
| `overall_rating` | integer | 1–5 |
| `staff_rating` | integer | 1–5, nullable |
| `activities_rating` | integer | 1–5, nullable |
| `facilities_rating` | integer | 1–5, nullable |
| `value_rating` | integer | 1–5, nullable |
| `comments` | text | Nullable |
| `would_recommend` | boolean | |
| `testimonial_permission` | boolean | |
| `visible` | boolean | Whether admin approved for public display |
| `featured` | boolean | Whether shown prominently |
| `parent_name` | text | Nullable, for display |
| `submitted_at` | timestamptz | |

RLS: Parents can insert their own. Public can read visible feedback. Admins can manage all.

---

### `audit_logs`

Immutable audit trail of all data mutations.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | Who performed action |
| `action` | text | `create`, `update`, `delete` |
| `table_name` | text | Target table |
| `record_id` | uuid | Target record ID |
| `old_data` | jsonb | Before state (nullable) |
| `new_data` | jsonb | After state (nullable) |
| `ip_address` | text | Nullable |
| `user_agent` | text | Nullable |
| `created_at` | timestamptz | |

---

### `email_queue`

Async email job queue.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `template` | text | Template identifier |
| `to_email` | text | |
| `to_name` | text | Nullable |
| `data` | jsonb | Template variable data |
| `context` | jsonb | Metadata about triggering event |
| `status` | text | `pending`, `processing`, `sent`, `failed` |
| `attempts` | integer | Default 0 |
| `last_error` | text | Nullable |
| `scheduled_at` | timestamptz | When to send |
| `sent_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |

---

### `email_logs`

Record of all sent emails.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `queue_id` | uuid | References `email_queue(id)` |
| `resend_id` | text | Resend API message ID |
| `status` | text | Delivery status |
| `created_at` | timestamptz | |

---

### `quiz_sessions`

Tracks a parent's camp finder quiz session.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `profile_id` | uuid | Nullable (for guests) |
| `email` | text | Nullable |
| `responses` | jsonb | All question answers |
| `recommendations` | jsonb | Scored camp matches |
| `completed` | boolean | |
| `created_at` | timestamptz | |
| `completed_at` | timestamptz | Nullable |

---

### `promotional_offers`

Time-limited promotional deals for organizers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `description` | text | Nullable |
| `discount_type` | text | `commission_reduction`, `fixed_fee` |
| `discount_value` | decimal | |
| `valid_from` | date | |
| `valid_until` | date | |
| `max_enrollments` | integer | Nullable |
| `enrollment_count` | integer | Default 0 |
| `active` | boolean | |
| `created_by` | uuid | |
| `created_at` | timestamptz | |

---

### `system_settings`

Key-value store for platform configuration.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text UNIQUE | Setting identifier |
| `value` | jsonb | Setting value |
| `description` | text | Nullable |
| `updated_by` | uuid | Nullable |
| `updated_at` | timestamptz | |

Known keys: `default_commission_rate`, `platform_name`, `support_email`, feature flag keys.

---

### `permissions`

Fine-grained permission definitions.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text UNIQUE | Permission identifier (e.g. `camps.approve`) |
| `description` | text | |
| `category` | text | Grouping label |

---

### `role_permissions`

Maps permissions to roles.

| Column | Type | Notes |
|---|---|---|
| `role` | text | Role name |
| `permission_id` | uuid | References `permissions(id)` |

---

### `incidents`

Incident reports for risk management.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `camp_id` | uuid | References `camps(id)` |
| `child_id` | uuid | Nullable |
| `incident_type` | text | `injury`, `behavioral`, `medical`, `other` |
| `severity` | text | `low`, `medium`, `high`, `critical` |
| `description` | text | |
| `action_taken` | text | |
| `incident_date` | timestamptz | |
| `parent_notified` | boolean | |
| `parent_notified_at` | timestamptz | Nullable |
| `reported_by` | uuid | References `profiles(id)` |
| `follow_up_required` | boolean | |
| `follow_up_completed` | boolean | |
| `follow_up_notes` | text | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `discount_codes`

Promotional discount codes for registrations.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `code` | text UNIQUE | |
| `discount_type` | text | `percentage`, `fixed_amount` |
| `discount_value` | decimal | |
| `min_purchase` | decimal | Nullable |
| `max_uses` | integer | Nullable |
| `uses_count` | integer | Default 0 |
| `valid_from` | date | |
| `valid_until` | date | |
| `active` | boolean | |
| `applicable_camps` | jsonb | Nullable, array of camp IDs |
| `created_by` | uuid | |
| `created_at` | timestamptz | |

---

### `attendance`

Daily attendance tracking per child per camp day.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid | References `bookings(id)` |
| `camp_id` | uuid | References `camps(id)` |
| `child_id` | uuid | References `children(id)` |
| `date` | date | |
| `check_in_time` | timestamptz | Nullable |
| `check_out_time` | timestamptz | Nullable |
| `checked_in_by` | uuid | Nullable |
| `checked_out_by` | uuid | Nullable |
| `status` | text | `present`, `absent`, `late`, `early_pickup` |
| `notes` | text | Nullable |
| `created_at` | timestamptz | |

---

## Key Database Functions / RPCs

| Function | Purpose |
|---|---|
| `has_permission(user_id, permission_name)` | Returns boolean — whether user has named permission |
| `get_user_email(user_id)` | Returns email for a user ID (admin-only) |
| `calculate_commission(amount, org_id)` | Calculates commission for a given amount and org |
| `get_dashboard_stats()` | Returns aggregated stats for admin overview |
| `update_updated_at_column()` | Trigger function for `updated_at` maintenance |

---

## Views

| View | Purpose |
|---|---|
| `camp_availability` | Joins camps with booking counts to show remaining capacity |

---

## Migration History

Migrations live in `supabase/migrations/` in chronological order. Key milestones:

| Migration | Description |
|---|---|
| `20251004` | Initial schema (schools, profiles, parents, children, camps, registrations, attendance, communications, feedback, incidents) |
| `20251005` | RBAC permission system and approval workflow system |
| `20251016` | Camp payment tracking and enquiries |
| `20251017` | Urgency features, guest checkout support |
| `20251020` | Enhanced camp detail fields |
| `009` | Renamed `registrations` to `bookings` |
| `010` | Child registrations (post-payment health forms) |
| `011` | Audit logs |
| `013` | Roles table |
| `015` | Camp address column |
| `20260112` | Quiz tables |
| `20260117` | Commission offers and onboarding tracking |
| `20260118` | Organisation tracking fields |
| `20260123` | Organisation commission history, system settings |
| `20260125` | Stripe Connect and direct charges support |
| `20260128` | Email logs and email queue |
| `20260315` | Dashboard stats RPC, commission/payout RLS |
