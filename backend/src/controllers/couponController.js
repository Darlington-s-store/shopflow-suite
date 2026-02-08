import pool from '../db/pool.js';

export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // Find coupon
    const couponResult = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND active = true',
      [code.toUpperCase()]
    );

    if (couponResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Coupon not found or inactive' });
    }

    const coupon = couponResult.rows[0];

    // Check if coupon is expired
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }

    // Check minimum purchase
    if (cartTotal < coupon.min_purchase) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase of $${coupon.min_purchase} required`
      });
    }

    // Check usage limit
    const usageResult = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE coupon_id = $1',
      [coupon.id]
    );

    if (coupon.usage_limit && parseInt(usageResult.rows[0].count) >= coupon.usage_limit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
    }

    // Check user usage limit
    const userUsageResult = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, req.user.id]
    );

    if (coupon.per_user_limit && parseInt(userUsageResult.rows[0].count) >= coupon.per_user_limit) {
      return res.status(400).json({
        success: false,
        error: 'You have reached the usage limit for this coupon'
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    const finalTotal = Math.max(0, cartTotal - discount);

    res.json({
      success: true,
      coupon,
      discount,
      finalTotal
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, error: 'Failed to apply coupon' });
  }
};

// Admin coupon management
export const getCoupons = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );

    res.json({ success: true, coupons: result.rows });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit, perUserLimit } = req.body;

    const result = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiry_date, usage_limit, per_user_limit, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [code.toUpperCase(), discountType, discountValue, minPurchase, expiryDate, usageLimit, perUserLimit]
    );

    res.status(201).json({ success: true, coupon: result.rows[0] });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, error: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit, perUserLimit, active } = req.body;

    const result = await pool.query(
      `UPDATE coupons SET code = $1, discount_type = $2, discount_value = $3, min_purchase = $4,
       expiry_date = $5, usage_limit = $6, per_user_limit = $7, active = $8
       WHERE id = $9 RETURNING *`,
      [code, discountType, discountValue, minPurchase, expiryDate, usageLimit, perUserLimit, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    res.json({ success: true, coupon: result.rows[0] });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, error: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete coupon' });
  }
};
