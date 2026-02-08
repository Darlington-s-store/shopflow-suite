import pool from './pool.js';

/**
 * Create admin_pages and user_dashboards tables and seed default admin pages
 */
async function setupAdminPages() {
  try {
    console.log('\n🔧 Creating admin pages and dashboard tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_pages (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_dashboards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        widget_key VARCHAR(100) NOT NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Default admin pages
    const pages = [
      { key: 'dashboard', title: 'Dashboard', path: '/admin', icon: 'grid', order: 1 },
      { key: 'products', title: 'Products', path: '/admin/products', icon: 'box', order: 2 },
      { key: 'orders', title: 'Orders', path: '/admin/orders', icon: 'shopping-cart', order: 3 },
      { key: 'customers', title: 'Customers', path: '/admin/customers', icon: 'users', order: 4 },
      { key: 'reports', title: 'Reports', path: '/admin/reports', icon: 'bar-chart', order: 5 },
      { key: 'settings', title: 'Settings', path: '/admin/settings', icon: 'settings', order: 6 }
    ];

    for (const p of pages) {
      try {
        await pool.query(
          `INSERT INTO admin_pages (key, title, path, icon, sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (key) DO NOTHING`,
          [p.key, p.title, p.path, p.icon, p.order]
        );
        console.log(`✓ Ensured admin page: ${p.key}`);
      } catch (err) {
        console.warn(`⚠ Could not insert admin page ${p.key}: ${err.message}`);
      }
    }

    // Optionally create a basic dashboard widget for the first admin user if exists
    const adminRes = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1");
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      const widgetKey = 'sales_summary';
      const settings = { columns: ['today', 'this_week', 'this_month'] };
      await pool.query(
        `INSERT INTO user_dashboards (user_id, widget_key, settings) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [adminId, widgetKey, JSON.stringify(settings)]
      );
      console.log(`✓ Created default dashboard widget for admin id ${adminId}`);
    } else {
      console.log('ℹ No admin user found - skipping per-user dashboard seeding');
    }

    console.log('\n✅ Admin pages and dashboard setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin setup failed:', error.message);
    process.exit(1);
  }
}

setupAdminPages();
