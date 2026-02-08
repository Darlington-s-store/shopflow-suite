import pool from './src/db/pool.js';

const check = async () => {
    const res = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'brands'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
};
check();
