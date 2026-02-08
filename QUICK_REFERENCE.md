# ShopFlow - Quick Reference Card

## Backend Running?
```bash
cd backend && npm start
# → http://localhost:5000/api
```

## Frontend Running?
```bash
npm run dev
# → http://localhost:5173
```

## Environment Variables
```
# .env.local (frontend)
VITE_API_URL=http://localhost:5000/api

# backend/.env
DATABASE_URL=neon-database-url
JWT_SECRET=your-secret
JWT_EXPIRE=7d
ARKESEL_API_KEY=your-arkesel-key
ARKESEL_SENDER_ID=SHOPFLOW
```

## API Base Pattern
```typescript
const API = 'http://localhost:5000/api';
fetch(`${API}/endpoint`, {
  credentials: 'include',  // IMPORTANT!
  headers: { 'Content-Type': 'application/json' }
})
```

## Core Endpoints (No Auth Needed)
```
GET /api/products              - Browse products
GET /api/products/:id          - Product detail
GET /api/admin/categories      - All categories
GET /api/admin/brands          - All brands
GET /api/reviews/:productId    - Product reviews
POST /api/auth/register        - Register user
POST /api/auth/login           - Login user
```

## Core Endpoints (Auth Required)
```
GET /api/auth/profile          - User profile
POST /api/user/cart            - Add to cart
GET /api/user/cart             - Get cart
POST /api/orders               - Checkout
GET /api/orders                - My orders
GET /api/deliveries/:orderId   - Track delivery
POST /api/reviews              - Submit review
POST /api/user/messages        - Send message
GET /api/user/addresses        - My addresses
```

## Admin Endpoints
```
POST /api/products             - Create product
POST /api/admin/categories     - Add category
POST /api/admin/brands         - Add brand
POST /api/deliveries/:id/assign - Assign rider
GET /api/admin/messages        - Customer messages
PUT /api/reviews/:id/status    - Approve reviews
```

## Product Variant Pricing (KEY FEATURE)
```typescript
// Each variant has own price
product.variants = [
  { id: 1, color: 'Black', storage: '128GB', price: 3000 },  // Separate price!
  { id: 2, color: 'Black', storage: '256GB', price: 3300 },  // Different price!
  { id: 3, color: 'Blue',  storage: '128GB', price: 3000 }
]
```

## Add to Cart (with variant)
```typescript
POST /api/user/cart
{
  "productId": 5,
  "variantId": 12,     // Selected variant
  "quantity": 2
}
```

## Create Order (Checkout)
```typescript
POST /api/orders
{
  "shippingAddressId": 3
}
// Response includes order with calculated totals:
// - subtotal (from cart items)
// - tax: 7.5%
// - deliveryFee: 25 GHS
// - total: subtotal + tax + delivery
```

## SMS Triggered On
- User registration (account verification)
- Order placed (confirmation)
- Delivery assigned (rider info)
- Delivery status update (IN_TRANSIT, DELIVERED)
- Password reset (reset token)

## Color System
Primary: `#ea580c` (Orange)
Use in Tailwind: `primary`
Examples:
```html
<button className="bg-primary hover:bg-primary/90">Click</button>
<div className="text-primary">Text</div>
<input className="border-primary focus:ring-primary" />
```

## File Structure
```
src/
├── pages/
│   ├── products/
│   │   ├── ProductDetail.tsx         (current - to update)
│   │   └── ModernProductDetail.tsx   (new template)
│   ├── user/dashboard/
│   │   ├── OrdersPage.tsx            (TODO)
│   │   ├── AddressesPage.tsx         (TODO)
│   │   ├── MessagesPage.tsx          (TODO)
│   │   ├── NotificationsPage.tsx     (TODO)
│   │   └── ProfilePage.tsx           (TODO)
│   ├── admin/
│   │   ├── AdminProducts.tsx         (update)
│   │   ├── AdminCategories.tsx       (TODO)
│   │   ├── AdminBrands.tsx           (TODO)
│   │   ├── AdminOrders.tsx           (TODO)
│   │   ├── AdminDelivery.tsx         (TODO)
│   │   ├── AdminMessages.tsx         (TODO)
│   │   └── AdminReviews.tsx          (TODO)
│   ├── checkout/
│   │   └── CheckoutPage.tsx          (update - Jumia style)
│   └── cart/
│       └── CartPage.tsx              (update)
├── components/
│   ├── products/
│   │   └── ProductCard.tsx           (✅ updated)
│   └── admin/
│       ├── AdminTopBar.tsx           (✅ fixed)
│       └── AdminSettings.tsx         (✅ fixed)
└── contexts/
    └── AuthContext.tsx              (✅ API ready)
```

## User Roles
```
CUSTOMER       - Regular user
ADMIN          - Store administrator
DELIVERY_AGENT - Rider/Delivery person
```

## Order Status Flow
```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
```

## Delivery Status Flow
```
PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
```

## Review Status Flow
```
PENDING → APPROVED (or REJECTED)
```

## Common Errors & Fixes

**Error: 401 Unauthorized**
- Fix: Add `credentials: 'include'` to fetch

**Error: CORS error**
- Fix: Backend CORS is configured, check API URL

**Error: Product not found**
- Fix: Use correct product ID/slug format

**Error: Cart is empty**
- Fix: User needs to add items first

**Error: Can't review product**
- Fix: Only verified purchasers can review (bought the product)

## Testing Quick Commands

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!","firstName":"John","lastName":"Doe","phone":"233XXXXXXXXX"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Test get products
curl http://localhost:5000/api/products

# Test with auth
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Cookie: shopflow_token=your-token-here"
```

## Frontend Todo Priority

**Week 1:**
- [ ] Create user dashboard pages (orders, addresses, messages, notifications, profile, wishlist)
- [ ] Connect dashboard pages to APIs

**Week 2:**
- [ ] Update cart page to use API
- [ ] Update checkout page (Jumia-style)
- [ ] Test checkout flow end-to-end

**Week 3:**
- [ ] Create admin pages (products, categories, brands, orders, delivery, messages, reviews)
- [ ] Connect admin pages to APIs
- [ ] Test admin workflows

**Week 4:**
- [ ] Update ProductDetail to use ModernProductDetail.tsx
- [ ] Test all user journeys
- [ ] Fix bugs and edge cases

**Week 5:**
- [ ] Performance optimization
- [ ] Final testing
- [ ] Deploy to production

## Documentation Files
- `BACKEND_COMPLETE_GUIDE.md` - All backend endpoints (detailed)
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - How to build frontend pages
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full project overview

## Key Requirements Met ✅
- [x] Product variants with individual pricing per variant
- [x] No localStorage (HTTP-only cookies)
- [x] SMS notifications (Arkesel)
- [x] Delivery tracking with rider info
- [x] User dashboard ready (needs UI)
- [x] Admin management endpoints
- [x] Reviews system
- [x] Messages system
- [x] Orange color scheme
- [x] eBay-style product detail (template)
- [x] Jumia-style checkout (endpoints ready)
- [x] Categories, subcategories, brands
- [x] All data in database (no mock data)

## Start Here
1. Make sure backend is running: `cd backend && npm start`
2. Check `.env.local` has `VITE_API_URL=http://localhost:5000/api`
3. Run frontend: `npm run dev`
4. Open new tab and create one user dashboard page
5. Connect it to the API using the pattern shown
6. Repeat for all pages

**You've got this! The backend is ready, just wire up the frontend!**
