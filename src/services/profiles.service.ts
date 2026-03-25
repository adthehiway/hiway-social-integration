import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { ayrshareService } from './ayrshare.service';
import { obfuscateIdentifier } from '../utils/obfuscate';

const prisma = new PrismaClient();

export class ProfilesService {
  async create(companyId: string, email: string) {
    const existing = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (existing) return existing;

    try {
      const profileTitle = obfuscateIdentifier(email);
      const ayrshareProfile = await ayrshareService.createProfile(profileTitle);
      console.log(`[Profiles] Created Ayrshare profile for ${companyId}: profileKey=${ayrshareProfile.profileKey}`);

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

  async reset(companyId: string, email: string) {
    const existing = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
      include: { posts: true },
    });
    if (existing) {
      console.log(`[Profiles] Resetting profile for ${companyId}: old profileKey=${existing.profileKey}`);
      try { await ayrshareService.deleteProfile(existing.profileKey); } catch (_) {}
      // Delete related records first (cascade)
      for (const post of existing.posts) {
        await prisma.postApproval.deleteMany({ where: { postId: post.id } });
        await prisma.socialPostPlatform.deleteMany({ where: { postId: post.id } });
      }
      await prisma.socialPost.deleteMany({ where: { companyId } });
      await prisma.ayrshareProfile.delete({ where: { companyId } });
      console.log(`[Profiles] Deleted old profile and ${existing.posts.length} posts`);
    }
    return this.create(companyId, email);
  }

  async getConnectUrl(companyId: string, _platform: string) {
    const profile = await this.ensureProfile(companyId);

    try {
      // Domain is the Ayrshare SSO domain (e.g. id-NacDD), not the social platform
      const jwt = await ayrshareService.generateJWT(profile.profileKey, '');
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
