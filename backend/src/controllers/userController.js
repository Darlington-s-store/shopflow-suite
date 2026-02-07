import pool from '../db/pool.js';
import { calculateOrderTotals, generateOrderNumber } from '../utils/helpers.js';

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id, variant_id) DO UPDATE SET quantity = cart_items.quantity + $4
       RETURNING *`,
      [req.user.id, productId, variantId, quantity]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to add to cart' });
  }
};

export const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.*, p.name as product_name, p.slug, p.base_price, pv.color, pv.storage, pv.price as variant_price, pi.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_featured = true
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // productId here is actually the cart item id passed from the client
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [productId, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
};

// Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [req.user.id, productId]
    );

    res.json({ success: true, item: result.rows[0] || { user_id: req.user.id, product_id: productId } });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to add to wishlist' });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, p.name, p.base_price, p.discount_price, pi.image_url
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_featured = true
       WHERE w.user_id = $1`,
      [req.user.id]
    );

    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wishlist' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
  }
};

// Addresses
export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, country, postalCode, isDefault } = req.body;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, label, full_name, phone, street, city, state, country, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, label, fullName, phone, street, city, state, country, postalCode, isDefault || false]
    );

    res.status(201).json({ success: true, address: result.rows[0] });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    res.json({ success: true, addresses: result.rows });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch addresses' });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, fullName, phone, street, city, state, country, postalCode, isDefault } = req.body;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      `UPDATE addresses SET label = COALESCE($1, label), full_name = COALESCE($2, full_name),
       phone = COALESCE($3, phone), street = COALESCE($4, street), city = COALESCE($5, city),
       state = COALESCE($6, state), country = COALESCE($7, country), postal_code = COALESCE($8, postal_code),
       is_default = COALESCE($9, is_default), updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [label, fullName, phone, street, city, state, country, postalCode, isDefault, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, address: result.rows[0] });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, error: 'Failed to update address' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete address' });
  }
};
