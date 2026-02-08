import pool from './src/db/pool.js';

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'").then(res => {
    console.log(JSON.stringify(res.rows.map(r => r.column_name)));
    process.exit(0);
});
