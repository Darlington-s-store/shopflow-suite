import pool from './src/db/pool.js';

const check = async () => {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
};
check();
