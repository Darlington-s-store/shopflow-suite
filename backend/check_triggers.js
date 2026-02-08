import pool from './src/db/pool.js';

const check = async () => {
    const res = await pool.query("SELECT event_object_table, trigger_name FROM information_schema.triggers");
    console.log('Triggers:', res.rows);
    process.exit(0);
};
check();
