import pool from './pool.js';
import initializeDatabase from './schema.js';
import { hashPassword } from '../utils/helpers.js';

/**
 * Reset database to be EMPTY except for ADMIN user credentials.
 * All product, category, brand, order data will be cleared.
 * Only the admin account will exist for logging in.
 */

async function resetAdminOnly() {
  try {
    console.log('\n🔄 Database Reset - Admin Only Mode\n');

    const tables = [
      'delivery_updates',
      'deliveries',
      'notifications',
      'reviews',
      'payments',
      'order_items',
      'orders',
      'wishlist',
      'cart_items',
      'addresses',
      'product_images',
      'product_variants',
      'products',
      'brands',
      'categories',
      'users',
    ];

    console.log('Dropping all tables...');
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (err) {
        console.warn(`⚠ Could not drop ${table}: ${err.message}`);
      }
    }

    console.log('\n✅ All tables dropped.\n');
    
    console.log('Recreating schema...\n');
    await initializeDatabase();
    
    console.log('\n✨ Creating ADMIN user...\n');
    
    const adminEmail = 'admin@shopflow.com';
    const adminPassword = 'admin123';
    const hashedPassword = await hashPassword(adminPassword);
    
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminEmail, hashedPassword, 'Admin', 'User', '+1234567890', 'ADMIN', true]
    );
    
    console.log(`✓ Admin user created`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: ADMIN\n`);
    
    console.log('✅ Database reset complete!\n');
    console.log('📝 Database Status:');
    console.log('   ✓ Empty (no products, categories, brands, orders)');
    console.log('   ✓ Admin credentials ready for login');
    console.log('   ✓ Ready to add data via Admin Dashboard\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset-admin-only failed:', error.message);
    process.exit(1);
  }
}

resetAdminOnly();
