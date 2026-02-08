import pool from './pool.js';
import initializeDatabase from './schema.js';
import { seedDatabase } from './seed.js';

async function resetAndSeed() {
  try {
    console.log('\n🔄 Database Reset & Reseed Process\n');

    // Drop all tables
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

    console.log('Dropping existing tables...');
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      } catch (err) {
        // Silently continue if table doesn't exist
      }
    }
    console.log('✓ All tables dropped\n');

    // Recreate schema
    console.log('Creating fresh schema...');
    await initializeDatabase();
    console.log('✓ Schema created\n');

    // Seed data
    await seedDatabase();

    console.log('✅ Database reset and seeding completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run reset
resetAndSeed();
