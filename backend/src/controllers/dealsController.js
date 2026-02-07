import pool from '../db/pool.js';

// Get all active deals
export const getActiveDeals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name, p.images, p.base_price
       FROM deals d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.is_active = true AND CURRENT_TIMESTAMP BETWEEN d.start_date AND d.end_date
       ORDER BY d.featured DESC, d.created_at DESC`
    );

    res.json({ success: true, deals: result.rows });
  } catch (error) {
    console.error('Get active deals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deals' });
  }
};

// Get featured deals
export const getFeaturedDeals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name, p.images, p.base_price
       FROM deals d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.is_active = true AND d.featured = true AND CURRENT_TIMESTAMP BETWEEN d.start_date AND d.end_date
       LIMIT 6`
    );

    res.json({ success: true, deals: result.rows });
  } catch (error) {
    console.error('Get featured deals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured deals' });
  }
};

// Admin: Create deal
export const createDeal = async (req, res) => {
  try {
    const { productId, title, description, discountPercentage, startDate, endDate, isFeatured } = req.body;

    if (!productId || !title || !discountPercentage) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Verify product exists
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const result = await pool.query(
      `INSERT INTO deals (product_id, title, description, discount_percentage, start_date, end_date, is_active, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [productId, title, description, discountPercentage, startDate, endDate, true, isFeatured || false]
    );

    // Create notification for admins
    await pool.query(
      `INSERT INTO admin_notifications (title, message, type)
       VALUES ($1, $2, $3)`,
      ['New Deal Created', `A new deal "${title}" has been created`, 'DEAL']
    );

    res.status(201).json({ success: true, deal: result.rows[0] });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create deal' });
  }
};

// Admin: Update deal
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discountPercentage, startDate, endDate, isActive, isFeatured } = req.body;

    const result = await pool.query(
      `UPDATE deals 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           discount_percentage = COALESCE($3, discount_percentage),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           is_active = COALESCE($6, is_active),
           featured = COALESCE($7, featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, discountPercentage, startDate, endDate, isActive, isFeatured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    res.json({ success: true, deal: result.rows[0] });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ success: false, error: 'Failed to update deal' });
  }
};

// Admin: Delete deal
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM deals WHERE id = $1', [id]);
    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete deal' });
  }
};

// Admin: Get all deals
export const getAllDeals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name, p.base_price
       FROM deals d
       LEFT JOIN products p ON d.product_id = p.id
       ORDER BY d.created_at DESC`
    );

    res.json({ success: true, deals: result.rows });
  } catch (error) {
    console.error('Get all deals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deals' });
  }
};

export default {
  getActiveDeals,
  getFeaturedDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDeals
};
