import pool from '../db/pool.js';

export const getDeals = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
        res.json({ success: true, deals: result.rows });
    } catch (err) {
        console.error('Get deals error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to fetch deals' });
    }
};

export const createDeal = async (req, res) => {
    try {
        const { title, description, image_url, discount_percentage, start_date, end_date, info, is_active } = req.body;

        const result = await pool.query(
            `INSERT INTO deals (title, description, image_url, discount_percentage, start_date, end_date, info, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [title, description, image_url, discount_percentage, start_date, end_date, info, is_active ?? true]
        );

        res.status(201).json({ success: true, deal: result.rows[0] });
    } catch (err) {
        console.error('Create deal error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to create deal' });
    }
};

export const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, discount_percentage, start_date, end_date, info, is_active } = req.body;

        const result = await pool.query(
            `UPDATE deals 
       SET title = $1, description = $2, image_url = $3, discount_percentage = $4, start_date = $5, end_date = $6, info = $7, is_active = $8
       WHERE id = $9
       RETURNING *`,
            [title, description, image_url, discount_percentage, start_date, end_date, info, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Deal not found' });
        }

        res.json({ success: true, deal: result.rows[0] });
    } catch (err) {
        console.error('Update deal error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to update deal' });
    }
};

export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM deals WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Deal not found' });
        }

        res.json({ success: true, message: 'Deal deleted successfully' });
    } catch (err) {
        console.error('Delete deal error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to delete deal' });
    }
};
