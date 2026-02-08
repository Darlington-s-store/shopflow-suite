import pool from './src/db/pool.js';

pool.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%variant%'").then(res => {
    console.log('VARIANTS TABLE:', res.rows.map(r => r.table_name));
    process.exit(0);
});
