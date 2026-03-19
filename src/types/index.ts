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
  youTubeOptions: z.object({
    title: z.string().max(100),
    visibility: z.enum(['public', 'unlisted', 'private']).optional(),
    tags: z.array(z.string()).optional(),
    madeForKids: z.boolean().optional(),
    shorts: z.boolean().optional(),
    categoryId: z.number().optional(),
    notifySubscribers: z.boolean().optional(),
    playListId: z.string().optional(),
    thumbNail: z.string().url().optional(),
  }).optional(),
  instagramOptions: z.object({
    stories: z.boolean().optional(),
    shareReelsFeed: z.boolean().optional(),
    thumbNail: z.string().url().optional(),
    thumbNailOffset: z.number().optional(),
    altText: z.array(z.string()).optional(),
    collaborators: z.array(z.string()).optional(),
    locationId: z.union([z.number(), z.string()]).optional(),
  }).optional(),
  faceBookOptions: z.object({
    reels: z.boolean().optional(),
    stories: z.boolean().optional(),
    title: z.string().max(255).optional(),
    thumbNail: z.string().url().optional(),
    draft: z.boolean().optional(),
    altText: z.array(z.string()).optional(),
    locationId: z.union([z.number(), z.string()]).optional(),
    link: z.string().url().optional(),
  }).optional(),
  tikTokOptions: z.object({
    visibility: z.enum(['public', 'private', 'followers', 'friends']).optional(),
    title: z.string().optional(),
    autoAddMusic: z.boolean().optional(),
    disableComments: z.boolean().optional(),
    disableDuet: z.boolean().optional(),
    disableStitch: z.boolean().optional(),
    draft: z.boolean().optional(),
    isAIGenerated: z.boolean().optional(),
    isBrandedContent: z.boolean().optional(),
    thumbNail: z.string().url().optional(),
    thumbNailOffset: z.number().optional(),
  }).optional(),
  twitterOptions: z.object({
    thread: z.boolean().optional(),
    threadNumber: z.boolean().optional(),
    longPost: z.boolean().optional(),
    longVideo: z.boolean().optional(),
    replySettings: z.enum(['following', 'mentioned', 'subscribers', 'verified']).optional(),
    altText: z.array(z.string()).optional(),
    thumbNail: z.string().url().optional(),
    quoteTweetId: z.string().optional(),
  }).optional(),
  linkedInOptions: z.object({
    visibility: z.enum(['public', 'connections', 'loggedin']).optional(),
    title: z.string().max(400).optional(),
    titles: z.array(z.string()).optional(),
    thumbNail: z.string().url().optional(),
    altText: z.array(z.string()).optional(),
    disableShare: z.boolean().optional(),
  }).optional(),
  threadsOptions: z.object({
    thread: z.boolean().optional(),
    threadNumber: z.boolean().optional(),
  }).optional(),
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
