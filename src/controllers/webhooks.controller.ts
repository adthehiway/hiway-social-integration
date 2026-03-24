import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AyrshareWebhookPayload } from '../types';

const prisma = new PrismaClient();

export async function handleAyrshareWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body as AyrshareWebhookPayload;
    console.log(`[Webhook] RECEIVED postId=${payload.postId} status=${payload.status} platform=${payload.platform || 'unknown'}`);

    const platformPost = await prisma.socialPostPlatform.findFirst({
      where: { externalPostId: payload.postId },
      include: { post: { include: { platforms: true } } },
    });

    if (!platformPost) {
      console.log(`[Webhook] NO MATCH postId=${payload.postId} — no matching platform post found`);
      return res.status(200).json({ received: true, matched: false });
    }

    const newStatus = payload.status === 'success' ? 'published' : 'failed';
    console.log(`[Webhook] UPDATING platformPostId=${platformPost.id} postId=${platformPost.postId} newStatus=${newStatus}`);

    await prisma.socialPostPlatform.update({
      where: { id: platformPost.id },
      data: {
        status: newStatus,
        externalPostUrl: payload.postUrl || platformPost.externalPostUrl,
        errorMessage: payload.errors?.join('; '),
      },
    });

    if (payload.errors?.length) {
      console.error(`[Webhook] PLATFORM ERRORS postId=${payload.postId}: ${payload.errors.join('; ')}`);
    }

    // Update parent post status based on all platform statuses
    const allPlatforms = await prisma.socialPostPlatform.findMany({
      where: { postId: platformPost.postId },
    });

    const allPublished = allPlatforms.every((p: { status: string }) => p.status === 'published');
    const allFailed = allPlatforms.every((p: { status: string }) => p.status === 'failed');
    const anyPublished = allPlatforms.some((p: { status: string }) => p.status === 'published');

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

    console.log(`[Webhook] POST STATUS UPDATED postId=${platformPost.postId} status=${postStatus} platforms=${allPlatforms.map((p: { status: string; id: string }) => `${p.id}:${p.status}`).join(',')}`);

    res.status(200).json({ received: true, matched: true });
  } catch (err) {
    console.error(`[Webhook] ERROR processing webhook: ${(err as Error).message}`);
    next(err);
  }
}
