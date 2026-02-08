import pool from '../db/pool.js';

export const getUserNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        // Map snake_case to camelCase for frontend
        const notifications = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            message: row.message,
            type: row.type,
            isRead: row.is_read,
            orderId: row.order_id,
            createdAt: row.created_at
        }));

        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM notifications WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to clear notifications' });
    }
};

// Helper to create a notification (for internal use)
export const createNotification = async (userId, title, message, type, orderId = null) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, order_id) VALUES ($1, $2, $3, $4, $5)',
            [userId, title, message, type, orderId]
        );
        return true;
    } catch (error) {
        console.error('Create notification error:', error);
        return false;
    }
};
