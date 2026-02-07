import pool from './pool.js';
import initializeDatabase from './schema.js';

/**
 * Reset (drop) all tables and recreate schema WITHOUT seeding.
 * Use this when you want a clean database and will add your own categories/brands.
 */

async function resetEmpty() {
  try {
    console.log('\n🔄 Database Reset (empty) - dropping all tables...\n');

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

    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (err) {
        console.warn(`⚠ Could not drop ${table}: ${err.message}`);
      }
    }

    console.log('\n✅ All tables dropped. Recreating schema...\n');
    await initializeDatabase();
    console.log('\n✅ Schema recreated. Database is EMPTY (no seed data).\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset-empty failed:', error.message);
    process.exit(1);
  }
}

resetEmpty();
