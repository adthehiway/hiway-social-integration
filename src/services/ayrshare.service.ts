import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import {
  AyrsharePostResponse,
  AyrshareProfileResponse,
  AyrshareJWTResponse,
  AyrshareGenerateResponse,
} from '../types';

export class AyrshareService {
  private client: AxiosInstance;

  constructor() {
    const apiKey = env.AYRSHARE_API_KEY.trim();
    this.client = axios.create({
      baseURL: env.AYRSHARE_BASE_URL,
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPost(params: {
    post: string;
    platforms: string[];
    mediaUrls: string[];
    profileKey: string;
    scheduledDate?: string;
    autoSchedule?: boolean;
  }): Promise<AyrsharePostResponse> {
    const body: Record<string, unknown> = {
      post: params.post,
      platforms: params.platforms,
      mediaUrls: params.mediaUrls,
      profileKey: params.profileKey,
    };
    if (params.scheduledDate) body.scheduleDate = params.scheduledDate;
    if (params.autoSchedule) body.autoSchedule = true;

    const { data } = await this.client.post('/post', body);
    return data;
  }

  async deletePost(postId: string, profileKey: string): Promise<void> {
    await this.client.delete('/post', { data: { id: postId, profileKey } });
  }

  async createProfile(title: string): Promise<AyrshareProfileResponse> {
    const { data } = await this.client.post('/profiles/profile', { title });
    return data;
  }

  async deleteProfile(profileKey: string): Promise<void> {
    await this.client.delete('/profiles/profile', { data: { profileKey } });
  }

  async generateJWT(profileKey: string, domain: string): Promise<AyrshareJWTResponse> {
    let privateKey = env.AYRSHARE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('AYRSHARE_PRIVATE_KEY env var is not set');
    }
    // Restore real newlines from env var
    privateKey = privateKey.replace(/\\n/g, '\n').trim();

    console.log(`[Ayrshare] generateJWT profileKey=${profileKey} domain=${domain} keyLength=${privateKey.length} keyStart=${privateKey.substring(0, 30)}...`);

    // Ayrshare expects URL-encoded form data, not JSON
    const params = new URLSearchParams();
    params.append('profileKey', profileKey);
    params.append('domain', domain);
    params.append('privateKey', privateKey);

    const { data } = await this.client.post('/profiles/generateJWT', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  }

  async getProfile(profileKey: string): Promise<Record<string, unknown>> {
    // Use /user endpoint with Profile-Key header to get profile-scoped data
    const { data } = await this.client.get('/user', {
      headers: { 'Profile-Key': profileKey },
    });
    return data;
  }

  async listProfiles(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get('/profiles');
    return data;
  }

  async unlinkSocial(profileKey: string, platform: string): Promise<void> {
    await this.client.delete('/profiles/social', {
      data: { profileKey, platform },
    });
  }

  async generateCaption(params: {
    text: string;
    platform?: string;
  }): Promise<AyrshareGenerateResponse> {
    const { data } = await this.client.post('/generate', params);
    return data;
  }

  async generateHashtags(post: string): Promise<AyrshareGenerateResponse> {
    const { data } = await this.client.post('/generate', {
      post,
      hashtags: true,
    });
    return data;
  }

  async setAutoSchedule(profileKey: string, schedule: string[]): Promise<void> {
    await this.client.post('/auto-schedule/set', {
      profileKey,
      schedule,
    });
  }

  async deleteAutoSchedule(profileKey: string): Promise<void> {
    await this.client.delete('/auto-schedule/delete', {
      data: { profileKey },
    });
  }
}

export const ayrshareService = new AyrshareService();
