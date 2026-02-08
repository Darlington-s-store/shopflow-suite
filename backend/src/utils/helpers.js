import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcryptjs.compare(password, hashedPassword);
};

export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') return { valid: false, reason: 'Password required' };
  if (password.length < 8) return { valid: false, reason: 'Password must be at least 8 characters' };
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return { valid: false, reason: 'Password must include both lower and upper case letters' };
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'Password must include a number' };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, reason: 'Password should include a special character' };
  return { valid: true };
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const generateOrderNumber = () => {
  const prefix = 'ORD';
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateOrderTotals = (items, taxRate, shippingFee) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = (subtotal * (taxRate || 7.5)) / 100;
  const total = subtotal + tax + (shippingFee || 0);
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    deliveryFee: shippingFee || 0,
    total: Math.round(total * 100) / 100
  };
};
