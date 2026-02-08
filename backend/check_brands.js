import pool from './src/db/pool.js';

const check = async () => {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'brands'");
    console.log('Brands columns:', res.rows.map(r => r.column_name));
    process.exit(0);
};
check();
