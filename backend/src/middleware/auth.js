import jwt from 'jsonwebtoken';

const getTokenFromRequest = (req) => {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // 2. Cookie header parsing (simple parser to avoid adding dependency)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const c of cookies) {
      const [name, ...rest] = c.split('=');
      if (name === 'shopflow_token') {
        return rest.join('=');
      }
    }
  }

  return null;
};

export const authMiddleware = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  });
};

export const deliveryAgentMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== 'DELIVERY_AGENT') {
      return res.status(403).json({ success: false, error: 'Delivery agent access required' });
    }
    next();
  });
};
