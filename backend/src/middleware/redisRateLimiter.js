import Redis from 'ioredis';

let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
} else {
  redisClient = null;
}

export async function redisRateLimiter({ maxAttempts = 10, windowSec = 60 } = {}) {
  if (!redisClient) {
    // Fallback to in-memory rate limiter if Redis not configured
    const { rateLimiter } = await import('./rateLimiter.js');
    return rateLimiter({ maxAttempts, windowMs: windowSec * 1000 });
  }

  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const key = `rl:${ip}`;
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, windowSec);
      }
      if (count > maxAttempts) {
        return res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
      }
      next();
    } catch (err) {
      next();
    }
  };
}
