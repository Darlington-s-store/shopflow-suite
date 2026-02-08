import pool from './pool.js';

async function run() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'status'");
    if (res.rows.length > 0) {
      console.log('Column `status` exists on product_variants');
    } else {
      console.log('Column `status` DOES NOT exist on product_variants');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking columns:', err.message || err);
    process.exit(1);
  }
}

run();
