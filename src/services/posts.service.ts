import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { ayrshareService } from './ayrshare.service';
import { CreatePostInput } from '../types';

const prisma = new PrismaClient();

export class PostsService {
  async create(companyId: string, input: CreatePostInput) {
    const profile = await prisma.ayrshareProfile.findUnique({
      where: { companyId },
    });
    if (!profile) throw new AppError(404, 'No Ayrshare profile for this company');

    const status = input.requireApproval
      ? 'PENDING_APPROVAL'
      : input.scheduledAt
        ? 'SCHEDULED'
        : 'PUBLISHING';

    const post = await prisma.socialPost.create({
      data: {
        companyId,
        mediaUrl: input.mediaUrl,
        status,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        platforms: {
          create: input.platforms.map((p) => ({
            platform: p.platform,
            caption: p.caption,
            hashtags: p.hashtags || [],
          })),
        },
        approval: input.requireApproval
          ? { create: {} }
          : undefined,
      },
      include: { platforms: true, approval: true },
    });

    if (!input.requireApproval) {
      const smartLink = input.includeSmartLink && input.smartLinkUrl ? input.smartLinkUrl : undefined;
      console.log(`[Posts] includeSmartLink=${input.includeSmartLink} smartLinkUrl=${input.smartLinkUrl || 'none'} resolved=${smartLink || 'none'}`);
      await this.publishPost(post.id, smartLink);
    }

    return post;
  }

  async publishPost(postId: string, smartLinkUrl?: string) {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      include: { platforms: true, profile: true },
    });
    if (!post) throw new AppError(404, 'Post not found');

    try {
      for (const plat of post.platforms) {
        let caption = plat.hashtags.length
          ? `${plat.caption} ${plat.hashtags.map((h: string) => `#${h}`).join(' ')}`
          : plat.caption;

        // Append SmartLink URL if provided
        if (smartLinkUrl) {
          caption = `${caption}\n\n${smartLinkUrl}`;
        }

        const result = await ayrshareService.createPost({
          post: caption,
          platforms: [plat.platform.toLowerCase()],
          mediaUrls: [post.mediaUrl],
          profileKey: post.profile.profileKey,
          scheduledDate: post.scheduledAt?.toISOString(),
          autoSchedule: false,
          title: plat.caption.substring(0, 100),
        });

        const postInfo = result.postIds?.[0];
        await prisma.socialPostPlatform.update({
          where: { id: plat.id },
          data: {
            externalPostId: postInfo?.postId || result.id,
            externalPostUrl: postInfo?.postUrl,
            status: 'submitted',
          },
        });
      }

      await prisma.socialPost.update({
        where: { id: postId },
        data: { status: post.scheduledAt ? 'SCHEDULED' : 'PUBLISHING' },
      });
    } catch (err) {
      await prisma.socialPost.update({
        where: { id: postId },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }

  async list(companyId: string, page = 1, limit = 20) {
    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where: { companyId },
        include: { platforms: true, approval: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.socialPost.count({ where: { companyId } }),
    ]);
    return { posts, total, page, limit };
  }

  async getById(postId: string, companyId: string) {
    const post = await prisma.socialPost.findFirst({
      where: { id: postId, companyId },
      include: { platforms: true, approval: true },
    });
    if (!post) throw new AppError(404, 'Post not found');
    return post;
  }

  async cancel(postId: string, companyId: string) {
    const post = await this.getById(postId, companyId);
    if (!['SCHEDULED', 'DRAFT', 'PENDING_APPROVAL'].includes(post.status)) {
      throw new AppError(400, 'Cannot cancel post in current status');
    }
    return prisma.socialPost.update({
      where: { id: postId },
      data: { status: 'FAILED' },
      include: { platforms: true },
    });
  }

  async approve(postId: string, companyId: string, approvedBy: string) {
    const post = await this.getById(postId, companyId);
    if (post.status !== 'PENDING_APPROVAL') {
      throw new AppError(400, 'Post is not pending approval');
    }

    await prisma.postApproval.update({
      where: { postId },
      data: { approvedBy, approvedAt: new Date() },
    });

    await prisma.socialPost.update({
      where: { id: postId },
      data: { status: 'APPROVED' },
    });

    await this.publishPost(postId);

    return this.getById(postId, companyId);
  }

  async reject(postId: string, companyId: string, rejectedBy: string, rejectionNotes: string) {
    const post = await this.getById(postId, companyId);
    if (post.status !== 'PENDING_APPROVAL') {
      throw new AppError(400, 'Post is not pending approval');
    }

    await prisma.postApproval.update({
      where: { postId },
      data: { rejectedBy, rejectedAt: new Date(), rejectionNotes },
    });

    return prisma.socialPost.update({
      where: { id: postId },
      data: { status: 'REJECTED' },
      include: { platforms: true, approval: true },
    });
  }

  async listPending(companyId: string) {
    return prisma.socialPost.findMany({
      where: { companyId, status: 'PENDING_APPROVAL' },
      include: { platforms: true, approval: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const postsService = new PostsService();
