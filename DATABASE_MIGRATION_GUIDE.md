# Database Migration & Seeding Guide

## Overview

Your ShopFlow backend has automated database management:
- **Automatic Schema Creation** - Tables created on first server start
- **Automatic Seeding** - Sample data can be loaded on demand
- **Easy Reset** - Clear all data and reseed with one command

---

## 🚀 Quick Start

### 1. Connect to Neon Database

Make sure your `.env` file has the correct Neon connection:
```
DATABASE_URL=postgresql://neondb_owner:npg_2OQMKols6Fbf@ep-autumn-base-ahlki62w-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Create Database Schema

The schema is automatically created when you start the server:
```bash
cd backend
npm run dev
```

**What happens:**
- ✅ Connects to Neon database
- ✅ Creates all 16 tables
- ✅ Creates indexes for performance
- ✅ Logs success message

---

## 📦 Database Seeding

### Seed Sample Data

Load sample products, categories, brands, and test users:

```bash
cd backend
npm run seed
```

**What gets added:**
- ✅ 5 Categories (Electronics, Clothing, Books, etc.)
- ✅ 5 Brands (Apple, Samsung, Nike, Adidas, Sony)
- ✅ 5 Sample Products
- ✅ 2 Test Users

### Test Users Created

After seeding:

| Email | Password | Role |
|-------|----------|------|
| admin@shopflow.com | admin123 | ADMIN |
| customer@shopflow.com | customer123 | CUSTOMER |

---

## 🔄 Reset Database

### Complete Reset (Delete All Data)

Reset everything and reseed with fresh data:

```bash
cd backend
npm run reset
```

**What happens:**
1. ⚠️ Drops all tables
2. ✅ Recreates schema
3. ✅ Reseeds sample data
4. ✅ Ready to use

---

## 🛠️ Available Commands

### Create Schema Only
```bash
npm run dev
# Stops when server starts, but schema is created
# Press Ctrl+C to stop
```

### Seed Data
```bash
npm run seed
# Adds sample data to existing tables
```

### Full Reset
```bash
npm run reset
# Drops everything and starts fresh
```

### Start Server (Normal)
```bash
npm run dev
```

---

## 📋 Schema Overview

### Tables Created (16 total)

| Table | Purpose |
|-------|---------|
| users | User accounts & authentication |
| categories | Product categories |
| brands | Product brands |
| products | Product information |
| product_variants | Product sizes, colors, etc. |
| product_images | Product images |
| cart_items | Shopping cart items |
| wishlist | User wishlist items |
| addresses | Shipping addresses |
| orders | Customer orders |
| order_items | Items in each order |
| payments | Payment records |
| reviews | Product reviews |
| coupons | Discount coupons |
| deliveries | Delivery tracking |
| delivery_updates | Delivery status history |
| notifications | User notifications |

### Indexes Created (8 total)

Indexes speed up queries:
- `idx_products_category` - Filter products by category
- `idx_products_brand` - Filter products by brand
- `idx_cart_items_user` - Get user's cart
- `idx_wishlist_user` - Get user's wishlist
- `idx_orders_user` - Get user's orders
- `idx_reviews_product` - Get product reviews
- `idx_reviews_user` - Get user's reviews
- `idx_addresses_user` - Get user's addresses

---

## ✅ Workflow Examples

### Scenario 1: First Time Setup
```bash
# Start backend (creates schema)
npm run dev

# In another terminal, seed data
npm run seed

# Frontend is ready to use!
```

### Scenario 2: Add More Sample Data
```bash
# Edit backend/src/db/seed.js to add more products/users
# Then run:
npm run reset

# Database now has your new data
```

### Scenario 3: Clean Everything
```bash
# Reset to fresh state
npm run reset

# Database is clean with sample data
```

---

## 🔍 Verify Database

### Check Tables Exist

```bash
# In PostgreSQL CLI
\dt

# Or query via API
curl http://localhost:5000/api/products
```

### Check Sample Data

```bash
# Get all products
curl http://localhost:5000/api/products

# Get categories
curl http://localhost:5000/api/products/categories

# Get brands
curl http://localhost:5000/api/products/brands
```

---

## 🗄️ Connect to Neon Console

Access your Neon database directly:

1. Go to https://console.neon.tech
2. Login with your credentials
3. Select your project
4. Open SQL Editor
5. View/run queries directly

### Common Neon Queries

```sql
-- View all users
SELECT * FROM users;

-- View all products
SELECT * FROM products;

-- View all orders
SELECT * FROM orders;

-- Count products by category
SELECT c.name, COUNT(p.id) as product_count
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name;

-- Check stock levels
SELECT name, stock FROM products WHERE stock < 10;
```

---

## 📊 Sample Data Included

### Categories
1. Electronics
2. Clothing
3. Books
4. Home & Garden
5. Sports & Outdoors

### Brands
1. Apple
2. Samsung
3. Nike
4. Adidas
5. Sony

### Products
1. iPhone 14 Pro - $999
2. Samsung Galaxy S23 - $899
3. Nike Air Max - $150
4. Adidas Ultraboost - $180
5. Sony WH-1000XM5 - $399

### Test Users
1. Admin User - admin@shopflow.com
2. Customer User - customer@shopflow.com

---

## ⚠️ Important Notes

### Automatic Schema Creation
- Schema is created automatically on first `npm run dev`
- Tables are created with `CREATE TABLE IF NOT EXISTS`
- Safe to run multiple times (won't recreate existing tables)

### Seeding
- Only seeds if database is empty
- Won't duplicate data on multiple runs
- Check current users with: `npm run seed`

### Data Persistence
- Neon database persists data automatically
- Data survives server restarts
- Only deleted with `npm run reset`

---

## 🚀 Production Migration

### For Production Neon Database

1. **Update .env with production credentials**
   ```
   DATABASE_URL=postgresql://prod_user:prod_password@prod-host.neon.tech/prod_db
   NODE_ENV=production
   ```

2. **Create schema**
   ```bash
   npm run dev
   # Wait for "Database schema initialized"
   # Ctrl+C to stop
   ```

3. **Optional: Add seed data**
   ```bash
   npm run seed
   # Adds sample products for testing
   ```

4. **Verify connection**
   ```bash
   curl https://your-production-api.com/health
   ```

---

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Check .env has correct DATABASE_URL
cat backend/.env | grep DATABASE_URL

# Verify Neon database is active
# Check Neon console at https://console.neon.tech
```

### "Table already exists"
```bash
# This is OK - schema checks for existing tables
# Continue with seeding
npm run seed
```

### "Seed failed - Email already exists"
```bash
# Database already has seed data
# Reset if you want fresh data:
npm run reset
```

### "No matching version found for jsonwebtoken"
```bash
# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

---

## 📝 Custom Seeding

### Add More Sample Data

Edit `backend/src/db/seed.js`:

```javascript
const seedData = {
  products: [
    // Add your products here
    {
      name: 'Your Product',
      description: 'Description',
      base_price: 99.99,
      category_name: 'Electronics',
      brand_name: 'Apple',
      sku: 'SKU-001',
      stock: 50,
    },
  ],
};
```

Then run:
```bash
npm run reset
```

---

## ✨ Database Ready!

Your database is now:
- ✅ Connected to Neon PostgreSQL
- ✅ Schema automatically created
- ✅ Ready for seeding
- ✅ Ready for production use

### Next Steps:
1. Run `npm run dev` to create schema
2. Run `npm run seed` to add sample data
3. Test at http://localhost:8080
4. API endpoints ready at http://localhost:5000

---

**All database operations are automated and secure!** 🎉
