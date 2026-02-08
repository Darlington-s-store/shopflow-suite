import pool from '../db/pool.js';
import { calculateOrderTotals, generateOrderNumber } from '../utils/helpers.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { shippingAddressId } = req.body;

    await client.query('BEGIN');

    // Get cart items
    const cartResult = await client.query(
      `SELECT ci.*, p.name as product_name, p.base_price, p.stock_tracking, p.total_stock as product_stock,
              pv.price as variant_price, pv.stock as variant_stock, pv.sku as variant_sku, p.slug as product_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_featured DESC, sort_order ASC LIMIT 1) as image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const items = cartResult.rows.map(item => ({
      ...item,
      price: Number(item.variant_price || item.base_price)
    }));

    // 1. Validate and Decrement Stock
    for (const item of items) {
      if (item.stock_tracking) {
        if (item.variant_id) {
          // Check variant stock
          if (item.variant_stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product_name} (${item.variant_sku || 'Variant'})`);
          }
          // Decrement variant stock
          await client.query(
            'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.variant_id]
          );
        } else {
          // Check product stock
          if (item.product_stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product_name}`);
          }
        }

        // Always decrement parent product total_stock if it's being tracked
        // Note: If using variants, total_stock should ideally be sum of variants, 
        // but for simplicity we decrement it if it holds a value.
        // Actually, let's just decrement it if we didn't decrement variant, OR if we want to keep them in sync.
        // Let's assume total_stock is the master count for simple products.
        // If variant exists, we decremented variant. Should we decrement product?
        // Let's decrement product.total_stock too if it is tracked.
        await client.query(
          'UPDATE products SET total_stock = total_stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    // 2. Calculate totals
    const totals = calculateOrderTotals(items, 7.5, 25); // fixed tax/delivery for now

    // 3. Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, subtotal, tax, delivery_fee, total, shipping_address_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [orderNumber, req.user.id, totals.subtotal, totals.tax, totals.deliveryFee, totals.total, shippingAddressId]
    );

    const order = orderResult.rows[0];

    // 4. Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, price, quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order.id, item.product_id, item.variant_id, item.product_name, item.variant_sku || item.product_slug, item.price, item.quantity, item.image_url]
      );
    }

    // 5. Create delivery record
    await client.query(
      'INSERT INTO deliveries (order_id, status, fee) VALUES ($1, $2, $3)',
      [order.id, 'PENDING', totals.deliveryFee]
    );

    // 6. Create admin notification
    await client.query(
      `INSERT INTO notifications (title, message, type)
       VALUES ($1, $2, $3)`,
      [`New Order: ${orderNumber}`, `A new order ${orderNumber} has been placed.`, 'ORDER_PLACED']
    );

    // 7. Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({ success: true, order });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    const message = error.message.startsWith('Insufficient stock') ? error.message : 'Failed to create order';
    const status = error.message.startsWith('Insufficient stock') ? 400 : 500;
    res.status(status).json({ success: false, error: message });
  } finally {
    client.release();
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
