jest.mock('../../../src/config/env', () => ({
  env: {
    PORT: 3000,
    AYRSHARE_API_KEY: 'test',
    AYRSHARE_BASE_URL: 'https://test.ayrshare.com/api',
    HIWAY_API_KEY: 'test-key',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
}));

import request from 'supertest';
import { app } from '../../../src/index';

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
