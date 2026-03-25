jest.mock('../../../src/config/env', () => ({
  env: {
    PORT: 3000,
    AYRSHARE_API_KEY: 'test',
    AYRSHARE_BASE_URL: 'https://test.ayrshare.com/api',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
}));

jest.mock('../../../src/services/ayrshare.service');
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    ayrshareProfile: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { ProfilesService } from '../../../src/services/profiles.service';
import { ayrshareService } from '../../../src/services/ayrshare.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

describe('ProfilesService.disconnectPlatform', () => {
  let service: ProfilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfilesService();
  });

  it('calls ayrshare unlinkSocial with correct profileKey and platform', async () => {
    prisma.ayrshareProfile.findUnique.mockResolvedValue({
      id: '1',
      companyId: 'comp1',
      profileKey: 'pk_abc123',
    });
    (ayrshareService.unlinkSocial as jest.Mock).mockResolvedValue(undefined);

    const result = await service.disconnectPlatform('comp1', 'instagram');

    expect(ayrshareService.unlinkSocial).toHaveBeenCalledWith('pk_abc123', 'instagram');
    expect(result).toEqual({ success: true });
  });

  it('throws 404 when no profile exists', async () => {
    prisma.ayrshareProfile.findUnique.mockResolvedValue(null);

    await expect(service.disconnectPlatform('comp1', 'instagram'))
      .rejects.toThrow(/No profile for this company/);
  });

  it('throws 502 when Ayrshare API fails', async () => {
    prisma.ayrshareProfile.findUnique.mockResolvedValue({
      id: '1',
      companyId: 'comp1',
      profileKey: 'pk_abc123',
    });
    (ayrshareService.unlinkSocial as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    await expect(service.disconnectPlatform('comp1', 'instagram'))
      .rejects.toThrow(/Ayrshare disconnect failed/);
  });
});
