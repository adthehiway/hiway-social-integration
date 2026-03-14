import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { ayrshareService } from './ayrshare.service';

const prisma = new PrismaClient();

export class ProfilesService {
  async create(companyId: string, title: string) {
    const existing = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (existing) throw new AppError(409, 'Profile already exists for this company');

    const ayrshareProfile = await ayrshareService.createProfile(title);

    return prisma.ayrshareProfile.create({
      data: {
        companyId,
        profileKey: ayrshareProfile.profileKey,
      },
    });
  }

  async getConnectUrl(companyId: string, platform: string) {
    const profile = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (!profile) throw new AppError(404, 'No profile for this company');

    const jwt = await ayrshareService.generateJWT(
      profile.profileKey,
      `${platform}.com`,
    );
    return { url: jwt.url };
  }

  async listAccounts(companyId: string) {
    const profile = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (!profile) throw new AppError(404, 'No profile for this company');

    return ayrshareService.getProfile(profile.profileKey);
  }

  async disconnectPlatform(companyId: string, platform: string) {
    const profile = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (!profile) throw new AppError(404, 'No profile for this company');

    await ayrshareService.unlinkSocial(profile.profileKey, platform);
    return { success: true };
  }
}

export const profilesService = new ProfilesService();
