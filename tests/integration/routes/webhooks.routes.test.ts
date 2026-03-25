jest.mock('../../../src/config/env', () => ({
  env: {
    PORT: 3000,
    AYRSHARE_API_KEY: 'test',
    AYRSHARE_BASE_URL: 'https://test.ayrshare.com/api',

    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
}));

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    socialPostPlatform: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    socialPost: {
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import request from 'supertest';
import { app } from '../../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

describe('POST /webhooks/ayrshare', () => {
  it('returns received:true even if no match', async () => {
    prisma.socialPostPlatform.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/webhooks/ayrshare')
      .send({ type: 'post', postId: 'ext123', platform: 'twitter', status: 'success' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true, matched: false });
  });

  it('updates platform status on match', async () => {
    const mockPlatformPost = {
      id: 'plat1',
      postId: 'post1',
      externalPostUrl: null,
      post: {
        id: 'post1',
        platforms: [{ id: 'plat1', status: 'submitted' }],
      },
    };
    prisma.socialPostPlatform.findFirst.mockResolvedValue(mockPlatformPost);
    prisma.socialPostPlatform.update.mockResolvedValue({});
    prisma.socialPostPlatform.findMany.mockResolvedValue([{ status: 'published' }]);
    prisma.socialPost.update.mockResolvedValue({});

    const res = await request(app)
      .post('/webhooks/ayrshare')
      .send({
        type: 'post',
        postId: 'ext123',
        platform: 'twitter',
        status: 'success',
        postUrl: 'https://twitter.com/status/123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true, matched: true });
    expect(prisma.socialPostPlatform.update).toHaveBeenCalled();
  });
});
