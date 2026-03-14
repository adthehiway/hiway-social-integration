import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AyrshareWebhookPayload } from '../types';

const prisma = new PrismaClient();

export async function handleAyrshareWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body as AyrshareWebhookPayload;

    const platformPost = await prisma.socialPostPlatform.findFirst({
      where: { externalPostId: payload.postId },
      include: { post: { include: { platforms: true } } },
    });

    if (!platformPost) {
      return res.status(200).json({ received: true, matched: false });
    }

    const newStatus = payload.status === 'success' ? 'published' : 'failed';
    await prisma.socialPostPlatform.update({
      where: { id: platformPost.id },
      data: {
        status: newStatus,
        externalPostUrl: payload.postUrl || platformPost.externalPostUrl,
        errorMessage: payload.errors?.join('; '),
      },
    });

    // Update parent post status based on all platform statuses
    const allPlatforms = await prisma.socialPostPlatform.findMany({
      where: { postId: platformPost.postId },
    });

    const allPublished = allPlatforms.every((p) => p.status === 'published');
    const allFailed = allPlatforms.every((p) => p.status === 'failed');
    const anyPublished = allPlatforms.some((p) => p.status === 'published');

    let postStatus: string;
    if (allPublished) postStatus = 'PUBLISHED';
    else if (allFailed) postStatus = 'FAILED';
    else if (anyPublished) postStatus = 'PARTIAL';
    else postStatus = 'PUBLISHING';

    await prisma.socialPost.update({
      where: { id: platformPost.postId },
      data: {
        status: postStatus as any,
        publishedAt: allPublished ? new Date() : undefined,
      },
    });

    res.status(200).json({ received: true, matched: true });
  } catch (err) { next(err); }
}
