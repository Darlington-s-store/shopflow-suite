# ShopFlow Deployment & Tech Stack Guide

## 📊 Complete Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context + SWR
- **HTTP Client:** Fetch API
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Build Tool:** Vite
- **Package Manager:** npm

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon serverless)
- **Authentication:** JWT + HTTP-only cookies
- **Password Hashing:** bcrypt
- **SMS Service:** Arkesel API
- **Environment:** dotenv
- **CORS:** Express CORS middleware
- **Port:** 5000

### Database (PostgreSQL)
- **Provider:** Neon (serverless)
- **Connection:** Pool with 20 connections
- **Tables:** 18+ with relationships
- **Indexes:** 30+ performance indexes
- **ORM:** Raw SQL with parameterized queries
- **Backup:** Automatic Neon backups

---

## 🔐 Environment Variables

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# In production:
VITE_API_URL=https://api.shopflow.com/api
```

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host/database

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# SMS Service (Arkesel)
ARKESEL_API_KEY=your_arkesel_api_key
ARKESEL_BASE_URL=https://sms.arkesel.com/api/send/

# CORS
FRONTEND_URL=http://localhost:5173

# Admin Settings
ADMIN_PHONE=+233xxxxxxxxxx
STOCK_ALERT_THRESHOLD=10
ENABLE_SMS_NOTIFICATIONS=true
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (or Neon account)

### Step 1: Clone & Install

```bash
# Frontend
npm install
npm run dev
# Runs on http://localhost:5173

# Backend
cd backend
npm install
npm start
# Runs on http://localhost:5000

# Check health
curl http://localhost:5000/health
```

### Step 2: Database Setup

```bash
# The backend auto-creates tables on startup
# Just ensure DATABASE_URL is set in .env

# Check connection:
curl http://localhost:5000/health
# Should return: { "success": true, "message": "Server is running" }
```

### Step 3: Test API

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"Test"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

---

## 🌍 Production Deployment

### Option 1: Vercel (Recommended for Frontend)

**Deploy Frontend:**
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import Git repository
# - Set environment variables
# - Deploy

# 3. Set domain
# - Add custom domain in Vercel dashboard
```

**Vercel Environment Variables:**
```env
VITE_API_URL=https://api.shopflow.com/api
```

### Option 2: Railway.app (Backend + Database)

**Deploy Backend:**
```bash
# 1. Connect GitHub repository to Railway
# 2. Set environment variables:
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
ARKESEL_API_KEY=your_key
FRONTEND_URL=https://shopflow.com

# 3. Connect Neon database
# 4. Deploy
```

**Railway Configuration:**
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

### Option 3: Self-Hosted (Digital Ocean, AWS, Linode)

**VPS Setup:**
```bash
# 1. SSH into VPS
ssh root@your_server_ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 4. Clone repository
git clone https://github.com/username/shopflow.git
cd shopflow/backend

# 5. Setup environment
cp .env.example .env
nano .env  # Edit with your settings

# 6. Install & start
npm install
npm start

# 7. Use PM2 for process management
npm install -g pm2
pm2 start npm --name "shopflow" -- start
pm2 startup
pm2 save
```

**Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.shopflow.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL Certificate (Let's Encrypt):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.shopflow.com
```

---

## 📦 Database Deployment

### Using Neon (Recommended)

```bash
# 1. Create account at neon.tech
# 2. Create new project
# 3. Copy connection string
# 4. Set DATABASE_URL in backend .env
# 5. Done! Auto-backups included

# Test connection:
psql your_connection_string
```

### Using AWS RDS

```bash
# 1. Create RDS PostgreSQL instance
# 2. Configure security groups
# 3. Get endpoint
# 4. Create database:
psql -h endpoint -U postgres -c "CREATE DATABASE shopflow;"

# 5. Set connection string:
# postgresql://user:password@endpoint:5432/shopflow
```

---

## 🔧 CI/CD Pipeline

### GitHub Actions (Automatic Testing & Deployment)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 Monitoring & Logging

### Error Tracking (Sentry)

```bash
# 1. Sign up at sentry.io
# 2. Create new project
# 3. Install SDK:
npm install @sentry/react @sentry/tracing

# 4. Initialize in frontend:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [new Sentry.Replay()],
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Application Logging

```javascript
// Backend logging
console.log('[INFO]', 'User registered', userId);
console.error('[ERROR]', 'Payment failed', error);

// Use structured logging for production:
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🧪 Pre-Deployment Checklist

### Code Review
- [ ] No console.log in production code
- [ ] No hardcoded API keys
- [ ] All environment variables documented
- [ ] Error handling on all pages
- [ ] TypeScript errors resolved

### Security
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Passwords hashed with bcrypt
- [ ] Admin routes protected
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified

### Performance
- [ ] Database indexes optimized
- [ ] API response times < 500ms
- [ ] Images compressed
- [ ] Bundle size analyzed
- [ ] Lazy loading implemented

### Testing
- [ ] All pages load
- [ ] Forms submit correctly
- [ ] API calls work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Navigation works
- [ ] Authentication flow tested

### Database
- [ ] Backups configured
- [ ] Connection limits set
- [ ] Indexes created
- [ ] Relationships verified
- [ ] Test data cleared

---

## 📈 Scaling Considerations

### When Traffic Increases

**Frontend:**
- Use CDN (Cloudflare)
- Enable caching headers
- Compress assets
- Lazy load images

**Backend:**
- Add read replicas (database)
- Implement Redis caching
- Use load balancer
- Scale horizontally with Docker

**Database:**
- Add indexes strategically
- Archive old data
- Connection pooling
- Read replicas

```bash
# Docker deployment example:
docker build -t shopflow:latest .
docker run -p 5000:5000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  shopflow:latest
```

---

## 💰 Cost Estimates (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Neon Database | $50-200 | Scales with usage |
| Vercel Frontend | $20 | Pro plan |
| Railway Backend | $20-50 | Scales with usage |
| Arkesel SMS | $0.01-0.05/msg | ~$10-50 for 1000 msgs |
| Cloudflare CDN | Free/20 | Optional |
| **TOTAL** | **$100-320** | For 1000+ users |

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Vercel (Frontend)
vercel rollback
# Select previous deployment

# Railway (Backend)
# Go to Dashboard → Deployments → Previous → Deploy

# Database
# Neon auto-backups every hour
# Can restore from point-in-time
```

---

## 📝 Deployment Checklist

### Before Going Live
- [ ] Database backups tested
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] DNS records updated
- [ ] CORS headers correct
- [ ] Admin users created
- [ ] Test transactions completed
- [ ] Error pages configured
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Support email configured

### After Going Live
- [ ] Monitor error rates
- [ ] Check server logs
- [ ] Monitor database performance
- [ ] Test critical flows
- [ ] Monitor API response times
- [ ] Check SMS delivery
- [ ] Monitor user registrations
- [ ] Setup alerts for errors

---

## 🚨 Emergency Contacts

Create a runbook:
```
Database Down:
- Check Neon dashboard
- Verify network connection
- Contact Neon support

API Down:
- Check Railway dashboard
- Review recent deployments
- Check server logs

Payment Issues:
- Contact payment provider
- Check transaction logs
- Notify customers

SMS Issues:
- Check Arkesel dashboard
- Verify API key
- Check balance
```

---

## 📚 Post-Deployment

### Monitoring URLs
- Frontend: https://shopflow.com
- Backend API: https://api.shopflow.com/health
- Database: Neon Dashboard
- Error tracking: Sentry Dashboard
- Analytics: Google Analytics (if added)

### Maintenance Tasks (Weekly)
- [ ] Review error logs
- [ ] Check database performance
- [ ] Monitor API usage
- [ ] Backup user data
- [ ] Test recovery procedures

### Maintenance Tasks (Monthly)
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Analyze user behavior
- [ ] Plan new features
- [ ] Update documentation

---

## 🎉 You're Ready to Deploy!

Your application is production-ready. Choose your deployment platform above and follow the steps. If you encounter issues:

1. Check the error logs
2. Review the checklist above
3. Test locally first
4. Deploy staging first
5. Monitor closely after deployment

**Good luck with your launch!** 🚀

---

## Additional Resources

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://railway.app/docs)

---

Questions? Check the implementation guides or reach out to your team!
