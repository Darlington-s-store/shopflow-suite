import pool from './pool.js';

async function run() {
  try {
    console.log('Running migration: ensure product_variants.status exists');
    await pool.query("ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE'");

    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_variants'");
    console.log('Columns on product_variants:');
    console.log(res.rows.map(r => r.column_name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  }
}

run();
