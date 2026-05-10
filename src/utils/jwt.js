import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const JWT_EXPIRATION = '1d'; // Token expires in 1 day

 export const jwttoken = { 
    sign:(payload) => { 
        try { 
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        }catch (e){ 
            logger.error('Error signing JWT:', e);
            throw new Error('Failed to sign JWT');
        }
    },
    verify: (token) => { 
        try { 
            return jwt.verify(token, JWT_SECRET);
        }catch (e){ 
            logger.error('Error verifying JWT:', e);
            throw new Error('Failed to verify JWT');
        }
    }
 }