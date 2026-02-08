import pool from './pool.js';
import { hashPassword } from '../utils/helpers.js';

const seedData = {
  users: [
    { email: 'rider@shopflow.com', password: 'password123', first_name: 'Mike', last_name: 'Delivery', phone: '+1234567899', role: 'DELIVERY_AGENT' }
  ],
  categories: [
    { name: 'Electronics', description: 'Latest gadgets and tech', slug: 'electronics' },
    { name: 'Fashion', description: 'Trendy clothing and accessories', slug: 'fashion' },
    { name: 'Home & Living', description: 'Furniture and decor', slug: 'home-living' }
  ],
  brands: [
    { name: 'Apple', slug: 'apple', description: 'Think Different' },
    { name: 'Samsung', slug: 'samsung', description: 'Inspire the World' },
    { name: 'Nike', slug: 'nike', description: 'Just Do It' },
    { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing' },
    { name: 'IKEA', slug: 'ikea', description: 'To create a better everyday life' }
  ],
  products: [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The first iPhone to feature an aerospace-grade titanium design.',
      base_price: 999.00,
      category: 'Electronics',
      brand: 'Apple',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',
      variants: [
        { color: 'Natural Titanium', storage: '128GB', price: 999.00 },
        { color: 'Blue Titanium', storage: '256GB', price: 1099.00 }
      ]
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Supercharged by M2. Strikingly thin and fast.',
      base_price: 1199.00,
      category: 'Electronics',
      brand: 'Apple',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1661608620867-b8f2d5776d54?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24',
      description: 'Galaxy AI is here.',
      base_price: 1299.00,
      category: 'Electronics',
      brand: 'Samsung',
      stock: 45,
      image: 'https://images.unsplash.com/photo-1706718507202-6014ba499427?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Nike Air Jordan 1',
      slug: 'air-jordan-1',
      description: 'The one that started it all.',
      base_price: 180.00,
      category: 'Fashion',
      brand: 'Nike',
      stock: 100,
      image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed4818?auto=format&fit=crop&w=800&q=80',
      variants: [
        { color: 'Red/Black', size: '42', price: 180.00 },
        { color: 'Blue/White', size: '43', price: 180.00 }
      ]
    },
    {
      name: 'Adidas Ultraboost',
      slug: 'adidas-ultraboost',
      description: 'Energy return for every step.',
      base_price: 160.00,
      category: 'Fashion',
      brand: 'Adidas',
      stock: 80,
      image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'IKEA LANDSKRONA Sofa',
      slug: 'landskrona-sofa',
      description: 'Warm and welcoming, neat and stylish.',
      base_price: 799.00,
      category: 'Home & Living',
      brand: 'IKEA',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
    }
  ]
};

export const seedDatabase = async () => {
  try {
    console.log('\n📊 Starting database seeding...\n');

    // 1. Ensure Admin exists
    let adminId;
    try {
      const adminCheck = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
      if (adminCheck.rows.length > 0) {
        adminId = adminCheck.rows[0].id;
      } else {
        console.log('Creating fallback admin...');
        const hp = await hashPassword('admin123');
        const newAdmin = await pool.query(
          "INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, 'Sys', 'Admin', 'ADMIN') RETURNING id",
          ['admin@shopflow.com', hp]
        );
        adminId = newAdmin.rows[0].id;
      }
      console.log(`Using Admin ID: ${adminId}`);
    } catch (e) { console.error('Admin check failed:', e.message); }

    // 2. Seed Rider
    for (const u of seedData.users) {
      try {
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
        if (exists.rows.length === 0) {
          const hp = await hashPassword(u.password);
          await pool.query(
            'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6)',
            [u.email, hp, u.first_name, u.last_name, u.phone, u.role]
          );
          console.log(`✓ Added user: ${u.email}`);
        }
      } catch (e) { console.error(`User seed failed for ${u.email}:`, e.message); }
    }

    // 3. Seed Categories
    const catMap = {};
    for (const c of seedData.categories) {
      try {
        let catId;
        const exists = await pool.query('SELECT id FROM categories WHERE slug = $1', [c.slug]);
        if (exists.rows.length > 0) {
          catId = exists.rows[0].id;
        } else {
          const res = await pool.query(
            'INSERT INTO categories (name, description, slug) VALUES ($1, $2, $3) RETURNING id',
            [c.name, c.description, c.slug]
          );
          catId = res.rows[0].id;
        }
        catMap[c.name] = catId;
      } catch (e) { console.error(`Category seed failed for ${c.name}:`, e.message); }
    }
    console.log(`✓ Categories processed`);

    // 4. Seed Brands
    const brandMap = {};
    for (const b of seedData.brands) {
      try {
        let brandId;
        const exists = await pool.query('SELECT id FROM brands WHERE slug = $1', [b.slug]);
        if (exists.rows.length > 0) {
          brandId = exists.rows[0].id;
        } else {
          // Brands table mapping
          const res = await pool.query(
            "INSERT INTO brands (name, slug, status) VALUES ($1, $2, 'active') RETURNING id",
            [b.name, b.slug]
          );
          brandId = res.rows[0].id;
        }
        brandMap[b.name] = brandId;
      } catch (e) { console.error(`Brand seed failed for ${b.name}:`, e.message); }
    }
    console.log(`✓ Brands processed`);

    // 5. Seed Products
    for (const p of seedData.products) {
      try {
        const catId = catMap[p.category];
        const brandId = brandMap[p.brand];

        if (!catId || !brandId) {
          console.warn(`Skipping ${p.name}: Missing category/brand ID`);
          continue;
        }

        const exists = await pool.query('SELECT id FROM products WHERE slug = $1', [p.slug]);
        if (exists.rows.length > 0) {
          continue;
        }

        // Mapped columns: short_description, total_stock
        const prodRes = await pool.query(
          `INSERT INTO products (name, slug, short_description, base_price, category_id, brand_id, total_stock, created_by, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active') RETURNING id`,
          [p.name, p.slug, p.description, p.base_price, catId, brandId, p.stock, adminId]
        );
        const prodId = prodRes.rows[0].id;

        if (p.image) {
          try {
            await pool.query(
              'INSERT INTO product_images (product_id, image_url, is_featured) VALUES ($1, $2, true)',
              [prodId, p.image]
            );
          } catch (e) { console.error(`Image insert failed for ${p.name}:`, e.message); }
        }

        if (p.variants) {
          for (const v of p.variants) {
            try {
              // Removed size, stock_quantity -> stock
              await pool.query(
                'INSERT INTO product_variants (product_id, color, storage, price, stock) VALUES ($1, $2, $3, $4, $5)',
                [prodId, v.color || null, v.storage || null, v.price, 10]
              );
            } catch (e) { console.error(`Variant insert failed for ${p.name}:`, e.message); }
          }
        }
      } catch (e) {
        console.error(`Product seed failed for ${p.name}:`, e.message);
      }
    }
    console.log(`✓ Products processed`);

    // 6. Coupons
    try {
      const couponCheck = await pool.query("SELECT id FROM coupons WHERE code = 'WELCOME10'");
      if (couponCheck.rows.length === 0) {
        // Removed discount_type as likely missing
        await pool.query(
          "INSERT INTO coupons (code, discount_value, min_purchase_amount, usage_limit, expires_at) VALUES ('WELCOME10', 10, 0, 1000, '2025-12-31')"
        );
        console.log('✓ Added WELCOME10 coupon');
      }
    } catch (e) { console.error('Coupon seed failed:', e.message); }

  } catch (error) {
    console.error('❌ Global Seed error:', error);
    process.exit(1);
  }
};

const isMainModule = process.argv[1]?.includes('seed.js');
if (isMainModule) {
  seedDatabase().then(() => {
    console.log('\n✅ Seeding completed!\n');
    process.exit(0);
  });
}
