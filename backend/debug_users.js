
import pool from './src/db/pool.js';

const checkUsers = async () => {
    try {
        const result = await pool.query('SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
        console.table(result.rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
