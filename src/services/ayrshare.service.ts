import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
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
    privateKey = privateKey.replace(/\\n/g, '\n').trim();

    // Convert PKCS#8 (BEGIN PRIVATE KEY) to PKCS#1 (BEGIN RSA PRIVATE KEY) if needed
    if (privateKey.includes('BEGIN PRIVATE KEY')) {
      try {
        const keyObj = crypto.createPrivateKey(privateKey);
        privateKey = keyObj.export({ type: 'pkcs1', format: 'pem' }) as string;
        console.log(`[Ayrshare] Converted PKCS#8 → PKCS#1 (${privateKey.length} chars)`);
      } catch (e: any) {
        console.error(`[Ayrshare] Key conversion failed: ${e.message}`);
      }
    }

    console.log(`[Ayrshare] generateJWT profileKey=${profileKey} domain=${domain} keyStart=${privateKey.substring(0, 35)}...`);

    const { data } = await this.client.post('/profiles/generateJWT', {
      profileKey,
      domain,
      privateKey,
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
