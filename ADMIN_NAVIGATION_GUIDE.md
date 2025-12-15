# Admin Dashboard Navigation Guide

## Complete Admin Navigation Structure

All pages are now accessible through the admin dashboard sidebar navigation.

---

## 📍 Navigation Menu

### **Main**
- **Dashboard** - `/admin/dashboard`
  - Overview and KPIs
  - Quick access to key metrics

---

### **Operations**

- **Camps** - `/admin/dashboard/camps`
  - Manage all camps
  - Approve/reject camp submissions
  - Export camp data

- **Registrations** - `/admin/dashboard/registrations`
  - View all bookings
  - Manage registration status
  - Track payments

- **Enquiries** - `/admin/dashboard/enquiries`
  - Manage customer enquiries
  - Respond to questions
  - Track conversion

- **Customers** - `/admin/dashboard/customers`
  - View all parent accounts
  - Manage customer data
  - Customer analytics

---

### **Business** (NEW - Enhanced Payment Features)

- **Analytics** - `/admin/dashboard/analytics`
  - General business analytics
  - Performance metrics
  - Trends and insights

- **Payment Analytics** - `/admin/dashboard/payment-analytics` ✨ NEW
  - Total revenue tracking
  - Platform vs. organizer revenue breakdown
  - Revenue by organization
  - Date range filtering
  - Financial reporting

- **Commissions** - `/admin/dashboard/commissions`
  - View all commission records
  - Track pending/paid commissions
  - Filter by organization and status
  - Export commission data

- **Commission Rates** - `/admin/dashboard/commission-rates` ✨ NEW
  - **Super admin only**
  - Set organization default rates
  - Override rates for specific camps
  - View rate change history
  - Audit trail of all changes

- **Payouts** - `/admin/dashboard/payouts` ✨ NEW
  - View pending payouts
  - Process payouts for organizations
  - Payout history with filtering
  - Detailed payout breakdowns

---

### **Management**

- **Schools** - `/admin/dashboard/schools`
  - Manage organizations
  - Organization onboarding
  - View organization details

- **Camp Organizers** - `/admin/camp-organizers`
  - Invite camp organizers
  - Manage organizer accounts
  - Track invitations

- **User Roles** - `/admin/user-roles`
  - Assign user roles
  - Manage permissions
  - View role assignments

---

## 🎨 Icon Legend

- 📊 **Analytics** - BarChart3 icon
- 📈 **Payment Analytics** - TrendingUp icon
- 💰 **Commissions** - DollarSign icon
- 💯 **Commission Rates** - Percent icon
- 💳 **Payouts** - Wallet icon
- ⛺ **Camps** - Tent icon
- 👥 **Users/Customers** - Users icon
- 🏫 **Schools** - School icon
- ⚙️ **Settings** - Settings icon

---

## 🔐 Access Control

### Super Admin Only
- Commission Rates
- Schools Management
- User Roles
- Camp Organizers

### Super Admin + School Admin + Operations
- Payment Analytics
- Commissions
- Payouts
- Analytics

### All Admin Roles
- Dashboard
- Camps
- Registrations
- Enquiries
- Customers

---

## 🗺️ Quick Access Routes

Copy these URLs to navigate directly:

**Payment & Finance:**
```
/admin/dashboard/payment-analytics    - Revenue reports
/admin/dashboard/commissions          - Commission tracking
/admin/dashboard/commission-rates     - Rate management
/admin/dashboard/payouts              - Payout processing
```

**Operations:**
```
/admin/dashboard                      - Main dashboard
/admin/dashboard/camps                - Camps management
/admin/dashboard/registrations        - Bookings
/admin/dashboard/enquiries            - Customer enquiries
/admin/dashboard/customers            - Customer database
```

**Management:**
```
/admin/dashboard/schools              - Organizations
/admin/camp-organizers                - Organizer invites
/admin/user-roles                     - Role assignments
```

---

## 🎯 Common Workflows

### Setting Commission Rates

1. Click **Business** → **Commission Rates**
2. Choose **Organizations** or **Camps** tab
3. Click **Edit Rate** on desired item
4. Enter new rate percentage
5. Add notes explaining the change
6. Click **Update Commission Rate**

---

### Processing Payouts

1. Click **Business** → **Payouts**
2. View **Upcoming Payouts** section
3. Review pending amounts per organization
4. Click **Process All Payouts** or **Process Now** for individual org
5. Confirm action
6. View results in **Payout History**

---

### Viewing Payment Analytics

1. Click **Business** → **Payment Analytics**
2. Set date range filter
3. View:
   - Total revenue
   - Platform revenue (commissions)
   - Total payouts
   - Active organizations
4. Scroll to **Revenue by Organization** table
5. See breakdown per organization

---

### Tracking Commissions

1. Click **Business** → **Commissions**
2. Use filters:
   - Status (pending, paid, processing)
   - Organization
   - Date range
3. View commission details
4. Export data if needed

---

## 📱 Mobile Navigation

On mobile devices:
1. Tap hamburger menu (☰) in top-left
2. Navigation opens as slide-out drawer
3. Tap section headers to expand/collapse groups
4. Tap menu item to navigate
5. Menu closes automatically after selection

---

## 🎨 UI Features

### Collapsible Groups
- Click group headers to collapse/expand sections
- State persists during navigation
- Helps reduce visual clutter

### Active Link Highlighting
- Current page highlighted in pink
- Makes it easy to see where you are
- Breadcrumb-style navigation

### Role-Based Display
- Only shows links you have access to
- Prevents confusion
- Ensures security

---

## 💡 Tips

1. **Bookmark frequently used pages** - Save time navigating
2. **Use browser back button** - Works as expected
3. **Check icons** - Quick visual identification of sections
4. **Watch for badges** - "NEW" badges on recently added features
5. **Mobile-friendly** - All pages work on mobile devices

---

## 🔄 Recently Added Features

### Payment & Commission System (December 2024)

✨ **Payment Analytics** - Complete revenue reporting
✨ **Commission Rates** - Flexible rate management
✨ **Payouts** - Automated payout processing

**Access via:** Business section in navigation

---

## 📞 Need Help?

**Can't find a page?**
- Check if you have the required role
- Super admin pages only visible to super admins
- Contact your admin if you need access

**Page not loading?**
- Check browser console for errors
- Ensure you're logged in
- Try refreshing the page
- Contact support if issue persists

---

## 🎊 Navigation Summary

**Total Navigation Items:** 15+
**Categorized Groups:** 4 (Main, Operations, Business, Management)
**Role-Protected Items:** 7
**New Payment Features:** 3

**All pages are accessible via the left sidebar!** ✅

---

**Last Updated:** December 2024
**Navigation Version:** v2.0 (Payment System Enhancement)
