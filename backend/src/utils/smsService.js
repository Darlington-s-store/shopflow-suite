import axios from 'axios';
import pool from '../db/pool.js';

const ARKESEL_API_URL = 'https://sms.arkesel.com/api/send';
const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY || '';

/**
 * Send SMS via Arkesel
 * @param {string} phoneNumber - Phone number in format: 233XXXXXXXXX
 * @param {string} message - SMS message content
 * @param {string} senderID - Sender ID (optional, defaults to SHOPFLOW)
 * @returns {Promise<object>}
 */
export const sendSMS = async (phoneNumber, message, senderID = 'SHOPFLOW') => {
  try {
    if (!ARKESEL_API_KEY) {
      console.warn('⚠️ ARKESEL_API_KEY not configured');
      return { success: false, message: 'SMS service not configured' };
    }

    const response = await axios.post(ARKESEL_API_URL, {
      api_key: ARKESEL_API_KEY,
      to: phoneNumber,
      sms: message,
      sender_id: senderID,
    });

    console.log('✓ SMS sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS and log it
 * @param {number} userId - User ID
 * @param {string} phoneNumber - Phone number
 * @param {string} message - SMS message
 * @param {string} type - SMS type (account_verification, order_confirmation, delivery_update, etc.)
 * @returns {Promise<object>}
 */
export const sendAndLogSMS = async (userId, phoneNumber, message, type = 'general') => {
  try {
    // Send SMS
    const smsResult = await sendSMS(phoneNumber, message);

    // Log SMS in database
    const logQuery = `
      INSERT INTO sms_logs (user_id, phone_number, message, type, arkesel_response, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(logQuery, [
      userId,
      phoneNumber,
      message,
      type,
      JSON.stringify(smsResult),
      smsResult.success ? 'SENT' : 'FAILED',
    ]);

    return { success: smsResult.success, smsLog: result.rows[0] };
  } catch (error) {
    console.error('❌ Send and log SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send account verification SMS
 */
export const sendAccountVerificationSMS = async (userId, phoneNumber, token) => {
  const message = `Welcome to ShopFlow! Your verification code is: ${token}. Valid for 24 hours.`;
  return sendAndLogSMS(userId, phoneNumber, message, 'account_verification');
};

/**
 * Send order confirmation SMS
 */
export const sendOrderConfirmationSMS = async (userId, phoneNumber, orderNumber, total) => {
  const message = `Your order #${orderNumber} has been confirmed. Total: GHS ${total}. You'll receive updates as your order is processed. Thank you for shopping with ShopFlow!`;
  return sendAndLogSMS(userId, phoneNumber, message, 'order_confirmation');
};

/**
 * Send delivery assigned SMS
 */
export const sendDeliveryAssignedSMS = async (userId, phoneNumber, riderName, riderPhone, estimatedTime) => {
  const message = `Your delivery has been assigned to ${riderName}. Contact: ${riderPhone}. Estimated delivery: ${estimatedTime}. Track your order on ShopFlow.`;
  return sendAndLogSMS(userId, phoneNumber, message, 'delivery_assigned');
};

/**
 * Send delivery status update SMS
 */
export const sendDeliveryUpdateSMS = async (userId, phoneNumber, status, note = '') => {
  let message = '';
  switch (status) {
    case 'out_for_delivery':
      message = `Your order is out for delivery! ${note ? `Note: ${note}` : ''} Track it on ShopFlow.`;
      break;
    case 'delivered':
      message = `Your order has been delivered! Thank you for shopping with ShopFlow. Please rate your experience.`;
      break;
    case 'failed':
      message = `Delivery attempt failed. ${note} Please contact support or reschedule delivery.`;
      break;
    default:
      message = `Order status update: ${status}. ${note}`;
  }
  return sendAndLogSMS(userId, phoneNumber, message, 'delivery_update');
};

/**
 * Send password reset SMS
 */
export const sendPasswordResetSMS = async (userId, phoneNumber, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const message = `Your password reset code is: ${resetToken.substring(0, 6)}. Use this to reset your password. Link: ${resetLink}`;
  return sendAndLogSMS(userId, phoneNumber, message, 'password_reset');
};

/**
 * Send promotional SMS
 */
export const sendPromotionalSMS = async (userId, phoneNumber, promoMessage) => {
  return sendAndLogSMS(userId, phoneNumber, promoMessage, 'promotion');
};

/**
 * Send chatbot response SMS
 */
export const sendChatbotSMS = async (userId, phoneNumber, message) => {
  return sendAndLogSMS(userId, phoneNumber, message, 'chatbot_response');
};

/**
 * Send stock alert SMS
 */
export const sendStockAlertSMS = async (userId, phoneNumber, productName, quantity) => {
  const message = `Stock Alert: "${productName}" is running low with only ${quantity} units remaining. Restock soon to avoid missing sales.`;
  return sendAndLogSMS(userId, phoneNumber, message, 'stock_alert');
};

/**
 * Send deal/promo SMS
 */
export const sendDealAlertSMS = async (userId, phoneNumber, dealTitle, discount) => {
  const message = `Flash Sale Alert! ${dealTitle} - Get ${discount}% off now! Shop at ShopFlow before this deal ends.`;
  return sendAndLogSMS(userId, phoneNumber, message, 'deal_alert');
};
