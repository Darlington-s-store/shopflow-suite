const attempts = new Map();

// Simple in-memory rate limiter for auth endpoints
// maxAttempts per windowMs per ip
export function rateLimiter({ maxAttempts = 5, windowMs = 60 * 1000 } = {}) {
  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const now = Date.now();
      const entry = attempts.get(ip) || { count: 0, first: now };

      if (now - entry.first > windowMs) {
        entry.count = 0;
        entry.first = now;
      }

      entry.count++;
      attempts.set(ip, entry);

      if (entry.count > maxAttempts) {
        res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
        return;
      }

      next();
    } catch (err) {
      next();
    }
  };
}

// Helper to reset attempts for an IP (useful after successful login)
export function resetAttemptsForIp(ip) {
  attempts.delete(ip);
}
