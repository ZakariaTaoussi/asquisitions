import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toHaveProperty('status', 'ok');        // ✅ lowercase
      // retire timestamp et uptime si ton /health ne les retourne pas
    });
  });

  describe('GET /api', () => {
    it('should return API message', async () => {
      const response = await request(app).get('/api').expect(200);
      expect(response.body).toHaveProperty('message', 'API is working'); // ✅
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexsistent').expect(404);
      expect(response.body).toHaveProperty('error', 'Route Not Found'); // ✅ majuscule
    });
  });