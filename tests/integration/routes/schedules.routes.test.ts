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
import { schedulesService } from '../../../src/services/schedules.service';

const headers = { 'x-api-key': 'test-key', 'x-company-id': 'comp1' };

describe('Schedules Routes', () => {
  beforeEach(() => schedulesService._clear());

  it('CRUD flow', async () => {
    // Create
    const createRes = await request(app)
      .post('/social/schedules')
      .set(headers)
      .send({ name: 'Morning', platforms: ['twitter'], times: ['09:00'] });
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    // List
    const listRes = await request(app).get('/social/schedules').set(headers);
    expect(listRes.body).toHaveLength(1);

    // Update
    const updateRes = await request(app)
      .put(`/social/schedules/${id}`)
      .set(headers)
      .send({ name: 'Evening' });
    expect(updateRes.body.name).toBe('Evening');

    // Delete
    const deleteRes = await request(app)
      .delete(`/social/schedules/${id}`)
      .set(headers);
    expect(deleteRes.status).toBe(204);
  });

  it('returns 400 for invalid create', async () => {
    const res = await request(app)
      .post('/social/schedules')
      .set(headers)
      .send({});
    expect(res.status).toBe(400);
  });
});
