# Admin Features Testing Guide

## Quick Start Testing

### 1. Login as Admin
```
URL: http://localhost:5173/admin/login
Email: admin@example.com (or your admin user)
Password: Your admin password
```

### 2. Test Each Admin Module

#### Categories Management
```
1. Go to: Admin Dashboard → Categories
2. URL: http://localhost:5173/admin/categories
3. Test:
   - [ ] View list of categories
   - [ ] Click "Add Category" button
   - [ ] Create new category
   - [ ] Click edit button on any category
   - [ ] Edit category details
   - [ ] Toggle active/inactive status
   - [ ] Delete a category
   - [ ] View sub-categories
```

#### Brands Management
```
1. Go to: Admin Dashboard → Brands
2. URL: http://localhost:5173/admin/brands
3. Test:
   - [ ] View list of brands
   - [ ] Click "Add Brand" button
   - [ ] Create new brand
   - [ ] Assign brand to categories
   - [ ] Edit brand details
   - [ ] Delete brand
   - [ ] Filter by category
```

#### Products Management
```
1. Go to: Admin Dashboard → Products
2. URL: http://localhost:5173/admin/products
3. Test:
   - [ ] View all products
   - [ ] Click "Add Product" button
   - [ ] Upload product images
   - [ ] Add product variants
   - [ ] Set pricing
   - [ ] Configure inventory
   - [ ] Edit existing product
   - [ ] Delete product
```

#### Customers Management
```
1. Go to: Admin Dashboard → Customers
2. URL: http://localhost:5173/admin/customers
3. Test:
   - [ ] View all customers
   - [ ] Search for customer
   - [ ] Click on customer to view details
   - [ ] Edit customer information
   - [ ] Suspend customer
   - [ ] Unsuspend customer
   - [ ] Reset password
   - [ ] Add internal note
   - [ ] Flag customer
```

#### Orders Management
```
1. Go to: Admin Dashboard → Orders
2. URL: http://localhost:5173/admin/orders
3. Test:
   - [ ] View all orders
   - [ ] Filter orders by status
   - [ ] Update order status
   - [ ] View order details
   - [ ] View order timeline
```

#### Delivery Management
```
1. Go to: Admin Dashboard → Delivery
2. URL: http://localhost:5173/admin/delivery
3. Test:
   - [ ] View deliveries
   - [ ] Assign delivery agent
   - [ ] Update delivery status
   - [ ] Add delivery note
   - [ ] Track delivery
```

#### Reviews Management
```
1. Go to: Admin Dashboard → Reviews
2. URL: http://localhost:5173/admin/reviews
3. Test:
   - [ ] View all reviews
   - [ ] Approve pending review
   - [ ] Reject review
   - [ ] Delete review
```

#### Payments Management
```
1. Go to: Admin Dashboard → Payments
2. URL: http://localhost:5173/admin/payments
3. Test:
   - [ ] View all payments
   - [ ] View payment details
   - [ ] Process refund
   - [ ] Track payment status
```

## Network Tab Testing

Open DevTools (F12) and go to Network tab to verify:

1. **Categories Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/categories
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

2. **Brands Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/brands
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

3. **Orders Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/orders
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

4. **Customers Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/customers
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

5. **Deliveries Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/deliveries
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

6. **Reviews Endpoint**
   ```
   Request: GET http://localhost:5000/api/admin/reviews
   Response: 200 OK
   Headers: Authorization: Bearer [token]
   ```

## Common Issues & Solutions

### Issue 1: "Failed to load categories"
```
Cause: API endpoint incorrect
Solution: Verify endpoint is /admin/categories (not /products/categories)
Check: Browser console → Network tab → verify request URL
```

### Issue 2: 401 Unauthorized Error
```
Cause: Authentication token not sent or expired
Solution: 
  1. Clear browser cache (Ctrl+Shift+Del)
  2. Logout and login again
  3. Check Authorization header in Network tab
```

### Issue 3: 403 Forbidden Error
```
Cause: User role is not ADMIN
Solution:
  1. Verify user role in database
  2. Check user object in browser console
  3. Update user role if needed
```

### Issue 4: CORS Error
```
Cause: Backend CORS settings incorrect
Solution:
  1. Check backend CORS configuration
  2. Verify API URL in frontend .env
  3. Restart backend server
```

### Issue 5: Data Not Loading
```
Cause: Backend endpoint returning error
Solution:
  1. Check backend logs
  2. Verify API endpoint exists
  3. Check database connection
  4. Verify SQL queries
```

## Performance Testing

### Page Load Times (Should be < 3 seconds)
- [ ] Categories page: __ seconds
- [ ] Brands page: __ seconds
- [ ] Products page: __ seconds
- [ ] Customers page: __ seconds
- [ ] Orders page: __ seconds
- [ ] Deliveries page: __ seconds
- [ ] Reviews page: __ seconds

### Data Operations (Should be < 2 seconds)
- [ ] Create category: __ seconds
- [ ] Update brand: __ seconds
- [ ] Add product: __ seconds
- [ ] Edit customer: __ seconds
- [ ] Update order status: __ seconds

## Browser Console Testing

Open Console (F12 → Console tab) and verify:

```javascript
// Check if user is authenticated
console.log(localStorage.getItem('auth_token'))
// Should return: [long token string]

// Check if user role is ADMIN
console.log(JSON.parse(localStorage.getItem('user')))
// Should show: { ..., role: 'ADMIN', ... }

// Check API base URL
console.log(import.meta.env.VITE_API_URL)
// Should return: http://localhost:5000/api
```

## Full Test Checklist

### Pre-Testing
- [ ] Backend is running
- [ ] Frontend is running  
- [ ] Database is accessible
- [ ] Admin user exists in database
- [ ] Admin user has ADMIN role

### Category Tests
- [ ] Can load category list
- [ ] Can create category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Status toggle works

### Brand Tests
- [ ] Can load brand list
- [ ] Can create brand
- [ ] Can edit brand
- [ ] Can delete brand
- [ ] Filter by category works

### Product Tests
- [ ] Can load products
- [ ] Can create product with images
- [ ] Can add variants
- [ ] Can edit product
- [ ] Can delete product

### Customer Tests
- [ ] Can load customers
- [ ] Can search customers
- [ ] Can view details
- [ ] Can edit customer
- [ ] Can suspend customer
- [ ] Can reset password

### Order Tests
- [ ] Can load orders
- [ ] Can filter orders
- [ ] Can update status
- [ ] Can view details

### Delivery Tests
- [ ] Can load deliveries
- [ ] Can assign agent
- [ ] Can update status
- [ ] Can add notes

### Review Tests
- [ ] Can load reviews
- [ ] Can approve review
- [ ] Can delete review

### Payment Tests
- [ ] Can load payments
- [ ] Can view details
- [ ] Can process refund

## Success Criteria

All admin features are working when:

✅ No console errors
✅ All pages load in < 3 seconds
✅ All API calls return 200 status
✅ Authorization headers present in requests
✅ CRUD operations succeed
✅ Toast notifications show success messages
✅ Data persists after page refresh
✅ No 401/403/404 errors

## Reporting Issues

If you find an issue:

1. **Document the steps to reproduce**
2. **Take screenshot of error**
3. **Check browser console for error message**
4. **Check Network tab for failed requests**
5. **Note the endpoint and request details**
6. **Check backend logs for server errors**

---

**Ready to Test**: ✅
**All Endpoints Fixed**: ✅
**API Documentation**: ✅
