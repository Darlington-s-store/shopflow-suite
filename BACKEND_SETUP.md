# ShopFlow Backend Setup Guide

## Prerequisites
- Node.js (v16+)
- PostgreSQL (or Neon account)
- npm or yarn

## Installation Steps

### 1. Set up environment variables

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/shopflow
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:5173
```

**For Neon (PostgreSQL Hosting):**
1. Create a new project at https://neon.tech
2. Copy the connection string from your Neon dashboard
3. Paste it as your `DATABASE_URL`

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Initialize database

The database schema will be created automatically when the server starts.

### 4. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Frontend Configuration

### Update Vite environment variables

Create or update `.env` in the root directory:

```
VITE_API_URL=http://localhost:5000/api
```

### Install dependencies and run frontend

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Testing the API

### 1. Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

### 2. Create a test product (as admin)

First, create an admin user or login with existing credentials:

```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Then create a product:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "T-Shirt",
    "description": "Comfortable cotton t-shirt",
    "basePrice": 29.99,
    "category": 1,
    "brand": 1,
    "sku": "TS-001",
    "stock": 100
  }'
```

### 3. Get all products

```bash
curl http://localhost:5000/api/products
```

### 4. Add product to cart

```bash
curl -X POST http://localhost:5000/api/user/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "price": 29.99,
    "productName": "T-Shirt",
    "sku": "TS-001",
    "imageUrl": "https://..."
  }'
```

## Database Schema

The backend automatically creates the following tables:

- `users` - User accounts with authentication
- `products` - Product information
- `product_variants` - Product sizes, colors, etc.
- `product_images` - Product images
- `categories` - Product categories
- `brands` - Product brands
- `cart_items` - Shopping cart items
- `wishlist` - Wishlist items
- `addresses` - Shipping addresses
- `orders` - Customer orders
- `order_items` - Items in each order
- `payments` - Payment records
- `reviews` - Product reviews
- `coupons` - Discount coupons
- `deliveries` - Delivery information
- `delivery_updates` - Delivery status updates
- `notifications` - User notifications

## API Endpoints Summary

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for complete endpoint documentation.

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/admin-login` - Admin login
- `GET /auth/profile` - Get current user (requires auth)
- `PUT /auth/profile` - Update profile (requires auth)

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Cart
- `POST /user/cart` - Add to cart
- `GET /user/cart` - Get cart items
- `DELETE /user/cart/:productId` - Remove from cart
- `DELETE /user/cart` - Clear cart

### Orders
- `POST /orders` - Create order from cart
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:orderId/payment` - Process payment

### Reviews
- `POST /reviews` - Submit review
- `GET /reviews/product/:productId` - Get product reviews

### And more...

## Troubleshooting

### Database connection failed
- Check your `DATABASE_URL` is correct
- Ensure Neon database is created and active
- Verify network connection to database host

### Port 5000 already in use
- Change `PORT` in `.env` to a different port
- Or kill the process using port 5000:
  ```bash
  # On Windows (PowerShell):
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```

### CORS errors
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure backend is running before frontend

### Authentication errors
- Verify token is being sent with `Authorization: Bearer TOKEN` header
- Check JWT_SECRET matches between requests
- Ensure token hasn't expired (default 7 days)

## Production Deployment

### Using Neon for database:
1. Create a Neon project and copy the connection string
2. Set `DATABASE_URL` to your Neon connection string
3. Deploy the backend to a hosting service (Vercel, Render, Railway, etc.)
4. Update `FRONTEND_URL` to your production frontend URL

### Environment variables for production:
```
NODE_ENV=production
DATABASE_URL=<your-neon-connection-string>
JWT_SECRET=<strong-random-secret>
PORT=<your-port>
STRIPE_SECRET_KEY=<your-stripe-key>
FRONTEND_URL=<your-production-frontend-url>
```

## Next Steps

1. Test all endpoints with provided examples
2. Connect frontend to backend APIs
3. Set up payment processing with Stripe
4. Deploy to production
5. Set up monitoring and error tracking

For detailed API documentation, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
