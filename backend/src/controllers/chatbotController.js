import pool from '../db/pool.js';
import { sendChatbotSMS } from '../utils/smsService.js';

// AI-powered chatbot responses based on website content
const generateChatbotResponse = async (userMessage, context) => {
  const lowerMessage = userMessage.toLowerCase();

  // Product inquiry
  if (lowerMessage.includes('product') || lowerMessage.includes('find')) {
    return {
      type: 'PRODUCT_INQUIRY',
      message: 'I can help you find the perfect product! Could you describe what you\'re looking for? (e.g., laptop, phone, headphones)',
      followUp: true
    };
  }

  // Price inquiry
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return {
      type: 'PRICE_INQUIRY',
      message: 'I\'d be happy to help with pricing. Please tell me which product you\'re interested in, and I can provide you with the current pricing and any available deals.',
      followUp: true
    };
  }

  // Delivery inquiry
  if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('how long')) {
    return {
      type: 'DELIVERY_INQUIRY',
      message: 'We offer fast delivery! Typically items arrive within 2-5 business days in major cities. Would you like to know more about shipping to your area?',
      followUp: false
    };
  }

  // Returns inquiry
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
    return {
      type: 'RETURN_INQUIRY',
      message: 'We have a 30-day return policy for all unopened items. If you have a defective product, we\'ll replace it immediately. Do you need to process a return?',
      followUp: false
    };
  }

  // Contact support
  if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('problem')) {
    return {
      type: 'SUPPORT_REQUEST',
      message: 'I\'m here to help! If you need urgent assistance, our support team is available 24/7. What issue are you experiencing?',
      followUp: true
    };
  }

  // Default response
  return {
    type: 'GENERAL',
    message: 'Thanks for reaching out! I\'m an AI assistant here to help with product inquiries, orders, delivery, and more. How can I assist you today?',
    followUp: false
  };
};

export const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { message, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ success: false, error: 'Message or image required' });
    }

    // Get user info for SMS
    const userRes = await pool.query('SELECT phone, email FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Generate AI response based on message
    const aiResponse = await generateChatbotResponse(message, { hasImage: !!image });

    // Store user message
    await pool.query(
      `INSERT INTO chatbot_messages (user_id, message, message_type, image_url)
       VALUES ($1, $2, $3, $4)`,
      [userId, message, 'USER', image || null]
    );

    // Store AI response
    const responseRes = await pool.query(
      `INSERT INTO chatbot_messages (user_id, message, message_type, ai_response_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, aiResponse.message, 'BOT', aiResponse.type]
    );

    // Create notification for user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Chatbot Response', aiResponse.message, 'CHATBOT']
    );

    // Send SMS if user enabled notifications
    if (user.phone) {
      await sendChatbotSMS(userId, user.phone, aiResponse.message);
    }

    res.json({
      success: true,
      message: aiResponse.message,
      type: aiResponse.type,
      followUp: aiResponse.followUp,
      response: responseRes.rows[0]
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const result = await pool.query(
      `SELECT * FROM chatbot_messages 
       WHERE user_id = $1 
       ORDER BY created_at ASC
       LIMIT 100`,
      [userId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
};

export const uploadChatImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    // In production, use a file upload service like AWS S3, Cloudinary, etc.
    // For now, accept base64 image
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: 'Image required' });

    // Store message with image
    const result = await pool.query(
      `INSERT INTO chatbot_messages (user_id, message, message_type, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, 'Product image inquiry', 'USER', image]
    );

    // Create notification for admin to check the image
    await pool.query(
      `INSERT INTO admin_notifications (title, message, type, data)
       VALUES ($1, $2, $3, $4)`,
      ['New Product Image Upload', `User ${userId} uploaded a product image for verification`, 'IMAGE_UPLOAD', JSON.stringify({ userId, messageId: result.rows[0].id })]
    );

    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Upload chat image error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
};

// Admin: Get all chatbot conversations
export const getAdminChatbots = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    let query = `SELECT DISTINCT cm.user_id, u.first_name, u.last_name, u.email, u.phone, 
                        MAX(cm.created_at) as last_message_time
                 FROM chatbot_messages cm
                 JOIN users u ON cm.user_id = u.id`;
    let params = [];

    if (userId) {
      query += ` WHERE cm.user_id = $1`;
      params.push(userId);
    }

    query += ` GROUP BY cm.user_id, u.id
              ORDER BY MAX(cm.created_at) DESC
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);
    res.json({ success: true, conversations: result.rows });
  } catch (error) {
    console.error('Get admin chatbots error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chatbot conversations' });
  }
};

// Admin: Get specific user conversation
export const getAdminConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM chatbot_messages 
       WHERE user_id = $1 
       ORDER BY created_at ASC`,
      [userId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get admin conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
};

// Admin: Send message to user via chatbot
export const sendAdminChatbotMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    // Get user phone for SMS
    const userRes = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Store admin message
    const result = await pool.query(
      `INSERT INTO chatbot_messages (user_id, message, message_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, message, 'ADMIN']
    );

    // Create notification for user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Support Team Response', message, 'ADMIN_MESSAGE']
    );

    // Send SMS
    if (user.phone) {
      await sendChatbotSMS(userId, user.phone, message);
    }

    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Send admin chatbot message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export default {
  sendChatMessage,
  getConversation,
  uploadChatImage,
  getAdminChatbots,
  getAdminConversation,
  sendAdminChatbotMessage
};
