import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import securityMiddleware from '../src/middleware/security.middleware.js';
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(helmet());
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use(securityMiddleware);
app.get('/', (req, res) => {
  logger.info('Hello World from logger!');
  res.status(200).send('Hello World !');
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
export default app;
