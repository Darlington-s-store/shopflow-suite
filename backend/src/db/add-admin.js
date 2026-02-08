import pool from './pool.js';
import { hashPassword } from '../utils/helpers.js';

/**
 * Simple script to add a single admin user.
 * Usage: node src/db/add-admin.js [email] [password]
 */

async function addAdmin() {
  try {
    const email = process.argv[2] || 'admin@shopflow.com';
    const password = process.argv[3] || 'admin123';
    const firstName = 'Admin';
    const lastName = 'User';
    const phone = '+10000000000';

    // Check existing
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      console.log(`User with email ${email} already exists. Skipping.`);
      process.exit(0);
    }

    const hashed = await hashPassword(password);
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [email, hashed, firstName, lastName, phone, 'ADMIN', true]
    );

    console.log(`✅ Admin user created: ${email} / ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Add-admin failed:', err.message);
    process.exit(1);
  }
}

addAdmin();
