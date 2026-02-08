import pool from './pool.js';
import { hashPassword } from '../utils/helpers.js';

/**
 * Seed only demo users (admin + customer) without adding products/categories/brands.
 */

async function seedUsers() {
  try {
    const users = [
      { email: 'admin@shopflow.com', password: 'admin123', first_name: 'Admin', last_name: 'User', phone: '+1234567890', role: 'ADMIN' },
      { email: 'customer@shopflow.com', password: 'customer123', first_name: 'John', last_name: 'Doe', phone: '+1987654321', role: 'CUSTOMER' },
      { email: 'rider@shopflow.com', password: 'rider123', first_name: 'Delivery', last_name: 'Agent', phone: '+1122334455', role: 'DELIVERY_AGENT' }
    ];

    for (const u of users) {
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (exists.rows.length > 0) {
        console.log(`User ${u.email} already exists. Skipping.`);
        continue;
      }

      const hashed = await hashPassword(u.password);
      await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [u.email, hashed, u.first_name, u.last_name, u.phone, u.role, true]
      );
      console.log(`✓ Added user ${u.email}`);
    }

    console.log('\n✅ Users seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed-users failed:', err.message);
    process.exit(1);
  }
}

seedUsers();
