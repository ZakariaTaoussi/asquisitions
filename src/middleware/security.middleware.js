import aj from '../config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '../config/logger.js';

const ROLE_LIMITS = {
  admin: { max: 20, message: 'Admin limit exceeded (20/min).' },
  user:  { max: 10, message: 'User limit exceeded (10/min).' },
  guest: { max: 5,  message: 'Guest limit exceeded (5/min).' },
};

const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';
        const { max, message } = ROLE_LIMITS[role] ?? ROLE_LIMITS.guest;

        // ✅ Pas de "name", interval en secondes (nombre)
        const client = aj.withRule(
          slidingWindow({ mode: 'LIVE', interval: 60, max })
        );

        const decision = await client.protect(req);

        if (decision.isDenied() && decision.reason.isBot()) {
            logger.warn('Bot request blocked', { ip: req.ip, path: req.path });
            return res.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed' });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            logger.warn('Shield blocked request', { ip: req.ip, path: req.path });
            return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by shield' });
        }

        if (decision.isDenied()) {
            logger.warn('Rate limit exceeded', { ip: req.ip, role, path: req.path });
            return res.status(429).json({ error: 'Too Many Requests', message });
        }

        next();

    } catch (e) {
        logger.error('Arcjet middleware error:', e);

        next();
    }
};

export default securityMiddleware;