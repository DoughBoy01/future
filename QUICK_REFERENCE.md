# FutureEdge Platform - Quick Reference Guide

## Application at a Glance

| Aspect | Details |
|--------|---------|
| **Name** | FutureEdge Camp Marketplace |
| **Type** | B2B2C Camp Management & Booking Platform |
| **Status** | Production-ready, actively developing |
| **Current Branch** | `claude/sea-market-features-plan` (Maritime features planned) |

---

## Key Numbers

| Metric | Count |
|--------|-------|
| React Components | 36 |
| Route Pages | 24 |
| Service Classes | 8 |
| Database Tables | 11+ |
| SQL Migrations | 28 |
| Lines of Code (src/) | ~874 KB |
| Dependencies | 5 production |
| Dev Dependencies | 12 |

---

## User Types & Access

| User Role | Access Level | Primary Features |
|-----------|--------------|------------------|
| **Parent** | Public + Dashboard | Browse camps, register children, manage bookings |
| **School Admin** | Admin dashboard | Manage camps, reviews, registrations |
| **Marketing** | Admin dashboard | Manage content, communications, analytics |
| **Operations** | Admin dashboard | Handle registrations, commissions, customers |
| **Risk** | Admin dashboard | Approval workflows, content review |
| **Super Admin** | Full platform | All admin features + system settings |

---

## Core Features by Module

### Parent/Public Experience
- Camp discovery and search
- Detailed camp pages with media galleries
- Star ratings and reviews
- Booking and registration
- Payment processing (Stripe)
- Dashboard for viewing bookings
- Child profile management

### Admin Camp Management
- Create/edit camps (6-tab form)
- Image uploads (up to 10 images)
- Video uploads (YouTube, Vimeo, direct files)
- Category and amenity management
- Pricing and early-bird offers
- FAQ and policy management
- Draft/publish workflow

### Admin Reviews Management
- View all reviews and ratings
- Respond to reviews
- Manually add reviews
- Toggle review visibility
- Featured review selection
- Statistics and filtering

### System-Wide Admin Features
- Organization (school) management
- Role and permission management
- Approval workflows
- Commission tracking
- Analytics and reporting
- Data import/export
- System settings and diagnostics

---

## Technology Stack Summary

### Frontend
```
React 18.3.1
├── TypeScript 5.5.3
├── React Router 7.9.3 (routing)
├── Tailwind CSS 3.4.1 (styling)
├── Lucide React 0.344.0 (icons)
└── Vite 5.4.2 (build tool)
```

### Backend
```
Supabase 2.57.4
├── PostgreSQL (database)
├── Authentication (built-in)
├── File Storage (S3-compatible)
└── Real-time subscriptions
```

### External Services
```
Stripe (payment processing)
```

---

## Directory Structure

```
src/
├── components/          # 36 React components
│   ├── auth/           # Login, signup, password reset
│   ├── camps/          # Camp-specific: forms, galleries, cards
│   ├── home/           # Homepage components
│   ├── layout/         # Navigation, layout wrappers
│   ├── dashboard/      # Admin dashboard components
│   ├── reviews/        # Review management components
│   ├── rbac/           # Role-based access control
│   ├── urgency/        # Urgency signals (timers, alerts)
│   ├── organisations/  # Organization management
│   ├── common/         # Shared utilities
│   └── data/           # Data tables and bulk operations
├── pages/              # 24 route pages
│   ├── public/         # Public-facing pages
│   └── admin/          # Admin dashboard pages
├── services/           # Business logic (8 services)
├── contexts/           # AuthContext state management
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── lib/                # Supabase config, types
├── App.tsx             # Main routing
├── main.tsx            # Entry point
└── index.css           # Global styles + animations
```

---

## Database Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **schools** | Camp organizations | name, logo_url, contact_email, website |
| **profiles** | User accounts | role, first_name, last_name, organisation_id |
| **parents** | Parent details | emergency_contact_name/phone, address |
| **children** | Child profiles | date_of_birth, grade, allergies, medical_conditions |
| **camps** | Camp listings | name, category, price, dates, capacity, status |
| **camp_categories** | Category definitions | name, description, active |
| **feedback** | Reviews & ratings | star_rating, comments, visible, featured, helpful_count |
| **registrations** | Bookings | camp_id, parent_id, status, payment_status |
| **enquiries** | Contact inquiries | camp_id, parent_email, message, status |
| **payments** | Payment records | registration_id, amount, stripe_id, status |
| **organisations_approval_workflow** | Approval pipeline | content_type, status, reviewed_by, reviewed_at |

---

## Key File Locations

| Component/Feature | File Path |
|---------|-----------|
| Camp Details Page | `src/pages/CampDetailPage.tsx` |
| Camp Form Modal | `src/components/camps/CampFormModal.tsx` |
| Image Gallery | `src/components/camps/ImageGallery.tsx` |
| Video Player | `src/components/camps/VideoPlayer.tsx` |
| Review Section | `src/components/camps/ReviewsSection.tsx` |
| Booking Widget | `src/components/camps/EnhancedBookingWidget.tsx` |
| Review Management | `src/components/reviews/ReviewManagementModal.tsx` |
| Auth Context | `src/contexts/AuthContext.tsx` |
| Navbar | `src/components/layout/Navbar.tsx` |
| Admin Dashboard | `src/pages/admin/DashboardOverview.tsx` |

---

## API Routes (via Supabase REST)

All routes auto-generated from database tables. Examples:

```
GET/POST /rest/v1/camps
GET /rest/v1/camps?id=eq.{camp_id}&select=*
GET /rest/v1/feedback?camp_id=eq.{camp_id}&visible=eq.true
POST /rest/v1/registrations
PUT /rest/v1/camps?id=eq.{camp_id}
```

---

## Common Development Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Code Quality
npm run typecheck       # TypeScript type checking
npm run lint           # ESLint checking

# Database
npx supabase db pull   # Pull schema from remote
npx supabase migration new <name>  # Create migration
```

---

## Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, stacked images |
| Tablet | 640-1024px | 2-3 columns, visible sidebar |
| Desktop | > 1024px | 3-4 columns, sticky sidebars |

---

## Authentication Flow

1. User visits `/auth`
2. AuthContext checks for existing session
3. On login: Supabase.auth.signInWithPassword()
4. User profile loaded from `profiles` table
5. Role-based route access determined
6. Protected routes check user & role
7. On logout: Supabase.auth.signOut()

---

## Booking Flow (Parent)

1. Parent views camp details
2. Clicks "Reserve Your Spot"
3. Navigates to `/camps/:id/register`
4. Enters parent & child information
5. System creates registration (draft status)
6. Redirect to Stripe checkout
7. Payment processed
8. Registration status = "completed"
9. Confirmation page shown
10. Email sent to parent

---

## Camp Management Flow (Admin)

1. Admin navigates to `/admin/dashboard/camps`
2. Clicks "Add Camp" or selects existing camp
3. CampFormModal opens with 6 tabs:
   - Basic Info (dates, age range, capacity)
   - Details (description, requirements)
   - Pricing (price, early bird, commission)
   - Media (images, videos)
   - Content (highlights, amenities, FAQs)
   - Policies (cancellation, safety, insurance)
4. Admin uploads files to Supabase storage
5. Metadata saved to database
6. Saves camp in draft or published status
7. Changes visible to parents immediately

---

## Review Management Flow (Admin)

1. Admin navigates to `/admin/dashboard/feedback`
2. Views statistics and filtered review list
3. Click review to view details
4. Can add host response
5. Can toggle visibility
6. Can mark as featured
7. Changes reflected in parent view

---

## Performance Optimizations

- **Images**: Lazy loading, responsive srcset, WebP format
- **Videos**: Thumbnail-first approach, iframe loads on demand
- **Components**: Code splitting by route, tree-shaking
- **Database**: Indexes on common queries, GIN indexes for JSONB
- **Storage**: Optimized file sizes, CDN delivery

---

## Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigation (Tab, Arrow keys, Escape)
- ARIA labels and live regions
- Color contrast > 4.5:1 ratio
- Alt text on all images
- Semantic HTML structure
- Focus indicators visible
- Touch targets minimum 44px

---

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row-Level Security (RLS) policies
- **Storage**: Public read, authenticated write
- **Payment**: Stripe integration (PCI compliant)
- **Data**: Encrypted at rest and in transit
- **CORS**: Restricted to allowed domains

---

## Future Planned Features

### Maritime/Sea Features (Current Branch)
- Sailing camp category
- Water sports amenities
- Marine biology programs
- Waterfront venue management

### Advanced Features (Documented)
- AI-powered review summaries
- Video transcription and captions
- 360-degree virtual tours
- Live chat integration
- Email marketing integration
- SMS notifications

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CODEBASE_OVERVIEW.md` | Complete system architecture |
| `ARCHITECTURE_DIAGRAM.txt` | Visual architecture layers |
| `COMPREHENSIVE_CAMP_SYSTEM_DOCUMENTATION.md` | Detailed feature documentation |
| `CAMP_DETAILS_REDESIGN.md` | UI/UX improvements |
| `RBAC_DOCUMENTATION.md` | Role-based access control |
| `REGISTRATION_FLOW.md` | Parent enrollment process |
| `STRIPE_SETUP.md` | Payment integration guide |

---

## Deployment Checklist

- [ ] Environment variables configured (.env)
- [ ] Supabase migrations applied
- [ ] Storage buckets created (camp-images, camp-videos)
- [ ] RLS policies enabled
- [ ] Stripe keys configured
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Site logo uploaded to site_settings
- [ ] Categories created in camp_categories
- [ ] Analytics tracking setup
- [ ] Error monitoring configured
- [ ] CDN enabled for static assets

---

## Current Development Status

| Aspect | Status |
|--------|--------|
| Core Features | Complete |
| Admin Panel | Complete |
| Payment Integration | Complete |
| Review System | Complete |
| Responsive Design | Complete |
| Accessibility | Complete |
| Documentation | Complete |
| Testing | In Progress |
| Maritime Features | Planning |

---

## Getting Help

### Key Documentation
- See `CODEBASE_OVERVIEW.md` for complete architecture
- See `COMPREHENSIVE_CAMP_SYSTEM_DOCUMENTATION.md` for feature details
- Check specific .md files for feature-specific guidance

### Code Organization
- Components are well-organized by feature area
- Services encapsulate business logic
- Context provides global state
- Types are auto-generated from Supabase schema

### Contact
- Code repository: git history shows development progress
- Current branch indicates feature focus
- Recent commits show latest changes

---

*Last Updated: November 8, 2025*
*Branch: claude/sea-market-features-plan-011CUvHXPs2UUQXo1suTYgxM*
