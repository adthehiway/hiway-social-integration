import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { ayrshareService } from './ayrshare.service';

const prisma = new PrismaClient();

export class ProfilesService {
  async create(companyId: string, title: string) {
    const existing = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (existing) return existing;

    try {
      const ayrshareProfile = await ayrshareService.createProfile(title);

      return prisma.ayrshareProfile.create({
        data: {
          companyId,
          profileKey: ayrshareProfile.profileKey,
        },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      throw new AppError(502, `Ayrshare profile creation failed: ${msg}`);
    }
  }

  async getConnectUrl(companyId: string, platform: string) {
    const profile = await this.ensureProfile(companyId);

    try {
      const jwt = await ayrshareService.generateJWT(
        profile.profileKey,
        `${platform}.com`,
      );
      return { url: jwt.url };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      throw new AppError(502, `Ayrshare JWT generation failed: ${msg}`);
    }
  }

  async listAccounts(companyId: string) {
    const profile = await this.ensureProfile(companyId);

    try {
      return ayrshareService.getProfile(profile.profileKey);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      throw new AppError(502, `Ayrshare profile fetch failed: ${msg}`);
    }
  }

  async disconnectPlatform(companyId: string, platform: string) {
    const profile = await this.ensureProfile(companyId);

    try {
      await ayrshareService.unlinkSocial(profile.profileKey, platform);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      throw new AppError(502, `Ayrshare disconnect failed: ${msg}`);
    }
  }

  private async ensureProfile(companyId: string) {
    const profile = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (!profile) throw new AppError(404, 'No profile for this company. Create one first via POST /social/profiles');
    return profile;
  }
}

export const profilesService = new ProfilesService();
