import pool from '../db/pool.js';

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, message, relatedOrderId, messageType } = req.body;
    if (!recipientId || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Recipient ID, subject, and message required' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, message, message_type, related_order_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, recipientId, subject, message, messageType || 'USER_MESSAGE', relatedOrderId || null]
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { folder = 'all', page = 1, limit = 20 } = req.query;
    let query = `SELECT m.*, u.first_name, u.last_name, u.email, u.phone
                 FROM messages m
                 JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.recipient_id = u.id ELSE m.sender_id = u.id END)`;
    let params = [req.user.id];

    if (folder === 'unread') {
      query += ` WHERE m.is_read = false AND (m.recipient_id = $1 OR m.sender_id = $1)`;
    } else if (folder === 'sent') {
      query += ` WHERE m.sender_id = $1`;
    } else if (folder === 'received') {
      query += ` WHERE m.recipient_id = $1`;
    } else {
      query += ` WHERE m.sender_id = $1 OR m.recipient_id = $1`;
    }

    query += ` ORDER BY m.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('Get user messages error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

export const getMessageThread = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.email, u.phone
       FROM messages m
       JOIN users u ON CASE WHEN m.sender_id = $1 THEN m.recipient_id = u.id ELSE m.sender_id = u.id END
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, userId]
    );

    // Mark all messages in thread as read
    await pool.query(
      `UPDATE messages SET is_read = true WHERE recipient_id = $1 AND sender_id = $2`,
      [req.user.id, userId]
    );

    res.json({ success: true, thread: result.rows });
  } catch (err) {
    console.error('Get message thread error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch message thread' });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1 AND recipient_id = $2',
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark message read error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)',
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
};
