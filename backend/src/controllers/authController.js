import pool from '../db/pool.js';
import crypto from 'crypto';
import { hashPassword, comparePassword, generateToken, validateEmail, validatePasswordStrength } from '../utils/helpers.js';
import { sendAccountVerificationSMS, sendPasswordResetSMS } from '../utils/smsService.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.status(400).json({ success: false, error: strength.reason });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, phone, role',
      [email, hashedPassword, firstName, lastName, phone || null, 'CUSTOMER']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    // Set HttpOnly cookie for session
    res.cookie('shopflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome SMS
    if (phone) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await sendAccountVerificationSMS(user.id, phone, verificationCode);
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is disabled' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.cookie('shopflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (user.role === 'CUSTOMER') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is disabled' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.cookie('shopflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, first_name, last_name, phone, role',
      [firstName, lastName, phone, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    // ... existing code ...
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password required' });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ success: false, error: strength.reason });
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const userRes = await pool.query('SELECT id, email, phone FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      // Do not reveal whether email exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const user = userRes.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hashPassword(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&id=${user.id}`;
    console.log(`Password reset requested for ${user.email}: ${resetUrl}`);

    // Send SMS if phone available
    if (user.phone) {
      await sendPasswordResetSMS(user.id, user.phone, token);
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ success: false, error: 'Failed to request password reset' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) return res.status(400).json({ success: false, error: 'Required fields missing' });

    const resets = await pool.query(
      'SELECT id, token_hash, expires_at, used FROM password_resets WHERE user_id = $1 AND used = false AND expires_at > NOW() ORDER BY created_at DESC',
      [userId]
    );

    if (resets.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    let matchRow = null;
    for (const row of resets.rows) {
      const match = await comparePassword(token, row.token_hash);
      if (match) {
        matchRow = row;
        break;
      }
    }

    if (!matchRow) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) return res.status(400).json({ success: false, error: strength.reason });

    const hashedPassword = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [matchRow.id]);

    res.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie('shopflow_token', { path: '/' });
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
};
