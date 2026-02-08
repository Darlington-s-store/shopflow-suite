# 🔄 Backend Integration - Mass Refactoring Plan

## Status Overview

| Page | Status | Backend Endpoint | Priority |
|------|--------|------------------|----------|
| **AdminReviews** | ✅ DONE | `/api/reviews` | High |
| AdminCoupons | 🔄 In Progress | `/api/coupons` | High |
| AdminDelivery | 🔄 In Progress | `/api/deliveries` | High |
| AdminStaff | 🔄 In Progress | `/api/users` (need to add) | High |
| AdminPayments | 🔄 In Progress | `/api/orders` (payments) | Medium |
| AdminSettings | 🔄 In Progress | `/api/admin/settings` (need to add) | Medium |
| Rider Dashboard | 🔄 In Progress | `/api/deliveries/agent/active` | High |
| AdminNotifications | 🔄 In Progress | `/api/notifications` (need to add) | Low |

---

## ✅ Completed: AdminReviews

**Changes Made**:
- Removed all `localStorage` operations
- Added backend API integration via `/api/reviews`
- Added loading states
- Added refresh button
- Fixed error handling
- All CRUD operations now use backend

**Backend Endpoints Used**:
- `GET /api/reviews` - Get all reviews (admin)
- `PUT /api/reviews/:id/status` - Update review status
- `DELETE /api/reviews/:id` - Delete review

---

## 🔄 Next: AdminCoupons

**Current State**: Uses localStorage (`shopflow_coupons`)

**Required Backend Endpoints** (Already exist):
- `GET /api/coupons` - Get all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

**Refactoring Tasks**:
1. Remove localStorage read/write
2. Add `loadCoupons()` function
3. Update create/update/delete to use API
4. Add loading states
5. Add error handling

---

## 🔄 Next: AdminDelivery

**Current State**: Uses localStorage (`shopflow_rider_deliveries`)

**Required Backend Endpoints** (Already exist):
- `GET /api/deliveries` - Get all deliveries (admin)
- `POST /api/deliveries/:id/assign` - Assign delivery to rider
- `PUT /api/deliveries/:id/status` - Update delivery status

**Refactoring Tasks**:
1. Remove localStorage read/write
2. Add `loadDeliveries()` function
3. Update assign/status operations to use API
4. Add loading states
5. Add error handling

---

## 🔄 Next: AdminStaff

**Current State**: Uses localStorage (`techmart_users`)

**Required Backend Endpoints** (Need to add):
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/role` - Update user role

**Backend Tasks**:
1. Create `backend/src/controllers/userAdminController.js`
2. Add routes to `backend/src/routes/user.js`
3. Add admin middleware checks

**Frontend Tasks**:
1. Remove localStorage operations
2. Add API integration
3. Add loading states

---

## 🔄 Next: AdminPayments

**Current State**: Uses localStorage (`shopflow_payments`)

**Required Backend Endpoints**:
- `GET /api/orders` - Get orders with payment data
- Payment data is part of orders

**Refactoring Tasks**:
1. Remove localStorage read/write
2. Load payment data from orders
3. Add filtering/sorting
4. Add loading states

---

## 🔄 Next: RiderDashboard

**Current State**: Uses localStorage (`shopflow_rider_deliveries`)

**Required Backend Endpoints** (Already exist):
- `GET /api/deliveries/agent/active` - Get rider's active deliveries
- `PUT /api/deliveries/:id/status` - Update delivery status

**Refactoring Tasks**:
1. Remove localStorage operations
2. Add API integration for rider-specific deliveries
3. Add real-time status updates
4. Add loading states

---

## 🔄 Next: AdminSettings

**Current State**: Uses several localStorage keys:
- `shopflow_store_settings`
- `shopflow_shipping_settings`
- `shopflow_sms_settings`
- `shopflow_invoice_settings`

**Required Backend Endpoints** (Need to add):
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:category` - Update specific settings category

**Backend Tasks**:
1. Create settings table in database
2. Create settings controller
3. Add routes

**Frontend Tasks**:
1. Remove localStorage operations
2. Add API integration
3. Add save confirmation

---

## Backend Endpoints Status

### ✅ Already Exist
- [x] `/api/reviews` (GET, PUT, DELETE)
- [x] `/api/coupons` (GET, POST, PUT, DELETE)
- [x] `/api/deliveries` (GET, POST assign, PUT status)
- [x] `/api/deliveries/agent/active` (GET for riders)

### ⚠️ Need to Create
- [ ] `/api/users` (admin user management)
- [ ] `/api/settings` (app settings)
- [ ] `/api/notifications` (system notifications)

---

## Execution Order

1. ✅ **AdminReviews** - DONE
2. **AdminCoupons** - Backend ready, just refactor frontend
3. **AdminDelivery** - Backend ready, just refactor frontend
4. **RiderDashboard** - Backend ready, just refactor frontend
5. **AdminStaff** - Need backend endpoints first
6. **AdminPayments** - Use existing order endpoints
7. **AdminSettings** - Need backend endpoints first
8. **AdminNotifications** - Need backend endpoints first

---

## Testing Checklist

For each refactored page:

- [ ] Data loads from backend on mount
- [ ] Create operation works and persists
- [ ] Update operation works and persists
- [ ] Delete operation works and updates UI
- [ ] Loading states show during API calls
- [ ] Error states show on  failures
- [ ] No localStorage operations remain
- [ ] No console errors
- [ ] Data persists after page refresh
- [ ] Multiple users see same data

---

## Files to Update

### Frontend
```
src/pages/admin/AdminReviews.tsx ✅ DONE
src/pages/admin/AdminCoupons.tsx
src/pages/admin/AdminDelivery.tsx
src/pages/admin/AdminStaff.tsx
src/pages/admin/AdminPayments.tsx
src/pages/admin/AdminSettings.tsx
src/pages/rider/RiderDashboard.tsx
```

### Backend (if needed)
```
backend/src/controllers/userAdminController.js (create)
backend/src/controllers/settingsController.js (create)
backend/src/routes/user.js (add admin routes)
backend/src/routes/settings.js (create)
backend/src/db/schema.js (add settings table)
```

---

## Current Progress

- [x] Analysis complete
- [x] Backend inventory complete
- [x] Execution plan created
- [x] AdminReviews refactored ✅
- [ ] AdminCoupons refactoring
- [ ] AdminDelivery refactoring
- [ ] RiderDashboard refactoring
- [ ] AdminStaff backend creation
- [ ] AdminStaff frontend refactoring
- [ ] AdminPayments refactoring
- [ ] AdminSettings backend creation
- [ ] AdminSettings frontend refactoring

---

**Next Steps**: Continue with AdminCoupons, AdminDelivery, and RiderDashboard since their backend endpoints already exist.
