import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db/pool.js';
import initializeDatabase from './db/schema.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/review.js';
import couponRoutes from './routes/coupon.js';
import deliveryRoutes from './routes/delivery.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import chatbotRoutes from './routes/chatbot.js';
import dealsRoutes from './routes/deals.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
// Increase request body size to allow base64 image uploads from the frontend
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads) - handle Windows path issues
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Serving uploads from:', uploadsPath);
console.log('📁 Uploads folder exists:', fs.existsSync(uploadsPath));
app.use('/uploads', express.static(uploadsPath));

// Debug endpoint to check if images exist
app.get('/uploads-debug/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsPath, filename);
  console.log(`🔍 Looking for: ${filepath}`);
  console.log(`📄 File exists: ${fs.existsSync(filepath)}`);
  
  if (fs.existsSync(filepath)) {
    console.log(`✅ Serving: ${filename}`);
    res.sendFile(filepath);
  } else {
    console.log(`❌ Not found: ${filename}`);
    res.status(404).json({ error: 'File not found', looked_in: filepath });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/deals', dealsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', testResult.rows[0]);

    // Initialize database schema
    await initializeDatabase();
    console.log('✓ Database schema initialized');

    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
    
    // Keep the server alive
    server.on('error', (err) => {
      console.error('✗ Server error:', err);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

startServer();
