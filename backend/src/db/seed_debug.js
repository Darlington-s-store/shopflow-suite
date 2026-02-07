import pool from './pool.js';
import { hashPassword } from '../utils/helpers.js';

const seedData = {
    // ... copy data ...
    // Minimal data for test
    products: [
        { name: 'iPhone X', slug: 'iphone-x', base_price: 500, category: 'Electronics', brand: 'Apple', stock: 10 }
    ],
    categories: [{ name: 'Electronics', slug: 'electronics' }],
    brands: [{ name: 'Apple', slug: 'apple' }],
    users: []
};

// I'll copy the existing seedData structure but just to test one product

export const seedDatabase = async () => {
    // ... Minimal logic ...
    // Fetch user
    const adminRes = await pool.query("SELECT id FROM users WHERE role='ADMIN' LIMIT 1");
    const adminId = adminRes.rows[0].id;

    // Fetch cat/brand
    const catRes = await pool.query("SELECT id FROM categories WHERE slug='electronics'");
    let catId = catRes.rows.length ? catRes.rows[0].id : null;
    if (!catId) {
        const c = await pool.query("INSERT INTO categories (name, slug) VALUES ('Electronics', 'electronics') RETURNING id");
        catId = c.rows[0].id;
    }

    const brandRes = await pool.query("SELECT id FROM brands WHERE slug='apple'");
    let brandId = brandRes.rows.length ? brandRes.rows[0].id : null;
    if (!brandId) {
        const b = await pool.query("INSERT INTO brands (name, slug) VALUES ('Apple', 'apple') RETURNING id");
        brandId = b.rows[0].id; // Might fail if needs status, assume active
    }

    const q = `INSERT INTO products (name, slug, base_price, category_id, brand_id, stock_quantity, created_by, status) VALUES ('iPhone X', 'iphone-x', 500, $1, $2, 10, $3, 'active') RETURNING id`;
    console.log('Executing Query:', q);

    try {
        await pool.query(q, [catId, brandId, adminId]);
        console.log('Success!');
    } catch (e) {
        console.error('FAIL:', e.message);
    }
};

seedDatabase().then(() => process.exit(0));
