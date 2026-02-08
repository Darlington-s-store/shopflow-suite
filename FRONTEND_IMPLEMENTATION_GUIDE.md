# Frontend Implementation Guide

## Overview
The backend is 100% complete. This guide helps you connect the frontend to the backend APIs.

## ✅ Already Complete (Don't Need Changes)
- Authentication system (using HTTP-only cookies)
- Product Card component (with orange theme)
- Admin color scheme (orange #ea580c)

## ⚠️ Still Needed

### 1. Product Detail Page
**Created:** `ModernProductDetail.tsx` (eBay-style template)
**Features:**
- Image gallery with thumbnails
- Variant selection with individual pricing
- Quantity selector
- Wishlist toggle
- Add to cart
- Reviews section
- Trust badges

**To Use:**
- Import in App.tsx
- Route: `/product/:slug`
- Displays all product data from API

### 2. User Dashboard Pages
Create new pages under `src/pages/user/dashboard/`:

#### a. Orders Page (`OrdersPage.tsx`)
```typescript
// Fetch from: GET /api/orders
// Display:
- Order list with order number, date, total, status
- Order details modal/page
- Delivery tracking info (rider name, phone, status)
- Download invoice button
```

#### b. Addresses Page (`AddressesPage.tsx`)
```typescript
// Fetch from: GET /api/user/addresses
// Features:
- List all addresses
- Add new address (POST /api/user/addresses)
- Edit address (PUT /api/user/addresses/:id)
- Delete address (DELETE /api/user/addresses/:id)
- Set default address
- Address form with validation
```

#### c. Messages Page (`MessagesPage.tsx`)
```typescript
// Fetch from: GET /api/user/messages
// Features:
- Inbox/Sent/Unread folders
- Message list
- Message thread view
- Send new message
- Mark as read
- Delete message
```

#### d. Notifications Page (`NotificationsPage.tsx`)
```typescript
// Fetch from: GET /api/notifications
// Features:
- List all notifications
- Mark as read
- Mark all as read
- Delete notifications
- Notification types: Orders, Delivery, Messages
```

#### e. Wishlist Page (`WishlistPage.tsx`)
```typescript
// Fetch from: GET /api/user/wishlist
// Features:
- Display wishlisted products
- Remove from wishlist
- Add to cart from wishlist
- Show product cards
```

#### f. Profile Page (`ProfilePage.tsx`)
```typescript
// Fetch from: GET /api/auth/profile
// Features:
- Edit name, email, phone
- Change password endpoint: PUT /api/auth/change-password
- Update profile endpoint: PUT /api/auth/profile
```

### 3. Cart & Checkout Pages

#### Cart Page (`CartPage.tsx`)
```typescript
// Fetch from: GET /api/user/cart
// Features:
- Product list with variants
- Quantity update (update cart, recalculate totals)
- Remove item
- Clear cart
- Subtotal calculation
- Proceed to checkout
- Continue shopping button
```

#### Checkout Page (Update Existing)
```typescript
// Steps:
1. Shipping Address Selection
   - GET /api/user/addresses
   - Allow creating new address

2. Order Review
   - Display cart items
   - Show totals (subtotal + tax + delivery)
   - Show delivery fee (GHS 25)
   - Show estimated delivery date

3. Payment Method (Jumia-style)
   - Card (Visa, Mastercard, Verve)
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Cash on Delivery
   - Show different UI for each

4. Order Confirmation
   - POST /api/orders (with shippingAddressId)
   - Show order number
   - Show delivery tracking
   - Send SMS (backend does this)
```

### 4. Admin Dashboard Pages

#### Products Page (`AdminProducts.tsx`)
- List products: GET /api/products (admin can see all)
- Create product: POST /api/products
- Edit product: PUT /api/products/:id
- Delete product: DELETE /api/products/:id
- Manage images: Use existing ProductImageManagement.tsx
- Manage variants: POST /api/products/:productId/variants

#### Categories Page (`AdminCategories.tsx`)
```typescript
// Endpoints:
GET    /api/admin/categories      - List
POST   /api/admin/categories      - Create
PUT    /api/admin/categories/:id  - Update
DELETE /api/admin/categories/:id  - Delete

// Features:
- Create category with name, description, image
- Create subcategories (parent_id)
- Manage category status
- Reorder categories
```

#### Brands Page (`AdminBrands.tsx`)
```typescript
// Endpoints:
GET    /api/admin/brands          - List
POST   /api/admin/brands          - Create
PUT    /api/admin/brands/:id      - Update
DELETE /api/admin/brands/:id      - Delete

// Features:
- Create brands
- Upload logo
- Manage brand status
- Create brand models per category (future)
```

#### Orders Page (`AdminOrders.tsx`)
```typescript
// Endpoints:
GET /api/orders                    - All orders (for admin)
GET /api/orders/:id                - Order details
PUT /api/orders/:id/payment        - Update payment status

// Features:
- List all orders
- Filter by status, date range
- View order items
- Manage payment status
- Assign delivery
```

#### Delivery Management (`AdminDelivery.tsx`)
```typescript
// Endpoints:
GET    /api/deliveries            - All deliveries
POST   /api/deliveries/:id/assign - Assign delivery agent
GET    /api/admin/delivery-agents - List agents

// Features:
- List deliveries (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED)
- Assign delivery agent
- View delivery details
- See agent list
```

#### Messages Management (`AdminMessages.tsx`)
```typescript
// Endpoints:
GET    /api/admin/messages        - Get messages
PUT    /api/admin/messages/:id/read - Mark as read
POST   /api/admin/messages/:id/reply - Reply
DELETE /api/admin/messages/:id    - Delete

// Features:
- Inbox view
- Reply to customer messages
- Filter read/unread
- Delete messages
```

#### Reviews Management (`AdminReviews.tsx`)
```typescript
// Endpoints:
GET    /api/reviews               - All reviews
PUT    /api/reviews/:id/status    - Approve/Reject (status: APPROVED/REJECTED/PENDING)
DELETE /api/reviews/:id           - Delete

// Features:
- List reviews
- Approve/reject reviews
- Delete spam reviews
```

### 5. API Call Patterns

**All API calls need:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// GET request
fetch(`${API_BASE_URL}/endpoint`, {
  method: 'GET',
  credentials: 'include',  // Important: send cookies
  headers: { 'Content-Type': 'application/json' }
})

// POST/PUT request
fetch(`${API_BASE_URL}/endpoint`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

### 6. Environment Setup

**.env.local:**
```
VITE_API_URL=http://localhost:5000/api
```

### 7. Remove Old Code

Delete or ignore:
- `src/data/mockData.ts` (no longer used)
- `src/utils/storageSync.ts` (already a no-op)
- Any localStorage-based state management
- Mock data in contexts

### 8. Error Handling Pattern

```typescript
try {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      // Redirect to login
    }
    const data = await res.json();
    toast.error(data.error || 'Failed to perform action');
    return;
  }
  const data = await res.json();
  // Handle success
} catch (error) {
  toast.error('Network error');
  console.error(error);
}
```

### 9. Form Validation

Use existing form components from shadcn/ui:
- Input
- Textarea
- Select
- Checkbox
- Radio

### 10. Loading & Loading States

Use:
- useState(true) for loading
- Loading skeleton or spinner
- Disabled buttons during submission

### 11. Testing Checklist

- [ ] Login/Register with SMS
- [ ] Browse products
- [ ] View product details with variants
- [ ] Add to cart
- [ ] Add to wishlist
- [ ] Checkout process
- [ ] Order confirmation
- [ ] Track delivery
- [ ] View notifications
- [ ] Admin: Create product
- [ ] Admin: Create category/brand
- [ ] Admin: Assign delivery
- [ ] Admin: View messages
- [ ] Admin: Manage reviews

## Quick Start for Each Page

### 1. Create the page component
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function NewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/endpoint`, {
        credentials: 'include'
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

### 2. Add route in App.tsx
```typescript
import NewPage from '@/pages/NewPage';

// In Routes
<Route path="/new-page" element={<NewPage />} />
```

### 3. Add to navigation
Update Header.tsx or navigation component to link to new pages.

## Database Schema Notes

Each product can have:
- **Multiple variants** with different colors/storage and **individual prices**
- **Multiple images**
- **Multiple reviews** (only verified purchasers, one per user)

Example:
- Product: iPhone 15
  - Variant 1: Black, 128GB - GHS 3000
  - Variant 2: Black, 256GB - GHS 3300
  - Variant 3: Blue, 128GB - GHS 3000
  - All with different stock levels

## Color System

Primary color: #ea580c (orange)
Use throughout:
- Buttons
- Links
- Highlights
- Active states

Tailwind color token: `primary`

## Next Steps Priority

1. **Update existing pages to use APIs** (not mock data)
   - ProductList
   - ProductDetail → use ModernProductDetail.tsx
   - Cart
   - Checkout

2. **Create user dashboard pages**
   - Orders, Addresses, Messages, Notifications, Wishlist, Profile

3. **Update admin pages**
   - Products, Categories, Brands, Orders, Delivery, Messages, Reviews

4. **Test full user journey**
   - Register → SMS verification
   - Browse products
   - Add to cart
   - Checkout
   - Order confirmation
   - Delivery tracking
   - Review product

5. **Test admin journey**
   - Login as admin
   - Create category/brand
   - Create product with variants and pricing
   - Assign delivery
   - View messages
   - Manage reviews

All backend endpoints are production-ready and tested. Frontend just needs to wire them up!
