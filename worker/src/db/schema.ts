import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { DEFAULT_COMMISSION_RATE } from '../../../shared/constants';

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`);
const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`).$onUpdateFn(() => new Date());

export const ROLES = ['parent', 'organizer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

// ── Auth (Better Auth) ────────────────────────────────────────────────────────
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  phone: text('phone'),
  role: text('role', { enum: ROLES }).notNull().default('parent'),
  organisationId: text('organisation_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ── Domain ────────────────────────────────────────────────────────────────────
export const organisation = sqliteTable('organisation', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  about: text('about'),
  logoUrl: text('logo_url'),
  website: text('website'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  commissionRate: real('commission_rate').notNull().default(DEFAULT_COMMISSION_RATE),
  stripeAccountId: text('stripe_account_id'),
  stripeStatus: text('stripe_status', { enum: ['none', 'pending', 'active', 'restricted'] }).notNull().default('none'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const CAMP_STATUS = ['draft', 'pending_review', 'published', 'rejected', 'archived'] as const;
export type CampStatus = (typeof CAMP_STATUS)[number];

export const camp = sqliteTable(
  'camp',
  {
    id: id(),
    organisationId: text('organisation_id').notNull().references(() => organisation.id),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(),
    location: text('location').notNull(),
    address: text('address'),
    ageMin: integer('age_min').notNull(),
    ageMax: integer('age_max').notNull(),
    startDate: text('start_date').notNull(), // ISO date
    endDate: text('end_date').notNull(),
    priceCents: integer('price_cents').notNull(),
    earlyBirdCents: integer('early_bird_cents'),
    earlyBirdDeadline: text('early_bird_deadline'),
    currency: text('currency').notNull().default('USD'),
    capacity: integer('capacity').notNull(),
    enrolled: integer('enrolled').notNull().default(0),
    status: text('status', { enum: CAMP_STATUS }).notNull().default('draft'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    image: text('image'),
    gallery: text('gallery', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    videos: text('videos', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    highlights: text('highlights', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    amenities: text('amenities', { mode: 'json' }).$type<{ category: string; items: string[] }[]>().notNull().default(sql`'[]'`),
    faqs: text('faqs', { mode: 'json' }).$type<{ question: string; answer: string }[]>().notNull().default(sql`'[]'`),
    included: text('included'),
    notIncluded: text('not_included'),
    whatToBring: text('what_to_bring'),
    requirements: text('requirements'),
    safety: text('safety'),
    cancellationPolicy: text('cancellation_policy'),
    reviewNotes: text('review_notes'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('camp_status_idx').on(t.status, t.startDate),
    index('camp_org_idx').on(t.organisationId),
    index('camp_category_idx').on(t.category),
  ],
);

export const enquiry = sqliteTable(
  'enquiry',
  {
    id: id(),
    campId: text('camp_id').notNull().references(() => camp.id),
    userId: text('user_id').references(() => user.id),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status', { enum: ['new', 'answered', 'closed'] }).notNull().default('new'),
    createdAt: createdAt(),
  },
  (t) => [index('enquiry_camp_idx').on(t.campId)],
);

// ── Bookings & payments ───────────────────────────────────────────────────────
export const BOOKING_STATUS = ['pending', 'confirmed', 'cancelled', 'expired', 'refunded'] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const discountCode = sqliteTable('discount_code', {
  id: id(),
  code: text('code').notNull().unique(), // stored upper-case
  kind: text('kind', { enum: ['percent', 'amount'] }).notNull(),
  value: integer('value').notNull(), // percent (0-100) or minor units
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  validFrom: text('valid_from'),
  validUntil: text('valid_until'),
  maxUses: integer('max_uses'),
  uses: integer('uses').notNull().default(0),
  campIds: text('camp_ids', { mode: 'json' }).$type<string[] | null>(),
  createdAt: createdAt(),
});

export const booking = sqliteTable(
  'booking',
  {
    id: id(),
    campId: text('camp_id').notNull().references(() => camp.id),
    userId: text('user_id').references(() => user.id), // null = guest checkout
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email').notNull(),
    contactPhone: text('contact_phone'),
    status: text('status', { enum: BOOKING_STATUS }).notNull().default('pending'),
    currency: text('currency').notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    discountCode: text('discount_code'),
    chargeType: text('charge_type', { enum: ['direct', 'platform'] }).notNull().default('platform'),
    applicationFeeCents: integer('application_fee_cents').notNull().default(0),
    stripeSessionId: text('stripe_session_id').unique(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    paidAt: integer('paid_at', { mode: 'timestamp' }),
    detailsCompletedAt: integer('details_completed_at', { mode: 'timestamp' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('booking_user_idx').on(t.userId), index('booking_camp_idx').on(t.campId, t.status)],
);

export const attendee = sqliteTable(
  'attendee',
  {
    id: id(),
    bookingId: text('booking_id').notNull().references(() => booking.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    age: integer('age'),
    dateOfBirth: text('date_of_birth'),
    gender: text('gender'),
    allergies: text('allergies'),
    medicalConditions: text('medical_conditions'),
    medications: text('medications'),
    medicationInstructions: text('medication_instructions'),
    dietaryRequirements: text('dietary_requirements'),
    specialNeeds: text('special_needs'),
    emergencyName: text('emergency_name'),
    emergencyPhone: text('emergency_phone'),
    emergencyRelationship: text('emergency_relationship'),
    doctorName: text('doctor_name'),
    doctorPhone: text('doctor_phone'),
    tShirtSize: text('t_shirt_size'),
    pickupAuthorized: text('pickup_authorized'),
    notes: text('notes'),
    photoPermission: integer('photo_permission', { mode: 'boolean' }).notNull().default(false),
    mediaPermission: integer('media_permission', { mode: 'boolean' }).notNull().default(false),
    fieldTripPermission: integer('field_trip_permission', { mode: 'boolean' }).notNull().default(false),
    waterPermission: integer('water_permission', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('attendee_booking_idx').on(t.bookingId)],
);

export const commission = sqliteTable('commission', {
  id: id(),
  bookingId: text('booking_id').notNull().unique().references(() => booking.id),
  organisationId: text('organisation_id').notNull().references(() => organisation.id),
  rate: real('rate').notNull(),
  amountCents: integer('amount_cents').notNull(), // platform's share
  currency: text('currency').notNull(),
  settlement: text('settlement', { enum: ['collected', 'owed_to_organisation', 'paid_out'] }).notNull(),
  createdAt: createdAt(),
});
