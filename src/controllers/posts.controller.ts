import { Request, Response, NextFunction } from 'express';
import { postsService } from '../services/posts.service';

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.create(req.companyId!, req.body);
    res.status(201).json(post);
  } catch (err) { next(err); }
}

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await postsService.list(req.companyId!, page, limit);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.getById(paramId(req), req.companyId!);
    res.json(post);
  } catch (err) { next(err); }
}

export async function cancelPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.cancel(paramId(req), req.companyId!);
    res.json(post);
  } catch (err) { next(err); }
}

export async function approvePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.approve(paramId(req), req.companyId!, req.body.approvedBy);
    res.json(post);
  } catch (err) { next(err); }
}

export async function rejectPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.reject(
      paramId(req), req.companyId!, req.body.rejectedBy, req.body.rejectionNotes,
    );
    res.json(post);
  } catch (err) { next(err); }
}

export async function listPendingPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postsService.listPending(req.companyId!);
    res.json(posts);
  } catch (err) { next(err); }
}
