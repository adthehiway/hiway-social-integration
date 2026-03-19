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
    platformOptions?: Record<string, unknown>;
  }): Promise<AyrsharePostResponse> {
    // Resolve Content Fabric redirects — Ayrshare doesn't follow 307s
    const resolvedUrls = await Promise.all(
      params.mediaUrls.map((url) => this.resolveRedirect(url))
    );

    const body: Record<string, unknown> = {
      post: params.post,
      platforms: params.platforms,
      mediaUrls: resolvedUrls,
      profileKey: params.profileKey,
      isVideo: true,
    };
    if (params.scheduledDate) body.scheduleDate = params.scheduledDate;
    if (params.autoSchedule) body.autoSchedule = true;

    // Pass through platform-specific options
    if (params.platformOptions) {
      Object.assign(body, params.platformOptions);
    }

    // Auto-generate youTubeOptions if YouTube is selected but no options provided
    if (params.platforms.includes('youtube') && !body.youTubeOptions) {
      body.youTubeOptions = {
        title: params.post.substring(0, 100),
        visibility: 'public',
      };
    }

    console.log(`[Ayrshare] POST /post`, JSON.stringify(body));
    const { data } = await this.client.post('/post', body, { timeout: 60000 });
    return data;
  }

  private async resolveRedirect(url: string): Promise<string> {
    try {
      const res = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: () => true,
        timeout: 10000,
        responseType: 'stream',
      });
      // Destroy the stream immediately — we only need the headers
      res.data.destroy();
      console.log(`[Ayrshare] resolveRedirect status=${res.status} location=${res.headers.location || 'none'}`);
      if (res.status === 307 || res.status === 302 || res.status === 301) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          console.log(`[Ayrshare] Resolved redirect → ${redirectUrl.substring(0, 80)}...`);
          return redirectUrl;
        }
      }
      return url;
    } catch (err: any) {
      console.error(`[Ayrshare] resolveRedirect failed: ${err.message}`);
      return url;
    }
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
    // Domain is the Ayrshare SSO domain, not the social platform
    const params = new URLSearchParams();
    params.append('profileKey', profileKey);
    params.append('domain', env.AYRSHARE_DOMAIN || domain);
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

  async getPostAnalytics(params: {
    id: string;
    platforms?: string[];
    profileKey: string;
  }): Promise<Record<string, unknown>> {
    const { data } = await this.client.post('/analytics/post', {
      id: params.id,
      platforms: params.platforms,
    }, {
      headers: { 'Profile-Key': params.profileKey },
    });
    return data;
  }

  async getSocialAnalytics(params: {
    platforms: string[];
    profileKey: string;
    quarters?: number;
    daily?: boolean;
  }): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = {
      platforms: params.platforms,
    };
    if (params.quarters) body.quarters = params.quarters;
    if (params.daily) body.daily = true;
    const { data } = await this.client.post('/analytics/social', body, {
      headers: { 'Profile-Key': params.profileKey },
    });
    return data;
  }

  async getPostHistory(params: {
    profileKey: string;
    lastDays?: number;
    lastRecords?: number;
  }): Promise<Record<string, unknown>> {
    const query = new URLSearchParams();
    if (params.lastDays) query.set('lastDays', String(params.lastDays));
    if (params.lastRecords) query.set('lastRecords', String(params.lastRecords));
    const { data } = await this.client.get(`/history?${query.toString()}`, {
      headers: { 'Profile-Key': params.profileKey },
    });
    return data;
  }
}

export const ayrshareService = new AyrshareService();
