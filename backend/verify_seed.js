import pool from './src/db/pool.js';

const verify = async () => {
    try {
        const users = await pool.query('SELECT COUNT(*) FROM users');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        const brands = await pool.query('SELECT COUNT(*) FROM brands');
        const products = await pool.query('SELECT COUNT(*) FROM products');
        const variants = await pool.query('SELECT COUNT(*) FROM product_variants');
        const coupons = await pool.query('SELECT COUNT(*) FROM coupons');

        console.log('--- Database Verification ---');
        console.log(`Users: ${users.rows[0].count}`);
        console.log(`Categories: ${categories.rows[0].count}`);
        console.log(`Brands: ${brands.rows[0].count}`);
        console.log(`Products: ${products.rows[0].count}`);
        console.log(`Variants: ${variants.rows[0].count}`);
        console.log(`Coupons: ${coupons.rows[0].count}`);
        console.log('-----------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
