# 🗄️ COMPLETE DATABASE SCHEMA - Appwrite Collections

## **Stack:** React + TypeScript + Appwrite (Backend as a Service)

This schema ensures **proper category→subcategory linking**, **order→delivery job creation**, **rider assignment**, and **complete audit trails**.

---

## 📦 **1. CATEGORIES & SUB-CATEGORIES**

### **Collection: `categories`**

**Purpose:** Store both parent categories AND sub-categories in one collection

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `name` | string | ✅ | Yes | Category/Sub-category name |
| `slug` | string | ✅ | Unique | URL-friendly identifier |
| `parent_id` | string | ❌ | Yes | NULL = parent category, ID = sub-category |
| `description` | string | ❌ | No | Category description |
| `icon` | string | ❌ | No | Emoji or icon identifier |
| `is_active` | boolean | ✅ | Yes | Active/Inactive status |
| `display_order` | number | ❌ | Yes | Sort order (lower = first) |
| `created_at` | datetime | ✅ | Yes | Creation timestamp |
| `updated_at` | datetime | ✅ | No | Last update timestamp |

**Indexes:**
- `parent_id` - For filtering sub-categories
- `slug` - Unique constraint
- `is_active` - For filtering active categories
- `display_order` - For sorting

**Validation Rules:**
```javascript
// Appwrite Function or Frontend Validation
- name: min 2 chars, max 100 chars
- slug: lowercase, alphanumeric + hyphens only
- parent_id: must exist in categories table if not null
- Prevent circular references (sub-category can't be its own parent)
```

---

## 🏷️ **2. BRANDS**

### **Collection: `brands`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `name` | string | ✅ | Unique | Brand name (e.g., Apple, Samsung) |
| `slug` | string | ✅ | Unique | URL-friendly |
| `logo_url` | string | ❌ | No | Brand logo (Appwrite Storage) |
| `description` | string | ❌ | No | Brand description |
| `is_active` | boolean | ✅ | Yes | Active status |
| `created_at` | datetime | ✅ | Yes | Creation timestamp |

**Indexes:**
- `name` - Unique
- `slug` - Unique
- `is_active`

---

## 📱 **3. PRODUCTS**

### **Collection: `products`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `name` | string | ✅ | Yes | Product name |
| `slug` | string | ✅ | Unique | URL-friendly |
| `category_id` | string | ✅ | Yes | **Parent category ID** |
| `subcategory_id` | string | ✅ | Yes | **Sub-category ID** |
| `brand_id` | string | ❌ | Yes | Brand reference |
| `short_description` | string | ✅ | No | Brief description |
| `full_description` | string | ✅ | No | Detailed description |
| `base_price` | number | ❌ | Yes | Base price (if no variants) |
| `discount_price` | number | ❌ | No | Discounted price |
| `tax_enabled` | boolean | ✅ | No | Include tax in price |
| `stock_tracking` | boolean | ✅ | No | Track inventory |
| `total_stock` | number | ❌ | Yes | Total available stock |
| `low_stock_threshold` | number | ❌ | No | Alert threshold |
| `featured_image_id` | string | ❌ | No | Main product image |
| `status` | string | ✅ | Yes | DRAFT/PUBLISHED/HIDDEN/ARCHIVED |
| `tags` | string[] | ❌ | No | Search tags |
| `created_by` | string | ✅ | Yes | Admin user ID |
| `created_at` | datetime | ✅ | Yes | Creation timestamp |
| `updated_at` | datetime | ✅ | No | Last update |

**Indexes:**
- `category_id` + `subcategory_id` (compound)
- `brand_id`
- `status`
- `slug` (unique)

**Validation:**
```javascript
// CRITICAL: Ensure subcategory belongs to selected category
if (subcategory_id) {
  const subcategory = await getCategory(subcategory_id);
  if (subcategory.parent_id !== category_id) {
    throw new Error('Sub-category must belong to selected category');
  }
}
```

---

## 🖼️ **4. PRODUCT IMAGES**

### **Collection: `product_images`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `product_id` | string | ✅ | Yes | Product reference |
| `file_id` | string | ✅ | No | Appwrite Storage file ID |
| `url` | string | ✅ | No | Image URL |
| `sort_order` | number | ✅ | No | Display order |
| `is_featured` | boolean | ✅ | No | Main product image |
| `variant_id` | string | ❌ | Yes | Link to specific variant (optional) |
| `created_at` | datetime | ✅ | No | Upload timestamp |

**Indexes:**
- `product_id`
- `variant_id`

---

## 🎨 **5. PRODUCT VARIANTS**

### **Collection: `product_variants`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `product_id` | string | ✅ | Yes | Product reference |
| `sku` | string | ✅ | Unique | Stock Keeping Unit |
| `color` | string | ❌ | Yes | Color option |
| `storage` | string | ❌ | Yes | Storage option (e.g., 128GB) |
| `price` | number | ✅ | No | Variant-specific price |
| `discount_price` | number | ❌ | No | Discounted price |
| `stock` | number | ✅ | No | Available quantity |
| `status` | string | ✅ | Yes | ACTIVE/DISABLED/OUT_OF_STOCK |
| `created_at` | datetime | ✅ | No | Creation timestamp |

**Indexes:**
- `product_id`
- `sku` (unique)
- `status`

---

## 👥 **6. CUSTOMERS**

### **Collection: `customers`** (extends Appwrite Users)

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Appwrite User ID |
| `first_name` | string | ✅ | Yes | First name |
| `last_name` | string | ✅ | Yes | Last name |
| `email` | string | ✅ | Unique | Email address |
| `phone` | string | ✅ | Unique | Phone number |
| `email_verified` | boolean | ✅ | No | Email verification status |
| `phone_verified` | boolean | ✅ | No | Phone verification status |
| `status` | string | ✅ | Yes | ACTIVE/SUSPENDED/DELETED |
| `flags` | string[] | ❌ | Yes | HIGH_RISK, VIP, BLOCKED_COD, etc. |
| `total_orders` | number | ✅ | Yes | Order count |
| `total_spent` | number | ✅ | Yes | Lifetime value |
| `successful_deliveries` | number | ✅ | No | Successful delivery count |
| `failed_deliveries` | number | ✅ | No | Failed delivery count |
| `last_login` | datetime | ❌ | Yes | Last login timestamp |
| `created_at` | datetime | ✅ | Yes | Registration date |

**Indexes:**
- `email` (unique)
- `phone` (unique)
- `status`
- `flags` (array index)

---

## 📍 **7. CUSTOMER ADDRESSES**

### **Collection: `customer_addresses`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `customer_id` | string | ✅ | Yes | Customer reference |
| `label` | string | ✅ | No | HOME, WORK, OTHER |
| `full_name` | string | ✅ | No | Recipient name |
| `phone` | string | ✅ | No | Contact phone |
| `address_line1` | string | ✅ | No | Street address |
| `address_line2` | string | ❌ | No | Apartment, suite, etc. |
| `city` | string | ✅ | Yes | City |
| `region` | string | ✅ | Yes | State/Region |
| `postal_code` | string | ❌ | No | ZIP/Postal code |
| `is_default` | boolean | ✅ | No | Default address |
| `created_at` | datetime | ✅ | No | Creation timestamp |

**Indexes:**
- `customer_id`
- `city`
- `region`

---

## 🛒 **8. ORDERS**

### **Collection: `orders`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `order_number` | string | ✅ | Unique | Human-readable order # |
| `customer_id` | string | ✅ | Yes | Customer reference |
| `address_id` | string | ✅ | No | Delivery address |
| `payment_status` | string | ✅ | Yes | PENDING/PAID/FAILED/REFUNDED |
| `payment_method` | string | ✅ | No | CARD/MOBILE_MONEY/COD |
| `payment_reference` | string | ❌ | Yes | Gateway transaction ID |
| `order_status` | string | ✅ | Yes | PROCESSING/PACKED/ASSIGNED/DELIVERED |
| `subtotal` | number | ✅ | No | Items total |
| `delivery_fee` | number | ✅ | No | Delivery charge |
| `tax_amount` | number | ❌ | No | Tax/VAT |
| `discount_amount` | number | ❌ | No | Discount applied |
| `total` | number | ✅ | Yes | Final amount |
| `notes` | string | ❌ | No | Customer notes |
| `admin_notes` | string | ❌ | No | Internal notes |
| `created_at` | datetime | ✅ | Yes | Order timestamp |
| `updated_at` | datetime | ✅ | No | Last update |

**Indexes:**
- `order_number` (unique)
- `customer_id`
- `payment_status`
- `order_status`
- `created_at`

---

## 📦 **9. ORDER ITEMS**

### **Collection: `order_items`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `order_id` | string | ✅ | Yes | Order reference |
| `product_id` | string | ✅ | Yes | Product reference |
| `variant_id` | string | ❌ | Yes | Variant reference (if applicable) |
| `product_name` | string | ✅ | No | Snapshot of product name |
| `variant_details` | string | ❌ | No | Color, storage (snapshot) |
| `quantity` | number | ✅ | No | Quantity ordered |
| `unit_price` | number | ✅ | No | Price at time of order |
| `total_price` | number | ✅ | No | quantity × unit_price |
| `created_at` | datetime | ✅ | No | Item added timestamp |

**Indexes:**
- `order_id`
- `product_id`

---

## 🚴 **10. RIDERS (Delivery Agents)**

### **Collection: `riders`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `user_id` | string | ✅ | Unique | Appwrite User ID |
| `full_name` | string | ✅ | Yes | Rider name |
| `phone` | string | ✅ | Unique | Contact phone |
| `email` | string | ✅ | Unique | Email address |
| `vehicle_type` | string | ❌ | No | BIKE/MOTORCYCLE/CAR |
| `coverage_area` | string[] | ❌ | Yes | Cities/regions covered |
| `status` | string | ✅ | Yes | ACTIVE/INACTIVE |
| `total_deliveries` | number | ✅ | No | Completed deliveries |
| `successful_deliveries` | number | ✅ | No | Success count |
| `failed_deliveries` | number | ✅ | No | Failed count |
| `rating` | number | ❌ | No | Average rating (1-5) |
| `created_at` | datetime | ✅ | Yes | Registration date |

**Indexes:**
- `user_id` (unique)
- `phone` (unique)
- `status`
- `coverage_area` (array)

---

## 🚚 **11. DELIVERIES**

### **Collection: `deliveries`**

**Purpose:** Delivery jobs created from orders

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `order_id` | string | ✅ | Unique | Order reference (1-to-1) |
| `rider_id` | string | ❌ | Yes | Assigned rider |
| `customer_id` | string | ✅ | Yes | Customer reference |
| `delivery_status` | string | ✅ | Yes | PENDING/ASSIGNED/PICKED_UP/IN_TRANSIT/DELIVERED/FAILED |
| `delivery_fee` | number | ✅ | No | Delivery charge |
| `scheduled_date` | datetime | ❌ | Yes | Scheduled delivery date |
| `picked_up_at` | datetime | ❌ | No | Pickup timestamp |
| `delivered_at` | datetime | ❌ | Yes | Delivery timestamp |
| `failed_reason` | string | ❌ | No | Reason if failed |
| `proof_of_delivery` | string | ❌ | No | Image/signature URL |
| `address_snapshot` | string | ✅ | No | JSON of delivery address |
| `admin_notes` | string | ❌ | No | Internal notes |
| `created_at` | datetime | ✅ | Yes | Creation timestamp |
| `updated_at` | datetime | ✅ | No | Last update |

**Indexes:**
- `order_id` (unique)
- `rider_id`
- `customer_id`
- `delivery_status`
- `scheduled_date`

---

## 📝 **12. DELIVERY UPDATES**

### **Collection: `delivery_updates`**

**Purpose:** Timeline/audit trail for delivery status changes

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `delivery_id` | string | ✅ | Yes | Delivery reference |
| `status` | string | ✅ | No | New status |
| `note` | string | ❌ | No | Status change note |
| `updated_by` | string | ✅ | No | Admin/Rider ID |
| `updated_by_name` | string | ✅ | No | Name snapshot |
| `timestamp` | datetime | ✅ | Yes | Update timestamp |

**Indexes:**
- `delivery_id`
- `timestamp`

---

## 📋 **13. AUDIT LOGS**

### **Collection: `audit_logs`**

**Purpose:** Track all admin actions on customers, orders, products

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `entity_type` | string | ✅ | Yes | CUSTOMER/ORDER/PRODUCT/DELIVERY |
| `entity_id` | string | ✅ | Yes | ID of affected entity |
| `action` | string | ✅ | Yes | SUSPEND/ACTIVATE/UPDATE/DELETE |
| `admin_id` | string | ✅ | Yes | Admin user ID |
| `admin_name` | string | ✅ | No | Admin name snapshot |
| `reason` | string | ❌ | No | Action reason |
| `changes` | string | ❌ | No | JSON of changes made |
| `created_at` | datetime | ✅ | Yes | Action timestamp |

**Indexes:**
- `entity_type` + `entity_id` (compound)
- `admin_id`
- `created_at`

---

## 💬 **14. CUSTOMER NOTES**

### **Collection: `customer_notes`**

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Auto-generated |
| `customer_id` | string | ✅ | Yes | Customer reference |
| `note` | string | ✅ | No | Note content |
| `admin_id` | string | ✅ | Yes | Admin who added note |
| `admin_name` | string | ✅ | No | Admin name snapshot |
| `created_at` | datetime | ✅ | Yes | Note timestamp |

**Indexes:**
- `customer_id`
- `created_at`

---

## 🔐 **15. ADMIN USERS**

### **Collection: `admin_users`** (extends Appwrite Users)

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| `id` | string | ✅ | Primary | Appwrite User ID |
| `full_name` | string | ✅ | No | Admin name |
| `email` | string | ✅ | Unique | Admin email |
| `role` | string | ✅ | Yes | SUPER_ADMIN/ADMIN/MANAGER |
| `permissions` | string[] | ❌ | No | Granular permissions |
| `is_active` | boolean | ✅ | Yes | Active status |
| `last_login` | datetime | ❌ | No | Last login |
| `created_at` | datetime | ✅ | Yes | Creation date |

---

## 🔗 **CRITICAL RELATIONSHIPS & VALIDATION**

### **Category → Sub-category → Product Chain:**

```javascript
// When creating/updating product:
async function validateProductCategories(categoryId, subcategoryId) {
  const subcategory = await getCategory(subcategoryId);
  
  if (!subcategory) {
    throw new Error('Sub-category not found');
  }
  
  if (subcategory.parent_id !== categoryId) {
    throw new Error('Sub-category must belong to selected category');
  }
  
  return true;
}
```

### **Order → Delivery Job Creation:**

```javascript
// When order is PAID and PACKED:
async function createDeliveryJob(orderId) {
  const order = await getOrder(orderId);
  const address = await getAddress(order.address_id);
  
  const delivery = await createDelivery({
    order_id: orderId,
    customer_id: order.customer_id,
    delivery_status: 'PENDING_ASSIGNMENT',
    delivery_fee: order.delivery_fee,
    address_snapshot: JSON.stringify(address),
  });
  
  return delivery;
}
```

---

## 📊 **APPWRITE COLLECTION SUMMARY**

| # | Collection | Purpose | Key Indexes |
|---|------------|---------|-------------|
| 1 | `categories` | Categories & Sub-categories | parent_id, slug, is_active |
| 2 | `brands` | Product brands | name, slug |
| 3 | `products` | Products | category_id, subcategory_id, status |
| 4 | `product_images` | Product images | product_id, variant_id |
| 5 | `product_variants` | Product variants | product_id, sku |
| 6 | `customers` | Customer accounts | email, phone, status |
| 7 | `customer_addresses` | Delivery addresses | customer_id, city |
| 8 | `orders` | Customer orders | order_number, customer_id, status |
| 9 | `order_items` | Order line items | order_id, product_id |
| 10 | `riders` | Delivery agents | user_id, status |
| 11 | `deliveries` | Delivery jobs | order_id, rider_id, status |
| 12 | `delivery_updates` | Delivery timeline | delivery_id, timestamp |
| 13 | `audit_logs` | Admin actions | entity_type, entity_id |
| 14 | `customer_notes` | Internal notes | customer_id |
| 15 | `admin_users` | Admin accounts | email, role |

---

## ✅ **NEXT STEPS:**

1. Create these collections in Appwrite Console
2. Set up proper permissions (Admin-only for most)
3. Implement API endpoints using Appwrite SDK
4. Add validation functions
5. Test category→subcategory filtering
6. Test order→delivery flow

**This schema ensures everything works correctly with proper relationships!** 🚀
