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

jest.mock('../../../src/services/posts.service');

import request from 'supertest';
import { app } from '../../../src/index';
import { postsService } from '../../../src/services/posts.service';

const headers = { 'x-api-key': 'test-key', 'x-company-id': 'comp1' };

describe('Posts Routes', () => {
  describe('POST /social/posts', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app).post('/social/posts').send({});
      expect(res.status).toBe(401);
    });

    it('returns 400 with invalid body', async () => {
      const res = await request(app)
        .post('/social/posts')
        .set(headers)
        .send({});
      expect(res.status).toBe(400);
    });

    it('creates a post with valid input', async () => {
      const mockPost = { id: '1', status: 'PUBLISHING' };
      (postsService.create as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app)
        .post('/social/posts')
        .set(headers)
        .send({
          mediaUrl: 'https://example.com/video.mp4',
          platforms: [{ platform: 'twitter', caption: 'Hello world' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe('1');
    });
  });

  describe('GET /social/posts', () => {
    it('lists posts', async () => {
      (postsService.list as jest.Mock).mockResolvedValue({
        posts: [], total: 0, page: 1, limit: 20,
      });
      const res = await request(app).get('/social/posts').set(headers);
      expect(res.status).toBe(200);
      expect(res.body.posts).toEqual([]);
    });
  });

  describe('GET /social/posts/pending', () => {
    it('lists pending posts', async () => {
      (postsService.listPending as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get('/social/posts/pending').set(headers);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /social/posts/:id', () => {
    it('gets a post', async () => {
      (postsService.getById as jest.Mock).mockResolvedValue({ id: '1' });
      const res = await request(app).get('/social/posts/1').set(headers);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /social/posts/:id', () => {
    it('cancels a post', async () => {
      (postsService.cancel as jest.Mock).mockResolvedValue({ id: '1', status: 'FAILED' });
      const res = await request(app).delete('/social/posts/1').set(headers);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /social/posts/:id/approve', () => {
    it('validates input', async () => {
      const res = await request(app)
        .post('/social/posts/1/approve')
        .set(headers)
        .send({});
      expect(res.status).toBe(400);
    });

    it('approves a post', async () => {
      (postsService.approve as jest.Mock).mockResolvedValue({ id: '1', status: 'APPROVED' });
      const res = await request(app)
        .post('/social/posts/1/approve')
        .set(headers)
        .send({ approvedBy: 'admin' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /social/posts/:id/reject', () => {
    it('rejects a post', async () => {
      (postsService.reject as jest.Mock).mockResolvedValue({ id: '1', status: 'REJECTED' });
      const res = await request(app)
        .post('/social/posts/1/reject')
        .set(headers)
        .send({ rejectedBy: 'admin', rejectionNotes: 'Not suitable' });
      expect(res.status).toBe(200);
    });
  });
});
