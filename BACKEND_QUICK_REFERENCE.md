# ShopFlow Backend - Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Setup Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://neondb_owner:npg_2OQMKols6Fbf@ep-autumn-base-ahlki62w-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secret-key-123
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:8080
```

### Step 2: Install & Run
```bash
npm install
npm run dev
```

Server starts on `http://localhost:5000`

## 📚 API Usage Examples

### Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","firstName":"John","lastName":"Doe","phone":"+1234567890"}'

# Response: { "success": true, "token": "eyJ...", "user": {...} }

# Save token: TOKEN=eyJ...
# Use in headers: -H "Authorization: Bearer $TOKEN"
```

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","firstName":"Admin","lastName":"User","phone":"+1234567890"}'

# Then update role in database directly:
# UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
```

### Create Category
```bash
curl -X POST http://localhost:5000/api/products/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic devices"}'
```

### Create Brand
```bash
curl -X POST http://localhost:5000/api/products/brands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple","description":"Apple Inc."}'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 14",
    "description": "Latest iPhone",
    "basePrice": 999,
    "categoryId": 1,
    "brandId": 1,
    "sku": "IPHONE14",
    "stock": 50,
    "variants": [
      {"size": "256GB", "color": "Black", "price": 999, "stock": 25},
      {"size": "512GB", "color": "Silver", "price": 1099, "stock": 25}
    ]
  }'
```

### Get Products
```bash
# All products
curl http://localhost:5000/api/products

# Filter by category
curl "http://localhost:5000/api/products?category=1"

# Filter by brand
curl "http://localhost:5000/api/products?brand=1"

# Search
curl "http://localhost:5000/api/products?search=iphone"

# Pagination
curl "http://localhost:5000/api/products?limit=10&offset=0"
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/user/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "variantId": null,
    "quantity": 1,
    "productName": "iPhone 14",
    "price": 999,
    "sku": "IPHONE14",
    "imageUrl": "https://..."
  }'
```

### Checkout
```bash
# Get addresses
curl http://localhost:5000/api/user/addresses \
  -H "Authorization: Bearer $TOKEN"

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddressId": 1}'

# Process payment
curl -X POST http://localhost:5000/api/orders/1/payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "CARD", "reference": "stripe_payment_id"}'
```

### Add Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "rating": 5, "comment": "Great product!"}'
```

### Apply Coupon
```bash
curl -X POST http://localhost:5000/api/coupons/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "SAVE20", "cartTotal": 500}'

# Response: { "success": true, "discount": 100, "finalTotal": 400 }
```

## 🔑 Common Headers

```
Authorization: Bearer <your-token>
Content-Type: application/json
```

## 🗝️ Important Constants

### Order Status Values
```
PENDING
PENDING_CONFIRMATION
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

### User Roles
```
CUSTOMER (default)
ADMIN
SUPER_ADMIN
DELIVERY_AGENT
```

### Delivery Status
```
PENDING
ASSIGNED
IN_TRANSIT
DELIVERED
FAILED
```

### Review Status
```
PENDING (awaiting approval)
APPROVED (visible)
REJECTED
```

## 🧪 Testing with Postman

1. Create new collection: "ShopFlow"
2. Add environment variable:
   - `base_url` = `http://localhost:5000/api`
   - `token` = (update after login)

3. Test endpoints:
```
POST {{base_url}}/auth/register
POST {{base_url}}/auth/login
POST {{base_url}}/products
GET {{base_url}}/products
POST {{base_url}}/user/cart
GET {{base_url}}/user/cart
POST {{base_url}}/orders
```

## 🐛 Debugging

### Check Database
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Check users
SELECT * FROM users;

# Check products
SELECT * FROM products;

# Check orders
SELECT * FROM orders;
```

### View Logs
- Check terminal output where you ran `npm run dev`
- Look for `✓` (success) or `✗` (error) messages

### Common Issues

**Issue**: CORS error
```
Solution: Check FRONTEND_URL in .env matches your frontend URL
```

**Issue**: Database connection error
```
Solution: Verify DATABASE_URL is correct and database is running
```

**Issue**: Authentication failed
```
Solution: Verify token is included in Authorization header
Format: "Bearer eyJ..." (note the space)
```

**Issue**: "Product not found"
```
Solution: Ensure you created products first, get ID from response
```

## 📊 Database Queries

### View all users
```sql
SELECT id, email, first_name, role FROM users;
```

### View all products with categories
```sql
SELECT p.*, c.name as category FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

### View user orders
```sql
SELECT o.*, COUNT(oi.id) as item_count FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 1
GROUP BY o.id;
```

### View cart for user
```sql
SELECT * FROM cart_items WHERE user_id = 1;
```

### Update user role to admin
```sql
UPDATE users SET role = 'ADMIN' WHERE id = 1;
```

## 🔄 Frontend Integration

### In React Components:
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export function MyComponent() {
  const { user, login, logout, token } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();

  const handleLogin = async () => {
    const result = await login('user@test.com', 'password');
    if (result.success) {
      console.log('Logged in!');
    }
  };

  const handleAddToCart = async () => {
    await addToCart({
      productId: 1,
      quantity: 1,
      price: 29.99,
      productName: 'T-Shirt',
      sku: 'TS-001',
      imageUrl: 'https://...'
    });
  };

  return (
    <>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      <button onClick={handleAddToCart}>Add to Cart</button>
    </>
  );
}
```

## 📱 API Response Format

All responses follow this format:

### Success
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🎯 Development Workflow

1. **Run Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Run Frontend** (in another terminal)
   ```bash
   npm run dev
   ```

3. **Test API** (using curl, Postman, or browser)
   ```bash
   curl http://localhost:5000/api/products
   ```

4. **Make Changes** - Both backend and frontend auto-reload
   - Backend files in `backend/src/`
   - Frontend files in `src/`

5. **Check Logs** - Look at terminal output for errors

## 📞 Quick Links

- API Documentation: `API_DOCUMENTATION.md`
- Setup Guide: `BACKEND_SETUP.md`
- Integration Complete: `BACKEND_INTEGRATION_COMPLETE.md`
- This Guide: `BACKEND_QUICK_REFERENCE.md`

---

**Remember**: Backend runs on `:5000`, Frontend on `:5173`
