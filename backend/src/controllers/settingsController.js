import pool from '../db/pool.js';

/**
 * Get all admin settings
 */
export const getAdminSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM admin_settings');
    
    // Convert key-value pairs to object
    const settings = {};
    result.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Get admin settings error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

/**
 * Get specific admin setting by key
 */
export const getAdminSetting = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ success: false, error: 'Setting key required' });
    }

    const result = await pool.query('SELECT value, updated_at FROM admin_settings WHERE key = $1', [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }

    const row = result.rows[0];
    let value;
    try {
      value = JSON.parse(row.value);
    } catch {
      value = row.value;
    }

    res.json({ success: true, key, value, updated_at: row.updated_at });
  } catch (err) {
    console.error('Get admin setting error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch setting' });
  }
};

/**
 * Update admin settings (bulk update)
 */
export const updateAdminSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, error: 'Settings object required' });
    }

    // Update or insert each setting
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO admin_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, typeof value === 'string' ? value : JSON.stringify(value)]
      );
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update admin settings error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

/**
 * Update single admin setting
 */
export const updateAdminSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, error: 'Setting key required' });
    }

    if (value === undefined) {
      return res.status(400).json({ success: false, error: 'Setting value required' });
    }

    await pool.query(
      `INSERT INTO admin_settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, typeof value === 'string' ? value : JSON.stringify(value)]
    );

    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (err) {
    console.error('Update admin setting error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update setting' });
  }
};

/**
 * Delete admin setting
 */
export const deleteAdminSetting = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ success: false, error: 'Setting key required' });
    }

    const result = await pool.query('DELETE FROM admin_settings WHERE key = $1 RETURNING key', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }

    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (err) {
    console.error('Delete admin setting error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete setting' });
  }
};

/**
 * Reset settings to defaults
 */
export const resetAdminSettings = async (req, res) => {
  try {
    // Delete all settings
    await pool.query('DELETE FROM admin_settings');

    res.json({ success: true, message: 'Settings reset to defaults' });
  } catch (err) {
    console.error('Reset admin settings error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to reset settings' });
  }
};
