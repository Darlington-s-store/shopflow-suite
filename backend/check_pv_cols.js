import pool from './src/db/pool.js';

pool.query("SELECT * FROM product_variants LIMIT 0").then(res => {
    console.log('PV COLS:', res.fields.map(f => f.name));
    process.exit(0);
});
