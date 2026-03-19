import { z } from 'zod';

// Request schemas
export const createPostSchema = z.object({
  mediaUrl: z.string().url(),
  platforms: z.array(z.object({
    platform: z.string().min(1),
    caption: z.string().min(1),
    hashtags: z.array(z.string()).optional().default([]),
  })).min(1),
  scheduledAt: z.string().datetime().optional(),
  autoSchedule: z.boolean().optional().default(false),
  requireApproval: z.boolean().optional().default(false),
  smartLinkUrl: z.string().url().optional(),
  includeSmartLink: z.boolean().optional().default(false),
});

export const approvePostSchema = z.object({
  approvedBy: z.string().min(1),
});

export const rejectPostSchema = z.object({
  rejectedBy: z.string().min(1),
  rejectionNotes: z.string().min(1),
});

export const createProfileSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(1),
});

export const connectAccountSchema = z.object({
  platform: z.string().min(1),
});

export const generateCaptionSchema = z.object({
  text: z.string().min(1),
  platform: z.string().optional(),
});

export const generateHashtagsSchema = z.object({
  post: z.string().min(1),
});

export const createScheduleSchema = z.object({
  name: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  times: z.array(z.string()).min(1),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type ApprovePostInput = z.infer<typeof approvePostSchema>;
export type RejectPostInput = z.infer<typeof rejectPostSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
export type GenerateCaptionInput = z.infer<typeof generateCaptionSchema>;
export type GenerateHashtagsInput = z.infer<typeof generateHashtagsSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

// Ayrshare response types
export interface AyrsharePostResponse {
  id: string;
  postIds: Array<{ platform: string; postId: string; postUrl: string }>;
  status: string;
}

export interface AyrshareProfileResponse {
  profileKey: string;
  title: string;
}

export interface AyrshareJWTResponse {
  url: string;
}

export interface AyrshareGenerateResponse {
  post: string;
  hashtags?: string[];
}

export interface AyrshareWebhookPayload {
  type: string;
  refId: string;
  postId: string;
  platform: string;
  status: string;
  postUrl?: string;
  errors?: string[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
