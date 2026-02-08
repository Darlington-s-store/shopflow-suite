import pool from './src/db/pool.js';

async function cleanSeedData() {
    try {
        console.log('\n🧹 Cleaning up auto-seeded data...\n');

        // Delete products first (due to foreign key constraints)
        console.log('Deleting seeded products...');
        const productsResult = await pool.query(`
      DELETE FROM products WHERE name IN (
        'iPhone 14 Pro',
        'Samsung Galaxy S23',
        'Nike Air Max',
        'Adidas Ultraboost',
        'Sony WH-1000XM5'
      )
    `);
        console.log(`✓ Deleted ${productsResult.rowCount} products`);

        // Delete brands
        console.log('Deleting seeded brands...');
        const brandsResult = await pool.query(`
      DELETE FROM brands WHERE slug IN (
        'apple',
        'samsung',
        'nike',
        'adidas',
        'sony'
      )
    `);
        console.log(`✓ Deleted ${brandsResult.rowCount} brands`);

        // Delete subcategories (these have parent_id set)
        console.log('Deleting seeded subcategories...');
        const subcategoriesResult = await pool.query(`
      DELETE FROM categories WHERE slug IN (
        'smartphones',
        'laptops',
        'headphones',
        'tablets',
        'mens-clothing',
        'womens-clothing',
        'shoes',
        'fiction',
        'non-fiction',
        'running-gear',
        'camping-equipment'
      )
    `);
        console.log(`✓ Deleted ${subcategoriesResult.rowCount} subcategories`);

        // Delete main categories (these have no parent_id)
        console.log('Deleting seeded categories...');
        const categoriesResult = await pool.query(`
      DELETE FROM categories WHERE slug IN (
        'electronics',
        'clothing',
        'books',
        'home-garden',
        'sports-outdoors'
      )
    `);
        console.log(`✓ Deleted ${categoriesResult.rowCount} categories`);

        // Delete test users (OPTIONAL)
        console.log('Deleting test users...');
        const usersResult = await pool.query(`
      DELETE FROM users WHERE email IN (
        'admin@shopflow.com',
        'customer@shopflow.com'
      )
    `);
        console.log(`✓ Deleted ${usersResult.rowCount} test users`);

        // Show what's left
        console.log('\n📊 Database Summary:');
        const summary = await pool.query(`
      SELECT 'Categories' as type, COUNT(*) as count FROM categories
      UNION ALL
      SELECT 'Brands' as type, COUNT(*) as count FROM brands
      UNION ALL
      SELECT 'Products' as type, COUNT(*) as count FROM products
      UNION ALL
      SELECT 'Users' as type, COUNT(*) as count FROM users
    `);

        summary.rows.forEach(row => {
            console.log(`  ${row.type}: ${row.count}`);
        });

        console.log('\n✅ Cleanup completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Cleanup failed:', error.message);
        process.exit(1);
    }
}

cleanSeedData();
