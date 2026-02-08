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

// Categories Management
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, icon, image_url, description, is_active, sort_order, created_at 
       FROM categories 
       ORDER BY sort_order ASC, name ASC`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, imageUrl, description, isActive, sortOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name required' });

    const result = await pool.query(
      `INSERT INTO categories (name, slug, icon, image_url, description, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), icon, imageUrl, description, isActive !== false, sortOrder || 0]
    );

    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, imageUrl, description, isActive, sortOrder } = req.body;

    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, slug = $2, icon = $3, image_url = $4, description = $5, is_active = $6, sort_order = $7
       WHERE id = $8
       RETURNING *`,
      [name, slug, icon, imageUrl, description, isActive, sortOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, category: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
};

// Brands Management
export const getBrands = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, logo_url, description, is_active, created_at 
       FROM brands 
       ORDER BY name ASC`
    );
    res.json({ success: true, brands: result.rows });
  } catch (err) {
    console.error('Get brands error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, slug, logoUrl, description, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name required' });

    const result = await pool.query(
      `INSERT INTO brands (name, slug, logo_url, description, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), logoUrl, description, isActive !== false]
    );

    res.status(201).json({ success: true, brand: result.rows[0] });
  } catch (err) {
    console.error('Create brand error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, logoUrl, description, isActive } = req.body;

    const result = await pool.query(
      `UPDATE brands 
       SET name = $1, slug = $2, logo_url = $3, description = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
      [name, slug, logoUrl, description, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    res.json({ success: true, brand: result.rows[0] });
  } catch (err) {
    console.error('Update brand error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update brand' });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM brands WHERE id = $1', [id]);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    console.error('Delete brand error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete brand' });
  }
};

// Messages Management
export const getAdminMessages = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    let query = `SELECT m.*, u.first_name, u.last_name, u.email, u.phone 
                 FROM messages m 
                 JOIN users u ON m.sender_id = u.id`;
    let params = [];

    if (isRead !== undefined) {
      query += ` WHERE m.is_read = $1`;
      params.push(isRead === 'true');
    }

    query += ` ORDER BY m.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) as count FROM messages');

    res.json({ success: true, messages: result.rows, total: countResult.rows[0].count });
  } catch (err) {
    console.error('Get admin messages error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark message read error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update message' });
  }
};

export const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ success: false, error: 'Reply message required' });

    // Get original message to get sender ID
    const originalMsg = await pool.query('SELECT sender_id, subject FROM messages WHERE id = $1', [id]);
    if (originalMsg.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, message, message_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, originalMsg.rows[0].sender_id, `RE: ${originalMsg.rows[0].subject}`, replyMessage, 'ADMIN_REPLY']
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error('Reply to message error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send reply' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
};
