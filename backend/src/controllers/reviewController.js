import pool from '../db/pool.js';

export const submitReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user purchased this product
    const purchaseCheck = await pool.query(
      `SELECT COUNT(*) as count FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2`,
      [req.user.id, productId]
    );

    if (parseInt(purchaseCheck.rows[0].count) === 0) {
      return res.status(403).json({ success: false, error: 'Can only review purchased products' });
    }

    // Check for duplicate review
    const duplicateCheck = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, req.user.id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, req.user.id, rating, comment, 'PENDING']
    );

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.avatar FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.status = 'APPROVED'
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // Calculate average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1 AND status = $2',
      [productId, 'APPROVED']
    );

    res.json({
      success: true,
      reviews: result.rows,
      avgRating: parseFloat(avgResult.rows[0].avg_rating) || 0
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

// Admin endpoints
export const getAllReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.name, u.first_name, u.last_name FROM reviews r
       JOIN products p ON r.product_id = p.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
};
