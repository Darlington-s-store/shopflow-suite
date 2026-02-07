# ShopFlow Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
  ```
- **Response:** `{ success: true, user: {...}, token: "..." }`

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** `{ success: true, user: {...}, token: "..." }`

### Admin Login
- **POST** `/auth/admin-login`
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response:** `{ success: true, user: {...}, token: "..." }`

### Get Profile
- **GET** `/auth/profile`
- **Auth:** Required
- **Response:** `{ success: true, user: {...} }`

### Update Profile
- **PUT** `/auth/profile`
- **Auth:** Required
- **Body:** Any user field (firstName, lastName, phone, avatar, etc.)
- **Response:** `{ success: true, user: {...} }`

---

## Product Endpoints

### Get All Products
- **GET** `/products?category=1&brand=1&search=shirt&limit=10&offset=0`
- **Response:** `{ success: true, products: [...], total: 100 }`

### Get Product By ID
- **GET** `/products/:id`
- **Response:** `{ success: true, product: {..., variants: [...], images: [...]} }`

### Create Product (Admin)
- **POST** `/products`
- **Auth:** Required (Admin)
- **Body:**
  ```json
  {
    "name": "T-Shirt",
    "description": "...",
    "basePrice": 29.99,
    "category": 1,
    "brand": 1,
    "sku": "TS-001",
    "stock": 100,
    "variants": [
      { "size": "M", "color": "Blue", "price": 29.99, "stock": 50 }
    ],
    "images": ["url1", "url2"]
  }
  ```
- **Response:** `{ success: true, product: {...} }`

### Update Product (Admin)
- **PUT** `/products/:id`
- **Auth:** Required (Admin)
- **Body:** Any product field
- **Response:** `{ success: true, product: {...} }`

### Delete Product (Admin)
- **DELETE** `/products/:id`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, message: "..." }`

### Get Categories
- **GET** `/products/categories`
- **Response:** `{ success: true, categories: [...] }`

### Create Category (Admin)
- **POST** `/products/categories`
- **Auth:** Required (Admin)
- **Body:** `{ "name": "Clothing", "description": "..." }`
- **Response:** `{ success: true, category: {...} }`

### Get Brands
- **GET** `/products/brands`
- **Response:** `{ success: true, brands: [...] }`

### Create Brand (Admin)
- **POST** `/products/brands`
- **Auth:** Required (Admin)
- **Body:** `{ "name": "Nike", "description": "..." }`
- **Response:** `{ success: true, brand: {...} }`

---

## User (Cart, Wishlist, Addresses) Endpoints

### Cart - Add to Cart
- **POST** `/user/cart`
- **Auth:** Required
- **Body:**
  ```json
  {
    "productId": 1,
    "variantId": null,
    "quantity": 1,
    "productName": "T-Shirt",
    "price": 29.99,
    "sku": "TS-001",
    "imageUrl": "url"
  }
  ```
- **Response:** `{ success: true, cartItem: {...} }`

### Cart - Get Cart
- **GET** `/user/cart`
- **Auth:** Required
- **Response:** `{ success: true, cart: [...] }`

### Cart - Remove from Cart
- **DELETE** `/user/cart/:productId`
- **Auth:** Required
- **Response:** `{ success: true, message: "..." }`

### Cart - Clear Cart
- **DELETE** `/user/cart`
- **Auth:** Required
- **Response:** `{ success: true, message: "..." }`

### Wishlist - Add to Wishlist
- **POST** `/user/wishlist`
- **Auth:** Required
- **Body:** `{ "productId": 1 }`
- **Response:** `{ success: true, wishlistItem: {...} }`

### Wishlist - Get Wishlist
- **GET** `/user/wishlist`
- **Auth:** Required
- **Response:** `{ success: true, wishlist: [...] }`

### Wishlist - Remove from Wishlist
- **DELETE** `/user/wishlist/:productId`
- **Auth:** Required
- **Response:** `{ success: true, message: "..." }`

### Address - Add Address
- **POST** `/user/addresses`
- **Auth:** Required
- **Body:**
  ```json
  {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "default": false
  }
  ```
- **Response:** `{ success: true, address: {...} }`

### Address - Get Addresses
- **GET** `/user/addresses`
- **Auth:** Required
- **Response:** `{ success: true, addresses: [...] }`

### Address - Update Address
- **PUT** `/user/addresses/:id`
- **Auth:** Required
- **Body:** Any address field
- **Response:** `{ success: true, address: {...} }`

### Address - Delete Address
- **DELETE** `/user/addresses/:id`
- **Auth:** Required
- **Response:** `{ success: true, message: "..." }`

---

## Order Endpoints

### Create Order
- **POST** `/orders`
- **Auth:** Required
- **Body:** `{ "shippingAddressId": 1 }`
- **Response:** `{ success: true, order: {...} }`

### Get User Orders
- **GET** `/orders`
- **Auth:** Required
- **Response:** `{ success: true, orders: [...] }`

### Get Order By ID
- **GET** `/orders/:id`
- **Auth:** Required
- **Response:** `{ success: true, order: {..., items: [...], payment: {...}, delivery: {...}} }`

### Process Payment
- **POST** `/orders/:orderId/payment`
- **Auth:** Required
- **Body:**
  ```json
  {
    "paymentMethod": "CARD",
    "reference": "stripe_payment_id"
  }
  ```
- **Response:** `{ success: true, payment: {...} }`

### Get All Orders (Admin)
- **GET** `/orders`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, orders: [...] }`

### Update Order Status (Admin)
- **PUT** `/orders/:id/status`
- **Auth:** Required (Admin)
- **Body:** `{ "status": "CONFIRMED" }`
- **Response:** `{ success: true, order: {...} }`

---

## Review Endpoints

### Submit Review
- **POST** `/reviews`
- **Auth:** Required
- **Body:**
  ```json
  {
    "productId": 1,
    "rating": 5,
    "comment": "Great product!"
  }
  ```
- **Response:** `{ success: true, review: {...} }`

### Get Product Reviews
- **GET** `/reviews/product/:productId`
- **Response:** `{ success: true, reviews: [...], avgRating: 4.5 }`

### Get All Reviews (Admin)
- **GET** `/reviews`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, reviews: [...] }`

### Update Review Status (Admin)
- **PUT** `/reviews/:id/status`
- **Auth:** Required (Admin)
- **Body:** `{ "status": "APPROVED" }`
- **Response:** `{ success: true, review: {...} }`

### Delete Review (Admin)
- **DELETE** `/reviews/:id`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, message: "..." }`

---

## Coupon Endpoints

### Apply Coupon
- **POST** `/coupons/apply`
- **Auth:** Required
- **Body:** `{ "code": "SAVE20", "cartTotal": 100 }`
- **Response:** `{ success: true, coupon: {...}, discount: 20, finalTotal: 80 }`

### Get Coupons (Admin)
- **GET** `/coupons`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, coupons: [...] }`

### Create Coupon (Admin)
- **POST** `/coupons`
- **Auth:** Required (Admin)
- **Body:**
  ```json
  {
    "code": "SAVE20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "minPurchase": 50,
    "expiryDate": "2024-12-31",
    "usageLimit": 100,
    "perUserLimit": 1
  }
  ```
- **Response:** `{ success: true, coupon: {...} }`

### Update Coupon (Admin)
- **PUT** `/coupons/:id`
- **Auth:** Required (Admin)
- **Body:** Any coupon field
- **Response:** `{ success: true, coupon: {...} }`

### Delete Coupon (Admin)
- **DELETE** `/coupons/:id`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, message: "..." }`

---

## Delivery Endpoints

### Get Delivery by Order (Customer)
- **GET** `/deliveries/order/:orderId`
- **Auth:** Required
- **Response:** `{ success: true, delivery: {..., updates: [...]} }`

### Get Deliveries (Admin)
- **GET** `/deliveries?status=ASSIGNED&agentId=1`
- **Auth:** Required (Admin)
- **Response:** `{ success: true, deliveries: [...] }`

### Assign Delivery (Admin)
- **POST** `/deliveries/:deliveryId/assign`
- **Auth:** Required (Admin)
- **Body:** `{ "agentId": 5 }`
- **Response:** `{ success: true, delivery: {...} }`

### Update Delivery Status (Agent)
- **PUT** `/deliveries/:deliveryId/status`
- **Auth:** Required (Delivery Agent)
- **Body:**
  ```json
  {
    "status": "IN_TRANSIT",
    "location": "Lat: 40.7128, Lng: -74.0060",
    "notes": "On the way"
  }
  ```
- **Response:** `{ success: true, delivery: {...} }`

### Get Agent Deliveries (Agent)
- **GET** `/deliveries/agent/active`
- **Auth:** Required (Delivery Agent)
- **Response:** `{ success: true, deliveries: [...] }`

---

## Order Status Values
- `PENDING` - Initial state
- `PENDING_CONFIRMATION` - Payment processed
- `CONFIRMED` - Admin confirmed
- `PROCESSING` - Being prepared
- `SHIPPED` - In transit
- `DELIVERED` - Delivered
- `CANCELLED` - Cancelled

## Delivery Status Values
- `PENDING` - Not yet assigned
- `ASSIGNED` - Assigned to agent
- `IN_TRANSIT` - Agent is delivering
- `DELIVERED` - Successfully delivered
- `FAILED` - Delivery attempt failed

## Review Status Values
- `PENDING` - Awaiting approval
- `APPROVED` - Visible to public
- `REJECTED` - Not approved

---

## Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/shopflow
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
```

---

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `403` - Forbidden
- `404` - Not found
- `500` - Server error
