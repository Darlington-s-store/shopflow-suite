-- ============================================
-- Clean up auto-seeded data from database
-- ============================================
-- This script removes all the default seed data that was automatically
-- inserted by the seed.js file. Run this to clean your database.
--
-- WARNING: This will delete products, brands, categories, and test users!
-- Make sure to backup any data you want to keep before running this.
-- ============================================

BEGIN;

-- Delete products first (due to foreign key constraints)
DELETE FROM products WHERE name IN (
  'iPhone 14 Pro',
  'Samsung Galaxy S23',
  'Nike Air Max',
  'Adidas Ultraboost',
  'Sony WH-1000XM5'
);

-- Delete brands
DELETE FROM brands WHERE slug IN (
  'apple',
  'samsung',
  'nike',
  'adidas',
  'sony'
);

-- Delete subcategories (these have parent_id set)
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
);

-- Delete main categories (these have no parent_id)
DELETE FROM categories WHERE slug IN (
  'electronics',
  'clothing',
  'books',
  'home-garden',
  'sports-outdoors'
);

-- Delete test users (OPTIONAL - comment out if you want to keep them)
DELETE FROM users WHERE email IN (
  'admin@shopflow.com',
  'customer@shopflow.com'
);

COMMIT;

-- Verify cleanup
SELECT 'Categories remaining:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Brands remaining:' as info, COUNT(*) as count FROM brands
UNION ALL
SELECT 'Products remaining:' as info, COUNT(*) as count FROM products
UNION ALL
SELECT 'Users remaining:' as info, COUNT(*) as count FROM users;
