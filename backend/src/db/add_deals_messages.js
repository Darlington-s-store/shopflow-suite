import pool from './pool.js';

async function addDealsAndMessages() {
    try {
        console.log('🔧 Adding deals and messages tables...');

        // 1. Messages Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'UNREAD', -- UNREAD, READ, ARCHIVED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Created messages table');

        // 2. Deals Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        discount_percentage DECIMAL(5, 2),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        info VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Created deals table');

        // 3. Add to Admin Pages
        // Check if pages already exist to avoid duplicates (though key should be unique)
        const pages = [
            { key: 'deals', title: 'Deals', path: '/admin/deals', icon: 'tag', order: 7 }, // using 'tag' icon or similar
            { key: 'messages', title: 'Messages', path: '/admin/messages', icon: 'mail', order: 8 }
        ];

        for (const p of pages) {
            try {
                await pool.query(
                    `INSERT INTO admin_pages (key, title, path, icon, sort_order) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (key) DO UPDATE SET 
           title = EXCLUDED.title, 
           path = EXCLUDED.path, 
           icon = EXCLUDED.icon, 
           sort_order = EXCLUDED.sort_order`,
                    [p.key, p.title, p.path, p.icon, p.order]
                );
                console.log(`✓ Added admin page: ${p.title}`);
            } catch (err) {
                console.error(`⚠ Failed to add admin page ${p.title}:`, err.message);
            }
        }

        console.log('✅ Deals and Messages setup complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

addDealsAndMessages();
