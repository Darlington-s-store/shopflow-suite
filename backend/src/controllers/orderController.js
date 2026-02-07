import pool from '../db/pool.js';
import { calculateOrderTotals, generateOrderNumber } from '../utils/helpers.js';

export const createOrder = async (req, res) => {
  try {
    const { shippingAddressId } = req.body;

    // Get cart items
    const cartResult = await pool.query(
      `SELECT ci.*, p.base_price, pv.price as variant_price FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Calculate totals
    const items = cartResult.rows.map(item => ({
      ...item,
      price: item.variant_price || item.base_price
    }));

    const totals = calculateOrderTotals(items, 7.5, 25);

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await pool.query(
      `INSERT INTO orders (order_number, user_id, subtotal, tax, delivery_fee, total, shipping_address_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [orderNumber, req.user.id, totals.subtotal, totals.tax, totals.deliveryFee, totals.total, shippingAddressId]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, price, quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order.id, item.product_id, item.variant_id, item.product_name, item.sku, item.price, item.quantity, item.image_url]
      );
    }

    // Create delivery record
    await pool.query(
      'INSERT INTO deliveries (order_id, status, fee) VALUES ($1, $2, $3)',
      [order.id, 'PENDING', totals.deliveryFee]
    );

    // Create admin notification
    await pool.query(
      `INSERT INTO notifications (title, message, type)
       VALUES ($1, $2, $3)`,
      [`New Order: ${orderNumber}`, `A new order ${orderNumber} has been placed.`, 'ORDER_PLACED']
    );

    // Clear cart
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COUNT(oi.id) as item_count FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    order.items = itemsResult.rows;

    // Get payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [id]
    );
    order.payment = paymentResult.rows[0] || null;

    // Get delivery
    const deliveryResult = await pool.query(
      'SELECT * FROM deliveries WHERE order_id = $1',
      [id]
    );
    order.delivery = deliveryResult.rows[0] || null;

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, reference } = req.body;

    // Verify order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, req.user.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Create payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (order_id, amount, method, status, reference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, order.total, paymentMethod, 'SUCCESS', reference]
    );

    // Update order status
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['PENDING_CONFIRMATION', orderId]
    );

    res.json({ success: true, payment: paymentResult.rows[0] });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
};

// Admin order management
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email, u.first_name, u.last_name FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
};
