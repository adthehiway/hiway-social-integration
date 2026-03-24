import { Request, Response, NextFunction } from 'express';
import { postsService } from '../services/posts.service';

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Posts] CREATE company=${req.companyId} platforms=${req.body.platforms?.map((p: any) => p.platform).join(',') || 'none'} requireApproval=${req.body.requireApproval || false}`);
    const post = await postsService.create(req.companyId!, req.body);
    console.log(`[Posts] CREATED id=${post.id} status=${post.status} company=${req.companyId}`);
    res.status(201).json(post);
  } catch (err) {
    console.error(`[Posts] CREATE FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await postsService.list(req.companyId!, page, limit);
    console.log(`[Posts] LIST company=${req.companyId} page=${page} limit=${limit} total=${result.total}`);
    res.json(result);
  } catch (err) {
    console.error(`[Posts] LIST FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.getById(paramId(req), req.companyId!);
    console.log(`[Posts] GET id=${paramId(req)} status=${post.status} company=${req.companyId}`);
    res.json(post);
  } catch (err) {
    console.error(`[Posts] GET FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function cancelPost(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Posts] CANCEL id=${paramId(req)} company=${req.companyId}`);
    const post = await postsService.cancel(paramId(req), req.companyId!);
    console.log(`[Posts] CANCELLED id=${paramId(req)} company=${req.companyId}`);
    res.json(post);
  } catch (err) {
    console.error(`[Posts] CANCEL FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function approvePost(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Posts] APPROVE id=${paramId(req)} company=${req.companyId} by=${req.body.approvedBy}`);
    const post = await postsService.approve(paramId(req), req.companyId!, req.body.approvedBy);
    console.log(`[Posts] APPROVED id=${paramId(req)} company=${req.companyId}`);
    res.json(post);
  } catch (err) {
    console.error(`[Posts] APPROVE FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function rejectPost(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Posts] REJECT id=${paramId(req)} company=${req.companyId} by=${req.body.rejectedBy}`);
    const post = await postsService.reject(
      paramId(req), req.companyId!, req.body.rejectedBy, req.body.rejectionNotes,
    );
    console.log(`[Posts] REJECTED id=${paramId(req)} company=${req.companyId}`);
    res.json(post);
  } catch (err) {
    console.error(`[Posts] REJECT FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function listPendingPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postsService.listPending(req.companyId!);
    console.log(`[Posts] LIST PENDING company=${req.companyId} count=${posts.length}`);
    res.json(posts);
  } catch (err) {
    console.error(`[Posts] LIST PENDING FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}
