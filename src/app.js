import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import securityMiddleware from '../src/middleware/security.middleware.js';
const app = express();
app.use(cors());
app.use(cookieParser());    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(helmet());
app.use(securityMiddleware);
app.get('/', (req, res) => {
  logger.info('Hello World from logger!');
  res.status(200).send('Hello World !');
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});

app.use('/api/auth', authRoutes);
export default app;
