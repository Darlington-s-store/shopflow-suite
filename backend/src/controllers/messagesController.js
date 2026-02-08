import pool from '../db/pool.js';

export const getMessages = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json({ success: true, messages: result.rows });
    } catch (err) {
        console.error('Get messages error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

export const createMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Simple validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await pool.query(
            `INSERT INTO messages (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'UNREAD')
       RETURNING *`,
            [name, email, subject, message]
        );

        res.status(201).json({ success: true, message: result.rows[0] });
    } catch (err) {
        console.error('Create message error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // READ, UNREAD, ARCHIVED

        const result = await pool.query(
            `UPDATE messages SET status = $1 WHERE id = $2 RETURNING *`,
            [status || 'READ', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        res.json({ success: true, message: result.rows[0] });
    } catch (err) {
        console.error('Update message error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to update message' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM messages WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
};
