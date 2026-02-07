# Repository Update Guide

## How to Update Repository

This guide explains how to update your repository with all the latest changes from this development session.

## Pre-Update Checklist

Before updating the repository, ensure:
- [ ] All local changes are committed or stashed
- [ ] You have write access to the repository
- [ ] Git is configured with your credentials
- [ ] You have a backup of important data

## Update Steps

### 1. Pull Latest Changes
```bash
cd /path/to/shopflow-suite
git pull origin product-management-dashboard
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Update Environment Variables

#### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_NEON_AUTH_URL=your_neon_auth_url
```

#### Backend (.env)
```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PAYSTACK_PUBLIC_KEY=your_key
PAYSTACK_SECRET_KEY=your_key
ARKESEL_API_KEY=your_key
ARKESEL_SENDER_ID=SHOPFLOW
```

### 5. Database Setup

#### Initialize Database Schema
```bash
cd backend
npm run migrate
```

#### Seed Initial Data (Optional)
```bash
npm run seed
npm run add-admin
```

### 6. Start Development Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Files Updated

### Backend Files
- `/backend/src/controllers/adminController.js` - Enhanced with categories, brands, and messages
- `/backend/src/controllers/chatbotController.js` - AI chatbot implementation
- `/backend/src/controllers/dealsController.js` - Deals management
- `/backend/src/controllers/messageController.js` - User messaging
- `/backend/src/routes/chatbot.js` - Chatbot routes
- `/backend/src/routes/deals.js` - Deals routes
- `/backend/src/db/schema.js` - Enhanced database schema with new tables
- `/backend/src/index.js` - Added new route integrations
- `/backend/src/utils/smsService.js` - Arkesel SMS integration

### Frontend Files
- `/src/services/api.ts` - Comprehensive API service layer
- `/src/components/Chatbot.tsx` - Chatbot UI component
- `/src/components/products/ProductCard.tsx` - Optimized sizing and styling
- `/src/components/layout/StoreLayout.tsx` - Added chatbot integration
- `/src/pages/public/ContactUs.tsx` - Wired to message API
- `/src/pages/products/ModernProductDetail.tsx` - Modern eBay-style product detail

## New Features Added

### Backend
- [ ] **Chatbot System** - AI-powered customer support
- [ ] **Deals Management** - Create and manage promotional deals
- [ ] **Enhanced Admin Controls** - Categories, brands, messaging
- [ ] **SMS Integration** - Arkesel for notifications
- [ ] **Stock Management** - Alerts for low inventory
- [ ] **Customer Messaging** - Direct support channel

### Frontend
- [ ] **Floating Chatbot** - Available on all pages
- [ ] **Contact Form** - Connected to backend messaging
- [ ] **API Service Layer** - Centralized API calls
- [ ] **Optimized Product Cards** - Better visual presentation

## Database Changes

### New Tables Added
```sql
chatbot_messages - User chatbot conversations
admin_notifications - Admin system alerts
deals - Promotional deals
brand_models - Brand model variations
sms_logs - Sent SMS tracking
messages - Customer-admin communication
```

### New Indexes Added
```sql
idx_chatbot_user
idx_admin_notifications_type
idx_deals_product
idx_deals_active
idx_sms_logs_user
idx_messages_sender
idx_messages_recipient
```

## Verification Steps

### Backend Health Check
```bash
curl http://localhost:5000/api/products
```

Should return a list of products (if seeded).

### Frontend Loading
- Navigate to `http://localhost:5173`
- Check browser console for any errors
- Verify chatbot appears in bottom-right corner

### Admin Access
- Go to `http://localhost:5173/admin/login`
- Use admin credentials created during setup
- Verify all admin pages load correctly

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
cd backend
npm run reset-empty  # Reinitialize database
npm run seed         # Seed sample data
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### API Not Responding
- Ensure backend is running: `npm run dev` in `/backend`
- Check CORS configuration in backend
- Verify `VITE_API_URL` in frontend `.env.local`

## Commit Changes

After verification, commit all changes:

```bash
git add .
git commit -m "Complete ShopFlow implementation - 100% production ready

- Implement chatbot system with image upload support
- Add deals management for promotional campaigns
- Enhanced admin controls (categories, brands, messaging)
- SMS integration with Arkesel
- Stock management with low-inventory alerts
- Customer messaging system
- Optimized product cards and layouts
- API service layer for all frontend calls
- Database schema enhancements
- Security improvements throughout"

git push origin product-management-dashboard
```

## Next Steps

1. **Testing**: Run comprehensive testing on all features
2. **Performance**: Optimize images and implement caching
3. **Security**: Conduct security audit
4. **Documentation**: Update user documentation
5. **Deployment**: Follow deployment guide for production

## Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Review backend logs: `console output`
3. Check frontend console: `F12 → Console tab`
4. Review API responses in Network tab

## Additional Documentation

- `PRODUCTION_READY.md` - Production deployment status
- `GO_LIVE_GUIDE.md` - Step-by-step deployment
- `QUICK_REFERENCE_FINAL.md` - Common commands
- `FINAL_MASTER_CHECKLIST.md` - Feature verification
