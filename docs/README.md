# FutureEdge - Activity Camp Management Platform

## Overview

FutureEdge is a B2B SaaS marketplace platform that connects camp organizers with parents seeking activity camps for their children. The platform provides end-to-end management for creating, publishing, and booking activity camps, alongside a comprehensive admin suite for platform operations.

## What the Platform Does

**For Parents:**
- Browse and discover activity camps through search, filters, a quiz-based matcher, or AI-powered conversational advisor
- Register one or multiple children for camps in a single checkout
- Manage children's health and dietary information
- Track upcoming and past registrations via a personal dashboard

**For Camp Organizers:**
- Onboard via a guided setup wizard (organization profile, first camp, Stripe Connect)
- Create and manage camp listings with rich media, pricing, and scheduling
- Accept payments through Stripe Connect with automatic commission splitting
- View registrations, bookings, and revenue analytics

**For Platform Administrators:**
- Approve and manage all camp listings
- Manage user roles and permissions
- Configure commission rates per organization or system-wide
- Process payouts to organizers
- View comprehensive analytics and reporting
- Manage communications, enquiries, and promotional offers

---

## Quick Navigation

| Document | Description |
|---|---|
| [Architecture](./ARCHITECTURE.md) | Technical stack, folder structure, patterns |
| [Features](./FEATURES.md) | Detailed feature documentation per user type |
| [Database](./DATABASE.md) | Database schema, tables, and RLS policies |
| [API & Edge Functions](./API.md) | Supabase Edge Functions reference |
| [Roles & Permissions](./ROLES_AND_PERMISSIONS.md) | User roles, RBAC, and access control |
| [Integrations](./INTEGRATIONS.md) | Stripe, Vapi, Resend, and other services |
| [Setup Guide](./SETUP.md) | Environment setup and local development |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Edge Functions | Deno (via Supabase) |
| Payments | Stripe + Stripe Connect |
| Email | Resend |
| AI Advisor | Vapi |
| Internationalization | i18next |
| Video | Remotion |

---

## User Roles at a Glance

| Role | Access |
|---|---|
| `parent` | Public site, own dashboard, register children |
| `camp_organizer` | Organizer dashboard, manage own camps and settings |
| `school_admin` | Full admin dashboard (except super-admin features) |
| `marketing` | Analytics, communications, promotional offers |
| `operations` | Registrations, bookings, commissions, payouts |
| `risk` | Incidents, approvals, feedback |
| `super_admin` | Unrestricted platform access |

---

## Project Structure

```
/
├── docs/                          # Documentation (this folder)
├── public/                        # Static assets
│   ├── locales/                   # i18n translation files
│   └── quiz/                      # Quiz mascot images
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── camp-finder/
│   │   ├── camps/
│   │   ├── campowner/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── data/
│   │   ├── filters/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── marketing/
│   │   ├── onboarding/
│   │   ├── organizer/
│   │   ├── quiz/
│   │   ├── rbac/
│   │   ├── reviews/
│   │   ├── stripe/
│   │   ├── trust/
│   │   ├── urgency/
│   │   └── vapi/
│   ├── contexts/                  # React context providers
│   ├── hooks/                     # Custom React hooks
│   ├── i18n/                      # Internationalization config
│   ├── lib/                       # Supabase client, types, utilities
│   ├── pages/                     # Route-level page components
│   │   ├── admin/
│   │   ├── onboarding/
│   │   └── organizer/
│   ├── remotion/                  # Video generation (Remotion)
│   ├── services/                  # Business logic service layer
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Utility functions
├── supabase/
│   ├── functions/                 # Edge Functions (Deno)
│   └── migrations/                # Database migration files
└── scripts/                       # Utility scripts
```
