jest.mock('../../../src/config/env', () => ({
  env: {
    PORT: 3000,
    AYRSHARE_API_KEY: 'test',
    AYRSHARE_BASE_URL: 'https://test.ayrshare.com/api',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
}));

jest.mock('../../../src/services/profiles.service');

import request from 'supertest';
import { app } from '../../../src/index';
import { profilesService } from '../../../src/services/profiles.service';
import { AppError } from '../../../src/middleware/error.middleware';

const headers = { host: 'localhost:3000', 'x-company-id': 'comp1' };

describe('Accounts Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('DELETE /social/accounts/:platform', () => {
    it('returns 400 without x-company-id header', async () => {
      const res = await request(app).delete('/social/accounts/instagram');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/x-company-id/i);
    });

    it('disconnects a platform successfully', async () => {
      (profilesService.disconnectPlatform as jest.Mock).mockResolvedValue({ success: true });

      const res = await request(app)
        .delete('/social/accounts/instagram')
        .set(headers);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(profilesService.disconnectPlatform).toHaveBeenCalledWith('comp1', 'instagram');
    });

    it('handles different platform names', async () => {
      (profilesService.disconnectPlatform as jest.Mock).mockResolvedValue({ success: true });

      for (const platform of ['facebook', 'twitter', 'tiktok', 'youtube', 'linkedin']) {
        const res = await request(app)
          .delete(`/social/accounts/${platform}`)
          .set(headers);
        expect(res.status).toBe(200);
        expect(profilesService.disconnectPlatform).toHaveBeenCalledWith('comp1', platform);
      }
    });

    it('returns 404 when no profile exists for company', async () => {
      (profilesService.disconnectPlatform as jest.Mock).mockRejectedValue(
        new AppError(404, 'No profile for this company. Create one first via POST /social/profiles')
      );

      const res = await request(app)
        .delete('/social/accounts/instagram')
        .set(headers);

      expect(res.status).toBe(404);
    });

    it('returns 502 when Ayrshare API fails', async () => {
      (profilesService.disconnectPlatform as jest.Mock).mockRejectedValue(
        new AppError(502, 'Ayrshare disconnect failed: timeout')
      );

      const res = await request(app)
        .delete('/social/accounts/instagram')
        .set(headers);

      expect(res.status).toBe(502);
    });
  });

  describe('GET /social/accounts', () => {
    it('returns 400 without x-company-id header', async () => {
      const res = await request(app).get('/social/accounts');
      expect(res.status).toBe(400);
    });

    it('lists accounts successfully', async () => {
      const mockAccounts = { activeSocialAccounts: ['instagram', 'facebook'] };
      (profilesService.listAccounts as jest.Mock).mockResolvedValue(mockAccounts);

      const res = await request(app)
        .get('/social/accounts')
        .set(headers);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAccounts);
    });
  });
});
