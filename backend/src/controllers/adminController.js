import pool from '../db/pool.js';

export const getAdminPages = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, key, title, path, icon, sort_order FROM admin_pages ORDER BY sort_order');
    res.json({ success: true, pages: result.rows });
  } catch (err) {
    console.error('Get admin pages error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch admin pages' });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at, updated_at
       FROM users 
       WHERE role = 'CUSTOMER' 
       ORDER BY created_at DESC`
    );
    
    const customers = result.rows.map(row => ({
      id: row.id?.toString(),
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      status: row.is_active ? 'ACTIVE' : 'SUSPENDED',
      totalOrders: 0,
      totalSpent: 0,
      failedDeliveries: 0,
      successfulDeliveries: 0,
      emailVerified: false,
      phoneVerified: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      flags: [],
      notes: [],
    }));
    
    res.json({ success: true, customers });
  } catch (err) {
    console.error('Get all customers error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};

export const getDeliveryAgents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at, updated_at
       FROM users 
       WHERE role = 'DELIVERY_AGENT' 
       ORDER BY created_at DESC`
    );
    
    const agents = result.rows.map(row => ({
      id: row.id?.toString(),
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      role: row.role,
      status: row.is_active ? 'ACTIVE' : 'SUSPENDED',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    res.json({ success: true, customers: agents });
  } catch (err) {
    console.error('Get delivery agents error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch delivery agents' });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const result = await pool.query('SELECT id, widget_key, settings, created_at FROM user_dashboards WHERE user_id = $1', [userId]);
    res.json({ success: true, dashboard: result.rows });
  } catch (err) {
    console.error('Get user dashboard error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
};

export const updateUserDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const { widget_key, settings } = req.body;
    if (!widget_key) return res.status(400).json({ success: false, error: 'widget_key required' });

    // Upsert
    await pool.query(
      `INSERT INTO user_dashboards (user_id, widget_key, settings)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, widget_key) DO UPDATE SET settings = EXCLUDED.settings`,
      [userId, widget_key, JSON.stringify(settings || {})]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Update user dashboard error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update dashboard' });
  }
};
