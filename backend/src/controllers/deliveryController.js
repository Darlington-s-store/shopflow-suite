import pool from '../db/pool.js';

// Customer delivery tracking
export const getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order ownership
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const result = await pool.query(
      'SELECT * FROM deliveries WHERE order_id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Delivery not found' });
    }

    const delivery = result.rows[0];

    // Get delivery updates
    const updates = await pool.query(
      'SELECT * FROM delivery_updates WHERE delivery_id = $1 ORDER BY created_at DESC',
      [delivery.id]
    );

    delivery.updates = updates.rows;

    res.json({ success: true, delivery });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch delivery' });
  }
};

// Admin/Agent delivery management
export const getDeliveries = async (req, res) => {
  try {
    const { status, agentId } = req.query;

    let query = 'SELECT * FROM deliveries WHERE 1=1';
    const params = [];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (agentId) {
      query += ` AND delivery_agent_id = $${params.length + 1}`;
      params.push(agentId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({ success: true, deliveries: result.rows });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
  }
};

export const assignDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { agentId } = req.body;

    // Verify agent exists and is delivery agent
    const agentCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [agentId, 'DELIVERY_AGENT']
    );

    if (agentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Delivery agent not found' });
    }

    const result = await pool.query(
      `UPDATE deliveries SET delivery_agent_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [agentId, 'ASSIGNED', deliveryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Delivery not found' });
    }

    res.json({ success: true, delivery: result.rows[0] });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign delivery' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, location, notes } = req.body;

    // Verify agent can update (has delivery assignment)
    const deliveryCheck = await pool.query(
      'SELECT * FROM deliveries WHERE id = $1 AND delivery_agent_id = $2',
      [deliveryId, req.user.id]
    );

    if (deliveryCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Not assigned to this delivery' });
    }

    // Update delivery
    const result = await pool.query(
      `UPDATE deliveries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, deliveryId]
    );

    // Create delivery update record
    await pool.query(
      `INSERT INTO delivery_updates (delivery_id, status, location, notes)
       VALUES ($1, $2, $3, $4)`,
      [deliveryId, status, location, notes]
    );

    // Create notification for customer
    const order = await pool.query(
      'SELECT user_id FROM orders WHERE id = (SELECT order_id FROM deliveries WHERE id = $1)',
      [deliveryId]
    );

    if (order.rows.length > 0) {
      const statusMessage = {
        'ASSIGNED': 'Your delivery has been assigned to an agent',
        'IN_TRANSIT': 'Your order is on the way',
        'DELIVERED': 'Your order has been delivered',
        'FAILED': 'Delivery attempt failed'
      };

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [order.rows[0].user_id, 'Delivery Update', statusMessage[status] || `Status: ${status}`, 'DELIVERY_UPDATE']
      );
    }

    res.json({ success: true, delivery: result.rows[0] });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update delivery' });
  }
};

// Get agent's active deliveries
export const getAgentDeliveries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, o.order_number, o.total, a.street, a.city, a.state, a.zip
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       JOIN addresses a ON o.shipping_address_id = a.id
       WHERE d.delivery_agent_id = $1 AND d.status IN ('ASSIGNED', 'IN_TRANSIT')
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, deliveries: result.rows });
  } catch (error) {
    console.error('Get agent deliveries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
  }
};
