# Social Clip Distribution - Scope Document

## Overview

Enable creators to clip content from the Clipping page and distribute it directly to social media channels (Twitter/X, Instagram, TikTok, LinkedIn, Facebook, YouTube Shorts). Uses a third-party social publishing aggregator to manage multi-platform posting on behalf of each user's connected social accounts.

---

## Current State

### What exists

| Capability | Status | Location |
|-----------|--------|----------|
| Clipping UI with mark in/out | Production | `dashboard/clipping/page.tsx` |
| Clip validation (> 5s) | Production | `SmartLinkModal.tsx` |
| SmartLink creation from clip | Production | `SmartLinkModal` with `clipStart`/`clipEnd` |
| `VIEW_AND_DOWNLOAD` SmartLink type | Production | `SmartLinkType` enum |
| Download endpoint | Production | `watch/download/{slug}` |
| Basic web share (navigator.share) | Production | `MediaPage.tsx` |
| OG/Twitter Card meta tags | Production | `watch/page.tsx` |
| Plausible analytics script | Production | `plausible-analytics.tsx` |

### What's missing

| Gap | Impact |
|-----|--------|
| Social OAuth connections | No user social account linking |
| Social posting API | No integration with any social platform |
| Scheduling system | No deferred post queue |
| Post history/tracking | No record of social posts |
| Video overlay/watermark tools | No text overlay, caption, or branding tools |
| Platform-specific formatting | No aspect ratio/duration adaptation |

---

## Clip Delivery: Eluvio + Ayrshare URL Passthrough (No Backend Rendering Needed)

**Key discovery:** Both Eluvio and Ayrshare support URL-based clip delivery, eliminating the need for a backend clip rendering endpoint.

### How it works

1. **Eluvio Content Fabric** supports `start` and `end` query parameters (in seconds) on playout URLs, returning only the requested segment:
   ```
   https://embed.v3.contentfabric.io/?vid={versionHash}&start=10&end=40
   ```

2. **Ayrshare** accepts external media URLs directly via the `mediaURLs` parameter on `POST /post` - no file upload needed. Ayrshare downloads the video from the URL and posts it to social platforms.

3. **Combined flow:** Construct a Content Fabric playout URL with clip boundaries, pass it to Ayrshare as `mediaURLs`. Ayrshare fetches the clip segment and distributes it.

### Requirements to confirm

- The Content Fabric playout URL must be **publicly accessible** (no auth token required, or a long-lived token embedded in the URL)
- The `start`/`end` params must work on a direct MP4 download URL (not just the embed player) - **needs testing with Eluvio**
- Ayrshare's media upload limit is **30 MB** via their upload endpoint, but external URLs may support larger files - **needs confirmation**
- If the Content Fabric URL returns an HLS/DASH stream rather than a progressive MP4, Ayrshare may not be able to consume it - **needs testing**

### Fallback: Backend clip rendering

If URL passthrough doesn't work (e.g. auth issues, format incompatibility), the fallback is:

- New endpoint: `POST /media/{id}/clip` with `{ start, end, format }`
- Backend uses Eluvio Content Fabric SDK or FFmpeg to extract the segment
- Returns a temporary public URL that Ayrshare can fetch
- The backend already has a transcoding pipeline (UPLOADING_TO_ELUVIO -> TRANSCODING -> READY), so this is a natural extension

### Overlay consideration

If the user adds text overlays, watermarks, or captions, the URL passthrough won't work alone - the video needs processing. Options:
- **Backend rendering** for overlay application (FFmpeg or similar)
- **Client-side rendering** via canvas/MediaRecorder (quality tradeoff)
- **Ayrshare overlays** - check if Ayrshare supports text/watermark on posted videos (unlikely)

---

## Architecture

```
Clipping Page                    Hiway Backend                Ayrshare
    |                                |                            |
    +--> Mark in/out (10s-40s)       |                            |
    |                                |                            |
    +--> "Share to Social" button    |                            |
    |                                |                            |
    +--> Select platforms            |                            |
    |    Write per-platform captions |                            |
    |    Set schedule (optional)     |                            |
    |                                |                            |
    +--> Submit ------------------>  POST /social/post            |
                                     |                            |
                                     +--> Build Content Fabric    |
                                     |    URL with ?start=10&end=40
                                     |                            |
                                     +--> POST /post ------------>|
                                     |    { mediaURLs: [url] }    |
                                     |                            +--> Fetch clip from Eluvio
                                     |                            +--> Post to Twitter/X
                                     |                            +--> Post to Instagram
                                     |                            +--> Post to TikTok
                                     |                            +--> Post to LinkedIn
                                     |                            +--> Post to Facebook
                                     |                            +--> Post to YouTube
                                     |                            |
                                     |<-- Webhook: post status ---|
                                     |                            |
                                     +--> Update post record      |
                                     +--> Fire Plausible event    |
```

---

## Social Publishing Aggregator

### Recommendation: Ayrshare

Ayrshare is purpose-built for embedding social publishing into SaaS platforms. It's the only mature aggregator offering a true multi-tenant reseller API.

### Why Ayrshare

| Requirement | Ayrshare |
|------------|----------|
| White-label OAuth (users link their own accounts) | Yes |
| Video upload + posting | Yes (all 6 platforms) |
| Scheduling | Yes |
| Post-level analytics | Yes |
| Webhook callbacks | Yes |
| Multi-tenant user profiles | Yes (Business Plan) |
| Platform coverage | 13+ platforms including all 6 required |

### Pricing

| Plan | Cost | Capacity |
|------|------|----------|
| Premium | $149/mo | 1,000 posts/mo, single user, video support |
| Business | $499/mo | Multi-tenant, white-label OAuth, volume discounts per profile |
| Enterprise | Custom | Higher volumes, deeper discounts |

**Business model:** Roll the Ayrshare cost into a "Social Distribution" subscription tier or add-on. Users get 3 connected social channels included, additional channels at extra cost.

### Alternative: Late (getlate.dev)

- Similar capabilities, newer company
- $299/mo for unlimited posts (Enterprise tier)
- White-label OAuth, all 6 platforms
- Worth evaluating if Ayrshare pricing is too steep
- Less established, smaller community

### Not recommended

| Service | Reason |
|---------|--------|
| Buffer | No multi-tenant API, no TikTok, API in beta |
| Hootsuite | API is for plugins INTO Hootsuite, not embedding. $739+/mo |
| Publer | No white-label/reseller model |
| SocialBee | No developer API |

---

## Platform Requirements

### Video specifications per platform

| Platform | Max Duration | Max File Size | Aspect Ratio | Format | API Daily Limit |
|----------|-------------|---------------|--------------|--------|----------------|
| **TikTok** | 10 min | 1 GB (API) | 9:16 (preferred) | MP4 | Not published |
| **Instagram Reels** | 15 min | 4 GB | 9:16 | MP4, MOV | 100 posts/24h (all types) |
| **YouTube Shorts** | 60 sec | 256 GB | 9:16 | MP4 | Standard quota |
| **Facebook Reels** | 3 min | 1 GB | 9:16 | MP4 | 25 posts/page/24h |
| **LinkedIn** | 15 min | 5 GB | 16:9, 1:1, 9:16 | MP4 | ~100/day |
| **Twitter/X** | 2m20s (free), 4h (Premium) | 512 MB | 16:9, 1:1 | MP4 | Varies by API tier |

### Caption/character limits

| Platform | Character Limit | Hashtag Notes |
|----------|----------------|---------------|
| TikTok | 2,200 | Hashtags count toward limit |
| Instagram | 2,200 | 30 hashtags max |
| YouTube Shorts | 100 (title) | Description: 5,000 |
| Facebook | 63,206 | No practical limit |
| LinkedIn | 3,000 | 3-5 hashtags recommended |
| Twitter/X | 280 | Hashtags count toward limit |

### Suggested clip presets

| Preset | Duration | Use Case |
|--------|----------|----------|
| Teaser | 15 sec | Quick hook, works everywhere |
| Short | 30 sec | Standard short-form, all platforms |
| Standard | 60 sec | YouTube Shorts max, works on all |
| Extended | 3 min | LinkedIn, Instagram, Facebook |
| Full | Custom | Twitter Premium, TikTok, Instagram |

---

## User Flow

### 1. Connect social accounts (one-time setup via Ayrshare)

Ayrshare handles all OAuth complexity. Users never create an Ayrshare account - it's fully white-labeled behind Hiway's UI.

#### Backend setup (one-time)

```
1. POST /profiles (Ayrshare API)
   - Create an Ayrshare User Profile for each Hiway company
   - Returns a profileKey - store this against the company in our DB
   - This profile is the container for all of that company's social accounts

2. Store mapping: companyId <-> ayrshareProfileKey
```

#### User flow: Connecting a social account

```
Dashboard Settings -> Social Accounts page
    |
    +--> User sees connected accounts list (or empty state)
    |
    +--> Clicks "Connect Social Account" button
    |
    v
Frontend calls: POST /api/social/connect (Hiway API route)
    |
    +--> Backend calls Ayrshare: POST /generateJWT
    |    { profileKey: company.ayrshareProfileKey }
    |    Returns: { url: "https://app.ayrshare.com/social-accounts?jwt=..." }
    |
    +--> Returns the JWT URL to frontend
    |
    v
Frontend opens URL in new browser tab/popup
    |
    +--> User sees Ayrshare's white-labeled social linking page
    |    (branded, no Ayrshare logo - shows available platforms)
    |
    +--> User clicks platform icons to connect:
    |    Twitter -> Twitter OAuth screen -> Authorize -> Done
    |    Instagram -> Instagram OAuth screen -> Authorize -> Done
    |    TikTok -> TikTok OAuth screen -> Authorize -> Done
    |    etc.
    |
    +--> User clicks "All Done" button
    |
    v
Browser tab closes / redirects back to Hiway
    |
    +--> Frontend polls or refetches: GET /api/social/accounts
    |    (calls Ayrshare GET /profiles/{profileKey} to list linked accounts)
    |
    +--> Social accounts list updates with newly connected platforms
    |
    +--> Each connected account shows:
    |    - Platform icon + name
    |    - @username or page name
    |    - Connected date
    |    - "Disconnect" button
    |
    +--> 3 channels included in subscription
    |    Additional channels: extra fee per channel
```

#### UI: Social Accounts Settings Page

```
app/(web)/(protected)/dashboard/settings/social/page.tsx

+------------------------------------------------------------------+
|  Social Accounts                                                  |
|                                                                   |
|  Connect your social media accounts to distribute clips           |
|  directly from Hiway.                                             |
|                                                                   |
|  Connected Accounts (2 of 3 included)                             |
|  +------------------------------------------------------------+  |
|  | [Twitter icon]  @winstonbaker         Connected Mar 2026    |  |
|  |                                              [Disconnect]   |  |
|  +------------------------------------------------------------+  |
|  | [Instagram icon] winstonbaker_films   Connected Mar 2026    |  |
|  |                                              [Disconnect]   |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  [ + Connect Social Account ]                                     |
|                                                                   |
|  Available: TikTok, LinkedIn, Facebook, YouTube                   |
|                                                                   |
|  Need more than 3 channels? Upgrade to Social Pro.                |
+------------------------------------------------------------------+
```

#### Controlling available platforms

Ayrshare lets you control which social networks are available per profile or globally. Use this to:
- Restrict to the 6 supported platforms (Twitter, Instagram, TikTok, LinkedIn, Facebook, YouTube)
- Gate premium platforms behind subscription tiers if needed

### 2. Create clip and distribute

```
Clipping Page
    |
    +--> Select media content
    |
    +--> Mark in/out points (existing flow)
    |
    +--> Click "Share to Social" (new button alongside "Create SmartLink")
    |
    v
Social Distribution Modal (new - 5 step wizard)
    |
    +--> Step 1: Preview & Media Preparation
    |    - Video preview with clip boundaries
    |    - [AI] "Auto-Transcribe" button → Ayrshare POST /generate/transcribe
    |      Returns transcript segments + auto-generated title
    |    - Toggle "Burn-in captions" using transcript (overlay on video)
    |    - Add text overlay (position, font, color)
    |    - Add watermark via Ayrshare POST /media/resize (company logo, position)
    |    - [AI] Auto-resize thumbnails per platform via Ayrshare
    |    - [AI] Auto-generate alt text for thumbnail via POST /generate/alt-text
    |    - Select output aspect ratio (9:16, 16:9, 1:1)
    |
    +--> Step 2: Select Platforms & Scheduling
    |    - Toggle connected platforms on/off
    |    - Duration warnings (e.g. "Clip is 2:30 - exceeds Twitter free limit")
    |    - Platform-specific previews (aspect ratio, caption length)
    |    - Schedule options:
    |      a) "Post now"
    |      b) "Schedule for..." (date/time picker)
    |      c) "Add to auto-schedule queue" (next available slot)
    |    - Named schedule selector (e.g. "Weekday Morning", "Weekend")
    |
    +--> Step 3: Captions & AI Assist
    |    - Per-platform caption editors with character counters
    |    - [AI] "Generate Caption" button → Ayrshare POST /generate
    |      Uses video title + description as prompt, generates platform-appropriate caption
    |    - [AI] "Rewrite for {platform}" → Ayrshare POST /generate (rewrite mode)
    |      Adapts tone and length per platform automatically
    |    - [AI] "Auto Hashtags" → Ayrshare auto-hashtag (1-10, configurable)
    |    - [AI] "Translate" dropdown → Ayrshare POST /generate/translate (100+ languages)
    |    - [AI] Sentiment check → Ayrshare POST /generate/sentiment
    |      Shows sentiment indicator (positive/neutral/negative) with suggestions
    |    - Optional: include SmartLink URL (auto-shortened via Ayrshare /links)
    |      Auto-appends UTM params: ?utm_source={platform}&utm_medium=social
    |    - Caption template picker (saved templates with {title}, {creator}, {smartlink_url})
    |    - "First comment" field (LinkedIn, Facebook, Twitter - posted as first reply)
    |
    +--> Step 4: Review & Submit for Approval
    |    - Summary of all platforms, captions, schedule, AI features used
    |    - Sentiment indicator per caption
    |    - "Submit for Approval" button (sends to approver)
    |    - Approver receives notification
    |    - Approver reviews and approves/rejects with optional notes
    |    - On approval: post is published or scheduled or queued
    |    - On rejection: creator notified with feedback, can edit and resubmit
    |    - Option to auto-repost (1-10 times at 2+ day intervals)
    |
    v
POST /api/social/post (Next.js API route)
    |
    +--> Validate user has connected accounts
    +--> Build Content Fabric URL with ?start={clipStart}&end={clipEnd}
    +--> Shorten SmartLink URL via Ayrshare /links (if included in caption)
    +--> POST to Ayrshare /post with:
    |    { mediaURLs: [fabricUrl], platforms, post, schedule/autoSchedule,
    |      shortenLinks: true, autoHashtag: { num, position },
    |      autoRepost: { num, interval } }
    +--> Save post record to database
    +--> Return post IDs
```

### 3. SmartLink + Social combo flow

```
Clipping Page
    |
    +--> Mark in/out points
    |
    +--> Click "Create SmartLink & Share" (combined action)
    |
    +--> SmartLink creation modal (existing, with clipStart/clipEnd)
    |    Type: VIEW_AND_DOWNLOAD (auto-selected for social distribution)
    |
    +--> On SmartLink created -> Social Distribution Modal opens
    |    SmartLink URL pre-filled in caption template
    |    UTM params auto-appended: ?utm_source={platform}&utm_medium=social&utm_campaign=clip
    |
    +--> Complete social posting flow
```

---

## Data Model

### Social Account (stored in backend)

```typescript
interface ISocialAccount {
  id: string;
  companyId: string;
  platform: SocialPlatform;
  accountName: string;        // @username or page name
  profileImageUrl?: string;
  ayrshareProfileKey: string; // Ayrshare user profile reference
  connectedAt: string;
  isActive: boolean;
}

enum SocialPlatform {
  TWITTER = "TWITTER",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  LINKEDIN = "LINKEDIN",
  FACEBOOK = "FACEBOOK",
  YOUTUBE = "YOUTUBE",
}
```

### Social Post (stored in backend)

```typescript
interface ISocialPost {
  id: string;
  companyId: string;
  smartlinkId?: string;       // Optional link to SmartLink
  mediaId: string;            // Source media
  clipStart: number;
  clipEnd: number;
  platforms: SocialPostPlatform[];
  status: SocialPostStatus;
  scheduledAt?: string;       // null = immediate
  publishedAt?: string;
  createdAt: string;
  overlay?: VideoOverlay;
  approval?: SocialPostApproval;
}

interface SocialPostPlatform {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  externalPostId?: string;    // Ayrshare/platform post ID
  externalPostUrl?: string;   // Direct link to post on platform
  status: "pending" | "published" | "failed" | "scheduled";
  errorMessage?: string;
  analytics?: SocialPostAnalytics;
}

interface SocialPostAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;             // Link clicks (if SmartLink URL included)
  lastSyncedAt: string;
}

enum SocialPostStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SCHEDULED = "SCHEDULED",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED",
  PARTIAL = "PARTIAL",        // Some platforms succeeded, some failed
  FAILED = "FAILED",
}

interface SocialPostApproval {
  approvedBy?: string;        // userId of approver
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionNotes?: string;    // Feedback for creator to revise
}

interface CaptionTemplate {
  id: string;
  companyId: string;
  name: string;               // e.g. "New Release Promo"
  template: string;           // e.g. "Check out {title} by {creator}! Watch now: {smartlink_url}"
  hashtags: string[];         // Default hashtags
  platforms: SocialPlatform[]; // Which platforms this template targets
}

interface VideoOverlay {
  text?: { content: string; position: string; font: string; color: string; size: number };
  watermark?: { imageUrl: string; position: string; opacity: number };
  captions?: { enabled: boolean; style: string };
}
```

---

## API Endpoints (Backend)

### Social accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/social/accounts` | List connected social accounts (proxies Ayrshare GET /profiles/{profileKey}) |
| POST | `/social/accounts/connect` | Calls Ayrshare POST /generateJWT, returns the white-label linking URL |
| DELETE | `/social/accounts/{platform}` | Disconnect a platform (proxies Ayrshare DELETE /profiles/{profileKey}/social/{platform}) |
| GET | `/social/accounts/limit` | Check account limit (3 free + paid extras) |
| POST | `/social/accounts/profile` | Create Ayrshare profile for company (called once on first social setup) |

### Social posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/posts` | Create and publish/schedule a social post |
| GET | `/social/posts` | List post history (paginated) |
| GET | `/social/posts/{id}` | Get post details + per-platform status |
| DELETE | `/social/posts/{id}` | Cancel a scheduled post |
| POST | `/social/posts/{id}/approve` | Approve a pending post (triggers publish/schedule) |
| POST | `/social/posts/{id}/reject` | Reject a pending post with notes |
| GET | `/social/posts/pending` | List posts awaiting approval |
| GET | `/social/posts/{id}/analytics` | Get post performance metrics (proxies Ayrshare analytics) |

### Comments / Social Inbox

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/social/comments` | List all comments across all posts (proxies Ayrshare GET /comments) |
| GET | `/social/posts/{id}/comments` | Get comments for a specific post |
| POST | `/social/posts/{id}/comments` | Reply to a comment |
| DELETE | `/social/comments/{commentId}` | Delete a comment (moderation) |
| POST | `/social/posts/{id}/comments/disable` | Disable comments on a post (Instagram, LinkedIn, TikTok) |

### AI / Generation (proxies Ayrshare MaxPack)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/ai/generate-caption` | AI-generate a caption from prompt/title (Ayrshare POST /generate) |
| POST | `/social/ai/rewrite` | Rewrite a caption for a different platform/tone |
| POST | `/social/ai/transcribe` | Transcribe video audio → text segments + title |
| POST | `/social/ai/translate` | Translate caption to another language (100+ languages) |
| POST | `/social/ai/sentiment` | Analyze sentiment of a caption (positive/neutral/negative) |
| POST | `/social/ai/alt-text` | Generate alt text for an image |
| POST | `/social/ai/hashtags` | Generate relevant hashtags (1-10) |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/social/analytics/posts` | Aggregated post analytics across all platforms |
| GET | `/social/analytics/posts/{id}` | Per-post analytics (views, likes, shares, comments) |
| GET | `/social/analytics/account` | Account-level analytics (followers, growth, demographics) |
| GET | `/social/analytics/links` | Link click analytics for shortened URLs |

### Auto-Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/schedules` | Create a named auto-schedule (days + times) |
| GET | `/social/schedules` | List all auto-schedules |
| PUT | `/social/schedules/{id}` | Update a schedule |
| DELETE | `/social/schedules/{id}` | Delete a schedule |

### Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/links/shorten` | Shorten a URL with analytics tracking (Ayrshare /links) |
| GET | `/social/links` | List shortened links with click analytics |

### Media Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/media/resize` | Resize image for platform + add watermark (Ayrshare /media/resize) |
| POST | `/social/media/upload` | Upload media to Ayrshare for transcription/processing |

### Clip URL construction

> **Important finding:** Content Fabric playout URLs with `?start=X&end=Y` return **HLS/DASH streaming manifests**, not MP4 files. Ayrshare `mediaURLs` requires a direct video file URL, not a manifest.

**Solution: Use Eluvio File Service API** (returns actual MP4)

```
POST /call/media/files
  { format: "mp4", offering: "default", start: 10.5, end: 45.0 }
→ Returns job_id

GET /call/media/files/{job_id}
→ Poll until status: "complete"

GET /call/media/files/{job_id}/download
→ Returns MP4 file (can be passed to Ayrshare mediaURLs)
```

The backend must:
1. Call Eluvio File Service with `format=mp4`, `start`, `end` to extract the clip as MP4
2. Wait for the job to complete (async, poll status)
3. Pass the resulting MP4 download URL to Ayrshare as `mediaURLs`

If the download URL requires auth and is short-lived, fallback to **Option B**: download the MP4 from Eluvio and re-upload to Ayrshare via `POST /media/upload` (30 MB max).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/clips/prepare` | Initiate Eluvio File Service MP4 extraction for a clip |
| GET | `/social/clips/{jobId}/status` | Poll clip extraction progress |

### Clip rendering (only needed for text overlays)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/{id}/clip` | Render a clip with text overlays to MP4 (Ayrshare handles watermark/resize) |
| GET | `/media/{id}/clip/{clipId}/status` | Check render progress |

### Webhook (Ayrshare -> Hiway backend)

| Trigger | Payload |
|---------|---------|
| Post published | `{ postId, platform, externalPostId, status }` |
| Post failed | `{ postId, platform, error }` |
| Comment received | `{ postId, platform, commentId, text, author }` |

---

## Frontend Implementation

### New files

| File | Purpose |
|------|---------|
| **Services & Data** | |
| `services/social.ts` | Social accounts, posts, comments, analytics, AI, schedules, links API service |
| `hooks/useSocial.ts` | TanStack Query hooks for all social endpoints |
| `types/social.ts` | Social-specific TypeScript types (posts, comments, analytics, schedules, AI responses) |
| **Pages** | |
| `app/(web)/(protected)/dashboard/social/page.tsx` | Social hub page (tabs: Posts, Inbox, Analytics, Schedules) |
| `app/(web)/(protected)/dashboard/social/post/[id]/page.tsx` | Post detail page with per-post analytics |
| `app/(web)/(protected)/dashboard/settings/social/page.tsx` | Social accounts settings page (connect/disconnect) |
| **Post Creation** | |
| `components/dashboard/social/SocialDistributionModal.tsx` | 5-step post creation wizard (select platforms → caption → AI assist → schedule → review/approve) |
| `components/dashboard/social/PlatformSelector.tsx` | Platform toggle with format warnings and account status |
| `components/dashboard/social/CaptionEditor.tsx` | Per-platform caption editor with char counter, hashtag suggestions, link shortening |
| `components/dashboard/social/VideoOverlayEditor.tsx` | Text overlay, watermark, burnt-in caption UI |
| **AI Assist** | |
| `components/dashboard/social/AICaptionAssist.tsx` | AI caption generation, rewriting per platform, tone adjustment |
| `components/dashboard/social/TranscriptViewer.tsx` | Video transcription display with segment timestamps |
| `components/dashboard/social/TranslationPanel.tsx` | Caption translation (100+ languages) with preview |
| `components/dashboard/social/SentimentIndicator.tsx` | Caption sentiment badge (positive/neutral/negative) with warning on negative |
| **Social Inbox** | |
| `components/dashboard/social/SocialInbox.tsx` | Unified comment inbox across all platforms |
| `components/dashboard/social/CommentThread.tsx` | Comment thread with reply, delete, sentiment indicators |
| **Scheduling** | |
| `components/dashboard/social/ScheduleManager.tsx` | Create/edit named auto-schedules (days + time slots) |
| `components/dashboard/social/SchedulePicker.tsx` | Choose manual date/time or auto-schedule queue in post modal |
| **Analytics** | |
| `components/dashboard/social/PostAnalytics.tsx` | Per-post performance metrics (views, likes, shares, comments) |
| `components/dashboard/social/AccountAnalytics.tsx` | Account-level analytics (followers, growth, demographics per platform) |
| `components/dashboard/social/LinkAnalytics.tsx` | Shortened link click analytics |
| `components/dashboard/social/SocialAnalyticsDashboard.tsx` | Combined analytics overview (posts + accounts + funnels) |
| **Accounts** | |
| `components/dashboard/social/SocialAccountsManager.tsx` | Connect/disconnect accounts via Ayrshare JWT OAuth flow |
| **Post Management** | |
| `components/dashboard/social/SocialPostHistory.tsx` | Post history list with status, filters, bulk actions |

### Modified files

| File | Change |
|------|--------|
| `app/(web)/(protected)/dashboard/clipping/page.tsx` | Add "Share to Social" and "Create SmartLink & Share" buttons |
| `config/dashboard/navigation.ts` | Add Social Distribution nav item with sub-items (Posts, Inbox, Analytics, Schedules) |
| `config/dashboard/analytics.ts` | Add social distribution section to analytics config |
| `components/dashboard/tour/tour-steps.ts` | Add tours for social hub, inbox, and analytics pages |
| `components/dashboard/analytics/sections/TrafficSources.tsx` | Add social post click-through attribution from UTM data |
| `middleware.ts` | Add social webhook route bypass (Ayrshare callbacks) |

### Clipping page changes

```typescript
// New button next to existing "Create SmartLink" button
<Button onClick={() => setShowSocialModal(true)} disabled={!isValidClip}>
  <Share2 className="h-4 w-4 mr-2" />
  Share to Social
</Button>

// Combined action
<Button onClick={() => setShowCombinedModal(true)} disabled={!isValidClip}>
  <Zap className="h-4 w-4 mr-2" />
  Create SmartLink & Share
</Button>
```

---

## Analytics & Tracking

### Plausible integration

Plausible tracks **inbound** traffic - visitors coming to your SmartLinks. It won't track social post performance directly (views, likes on Twitter, etc.). However, it plays a key role in **closing the attribution loop**:

| What Plausible tracks | How |
|----------------------|-----|
| Clicks from social posts to SmartLinks | UTM params auto-appended to SmartLink URLs in captions |
| Which platform drives most SmartLink views | `utm_source=twitter`, `utm_source=instagram`, etc. |
| Campaign performance | `utm_campaign=clip-{postId}` |
| Conversion from social click to video view | SmartLink Landing -> SmartLink Play funnel |

### UTM auto-generation

When a SmartLink URL is included in a social post caption, auto-append:

```
https://onthehiway.com/{slug}?utm_source={platform}&utm_medium=social&utm_campaign=clip-{postId}
```

This feeds directly into the Plausible integration (see `docs/PLAUSIBLE_INTEGRATION.md`), populating the Traffic Sources dashboard with per-platform breakdown.

### Social post analytics (via Ayrshare)

Ayrshare provides post-level analytics that we pull back into the dashboard:

| Metric | Source | Sync frequency |
|--------|--------|----------------|
| Views/impressions | Ayrshare API | Every 6 hours |
| Likes/reactions | Ayrshare API | Every 6 hours |
| Comments | Ayrshare API | Every 6 hours |
| Shares/retweets | Ayrshare API | Every 6 hours |
| Link clicks | Plausible (UTM) | Real-time |
| Video views on SmartLink | Plausible + internal analytics | Real-time |

### Combined dashboard view

```
Social Distribution Analytics
    |
    +--> Total posts: 47
    +--> Total reach: 12,400
    +--> Total engagement: 890
    |
    +--> Per-platform breakdown
    |    Twitter:   12 posts, 3,200 reach, 245 engagement
    |    Instagram: 10 posts, 4,100 reach, 310 engagement
    |    TikTok:    8 posts, 3,800 reach, 220 engagement
    |    LinkedIn:  7 posts, 800 reach, 65 engagement
    |    Facebook:  6 posts, 400 reach, 35 engagement
    |    YouTube:   4 posts, 100 reach, 15 engagement
    |
    +--> Click-through to SmartLinks (Plausible)
    |    Twitter -> SmartLink views: 89
    |    Instagram -> SmartLink views: 124
    |    ...
    |
    +--> Top performing posts (sortable by reach, engagement, clicks)
```

---

## Pricing & Monetization

### Social Distribution subscription tier

| Feature | Free | Social Starter | Social Pro |
|---------|------|---------------|------------|
| Connected channels | 0 | 3 | 10 |
| Posts per month | 0 | 50 | Unlimited |
| Scheduling | No | Yes | Yes |
| Video overlays | No | Basic (text) | Full (text, watermark, captions) |
| Analytics | No | Basic (post status) | Full (engagement, click-through) |
| Additional channels | N/A | Per-channel fee | Per-channel fee |
| Price | Included | Add-on TBD | Add-on TBD |

### Cost structure

- **Ayrshare Business Plan:** $499/mo base (covers multi-tenant infrastructure)
- **Per-profile cost:** Decreases with volume (Ayrshare volume discounts)
- **Margin:** Price the add-on to cover Ayrshare costs + margin
- **Additional channels:** Extra fee per channel beyond included 3

---

## Implementation Phases

### Phase 1: Foundation

**Goal:** Basic single-platform posting via Eluvio URL passthrough + Ayrshare

1. Backend: Ayrshare profile management (create profile per company, store profileKey)
2. Backend: Social endpoints (connect via JWT, list accounts, post via Ayrshare, webhook handler)
3. Backend: Eluvio File Service integration (MP4 extraction with start/end times, async job polling)
4. Frontend: Social accounts settings page (connect/disconnect via Ayrshare JWT flow)
5. Frontend: Basic "Share to Social" from clipping page (single platform, no overlays)
6. **Test:** Confirm Eluvio File Service MP4 download URL works with Ayrshare `mediaURLs` (or validate upload fallback)

**Estimate:** 2-3 weeks

### Phase 2: Multi-platform + scheduling

**Goal:** Full multi-platform posting with scheduling

1. Frontend: SocialDistributionModal (4-step wizard)
2. Frontend: Per-platform caption editors with character limits
3. Frontend: Schedule picker
4. Frontend: Post history page
5. Backend: Scheduled post queue + webhook handling
6. Backend: Post status tracking

**Estimate:** 2-3 weeks

### Phase 3: Overlays + SmartLink combo

**Goal:** Video overlays and combined SmartLink + social flow

1. Frontend: VideoOverlayEditor (text overlay, watermark, captions)
2. Backend: Overlay rendering (apply overlays to clip before posting)
3. Frontend: "Create SmartLink & Share" combined flow
4. Frontend: UTM auto-generation for SmartLink URLs in captions
5. Plausible: Wire UTM tracking into Traffic Sources dashboard

**Estimate:** 2-3 weeks

### Phase 4: Analytics + monetization

**Goal:** Post performance tracking and subscription gating

1. Backend: Ayrshare analytics sync (cron job, every 6 hours)
2. Frontend: Social analytics dashboard section
3. Frontend: Per-post analytics detail view
4. Backend: Channel limit enforcement (3 free + paid extras)
5. Frontend: Upgrade prompts when hitting channel/post limits

**Estimate:** 2 weeks

---

## Open Questions

### Resolved

1. **Clip rendering** - Resolved. Eluvio playout URLs with `?start=X&end=Y` return HLS/DASH manifests (not MP4). Use the **Eluvio File Service API** (`POST /call/media/files` with `format=mp4`, `start`, `end`) to extract clips as MP4 files, then pass to Ayrshare. This is an async job (initiate → poll → download).
2. **Auto-captions** - Resolved. Will use Ayrshare's API for auto-caption generation on social posts.
3. **Content approval** - Resolved. Yes - an approval workflow is required before posts go live. Teams will need a review/approve step in the posting flow.
4. **Template system** - Resolved. Yes - will offer reusable caption templates with variables (e.g. `{title}`, `{creator}`, `{smartlink_url}`).

### Open

1. ~~**Eluvio URL passthrough test**~~ - Resolved. Playout URLs return HLS/DASH, not MP4. Using Eluvio File Service API instead (`POST /call/media/files` with `format=mp4`, `start`, `end`). See Clip URL construction section above.
2. **Eluvio File Service auth** - Does the MP4 download URL from File Service require auth? If it's a short-lived signed URL, it should work if Ayrshare fetches it quickly. If it requires a bearer token, we need to download and re-upload via Ayrshare `POST /media/upload`. **Needs testing.**
3. **Ayrshare file size** - Upload endpoint is 30 MB max. External URL (`mediaURLs`) limit unclear - need to confirm with Ayrshare for video clips. For short clips (30-60s) MP4 should be well under 30 MB.
4. **Aspect ratio conversion** - Source content is likely 16:9. Social prefers 9:16. Open question on whether to offer auto-crop/letterbox/blur-fill options. Would require server-side processing.
5. **Ayrshare contract** - Need to evaluate Business Plan pricing with expected user volume for cost modeling.

---

## Full Ayrshare Capability Map

Beyond basic posting, Ayrshare offers a rich set of APIs that we can integrate into the Hiway platform. Below is the full inventory of capabilities, how they map to Hiway features, and implementation priority.

### Core APIs (included in Business Plan)

#### 1. Comments Management
**Endpoint:** `POST/GET /api/comments/:id`
**Platforms:** Bluesky, Facebook Pages, Instagram, LinkedIn, Reddit, Threads, TikTok, Twitter/X, YouTube

| Capability | Description | Hiway Feature |
|-----------|-------------|---------------|
| Get comments | Retrieve all comments on a post | Social inbox - see all engagement in one place |
| Post comments | Reply to comments from Hiway dashboard | Respond to audience without leaving the platform |
| Delete comments | Remove spam/inappropriate comments | Moderation tools |
| Disable comments | Turn off comments on a post (Instagram, LinkedIn, TikTok) | Content protection for sensitive screener content |

**Hiway integration:** Build a "Social Inbox" within the dashboard where creators can see and respond to all comments across all platforms on their distributed clips. This is a major value-add - creators currently have to check each platform individually.

#### 2. Post Analytics
**Endpoint:** `GET /api/analytics/post`
**Platforms:** Bluesky, Facebook, Instagram, LinkedIn, Pinterest, Reddit, Snapchat, Threads, TikTok, YouTube, Twitter/X

| Metric | Description |
|--------|-------------|
| Video views | Total views on video posts |
| Likes/reactions | Engagement count |
| Shares/reposts | Virality metric |
| Comments | Engagement depth |
| Impressions | Total times shown in feeds |
| Link clicks | Click-through to SmartLinks |

**Hiway integration:** Already planned for Phase 4. Pull post-level metrics into the Social Distribution analytics section. Combine with Plausible click-through data for full funnel: Social post impressions → clicks → SmartLink views → purchases.

#### 3. Social/Account Analytics
**Endpoint:** `GET /api/analytics/social`
**Platforms:** Facebook, Google Business Profile, Instagram, LinkedIn, Pinterest, Reddit, Snapchat, Threads, TikTok, YouTube, Twitter/X

| Metric | Description |
|--------|-------------|
| Follower count | Total followers per platform |
| Follower growth | Change over time |
| Demographics | Audience age, gender, location |
| Account impressions | Overall reach |
| Engagement rate | Account-level engagement |

**Hiway integration:** "Audience Overview" section in Social analytics - show creators how their social following is growing across all connected platforms. Track correlation between clip distribution and follower growth.

#### 4. Auto-Schedule
**Endpoint:** `POST /api/post` with `schedule: true`
**How it works:** Pre-define posting schedules (e.g. Mon/Wed/Fri at 9am and 5pm). Posts are automatically queued to the next available slot.

| Feature | Description |
|---------|-------------|
| Named schedules | Multiple schedules (e.g. "Weekday Morning", "Weekend") |
| Auto-queue | Posts fill the next available slot automatically |
| Sequential filling | No gaps - new posts always take the next slot |

**Hiway integration:** "Set it and forget it" mode for creators. Clip content → add to auto-schedule queue → Ayrshare distributes at optimal times. Could offer AI-suggested posting times based on audience analytics.

#### 5. Link Shortener with Analytics
**Endpoint:** `POST/GET /api/links`
**Requires:** MaxPack add-on

| Feature | Description |
|---------|-------------|
| URL shortening | Clean links for social captions |
| Click analytics | Track clicks per shortened link |
| Custom domains | Brand links with company domain (Business plan) |

**Hiway integration:** Auto-shorten SmartLink URLs in social captions. Track clicks independently of Plausible. Custom domain links (e.g. `hiway.link/slug`) for premium tiers.

#### 6. Approval Workflows
**Endpoint:** Built into `POST /api/post`

Already confirmed as a requirement. Ayrshare natively supports approval workflows for multi-stakeholder content review before publication. No custom implementation needed.

---

### MaxPack AI Tools (add-on)

MaxPack provides AI-powered content tools. Token allocation: Premium 50K/mo, Business 300K/mo.

#### 7. AI Text Generation
**Endpoint:** `POST /api/generate`

| Feature | Description | Hiway Feature |
|---------|-------------|---------------|
| Generate captions | AI-written social captions from a prompt | "Write caption for me" button in Social Distribution Modal |
| Rewrite posts | Rephrase existing text in different tones | Adapt captions per platform automatically |
| Auto hashtags | Generate 1-10 relevant hashtags | Hashtag suggestions in caption editor |

**Hiway integration:** In the Social Distribution Modal, add an "AI Assist" button that generates captions from the video title/description. Offer "Rewrite for {platform}" to adapt tone and length per platform automatically.

#### 8. Video Transcription
**Endpoint:** `POST /api/generate/transcribe`
**Limits:** 500GB max file size, 10 min max duration

| Feature | Description | Hiway Feature |
|---------|-------------|---------------|
| Full transcript | Text transcription of video audio | Auto-generate captions/subtitles for clips |
| Segmented transcript | Broken into logical phrases | Could map to SRT-style caption segments |
| Auto title | AI-generated video title | Suggest titles for social posts |

**Hiway integration:** This is the **auto-captioning feature** you asked about. Flow: Upload clip to Ayrshare → transcribe → use transcript to generate social captions or as burnt-in subtitles. Note: video must be hosted on Ayrshare first, so this fits naturally into the posting flow. Transcript segments could also be used to generate quote snippets for text-only posts.

#### 9. Post Translation
**Endpoint:** `POST /api/generate/translate`
**Languages:** 100+ supported

**Hiway integration:** "Translate caption" button in the Social Distribution Modal. Creators distributing content internationally can auto-translate captions per market. Huge value for film/media companies with global audiences.

#### 10. Sentiment Analysis
**Endpoint:** `POST /api/generate/sentiment`

**Hiway integration:** Analyze captions before posting - flag potentially negative or controversial wording. Could also analyze incoming comments in the Social Inbox to prioritize responses (positive vs negative sentiment).

#### 11. AI Alt Text Generation
**Endpoint:** `POST /api/generate/alt-text`

**Hiway integration:** Auto-generate alt text for thumbnail images posted to social. Improves accessibility and SEO. Runs automatically when a post includes an image.

#### 12. Image Resizing & Watermarking
**Endpoint:** `POST /api/media/resize`

| Feature | Description |
|---------|-------------|
| Platform-optimized resize | Auto-resize images for each social platform |
| Watermark | Add company logo/watermark to images |
| Background modification | Change image backgrounds |

**Hiway integration:** Auto-resize thumbnail images per platform. Add company watermark to clip thumbnails. This partially addresses the overlay requirement without needing backend rendering.

---

### Feature Priority for Hiway Platform

| Priority | Feature | Value to Creators | Effort |
|----------|---------|-------------------|--------|
| P1 | AI Caption Generation | Write captions in seconds | Low (API call) |
| P1 | Video Transcription / Auto-captions | Auto-generate subtitles for clips | Low (API call) |
| P1 | Post Analytics in dashboard | See all social performance in one place | Medium (UI + sync) |
| P1 | Auto-Schedule | Queue clips for optimal posting times | Low (API param) |
| P2 | Social Inbox (Comments) | Manage all comments from one place | Medium (new UI) |
| P2 | Account Analytics (followers, growth) | Track audience growth across platforms | Medium (UI + sync) |
| P2 | Post Translation (100+ languages) | Reach global audiences | Low (API call) |
| P2 | Link Shortener with analytics | Clean branded links with tracking | Low (API call) |
| P3 | Sentiment Analysis | Flag risky content before posting | Low (API call) |
| P3 | AI Alt Text | Accessibility compliance | Low (API call) |
| P3 | Image Resize & Watermark | Platform-optimized thumbnails | Low (API call) |
| P3 | Caption Rewriting per platform | Adapt tone for each platform | Low (API call) |

---

### Revised Implementation Phases

#### Phase 1: Core Posting (2-3 weeks)
- Social account connection (Ayrshare OAuth)
- Basic clip distribution (Eluvio URL passthrough)
- **AI caption generation** (generate from video title/description)
- **Auto hashtag generation**
- Per-platform caption editors
- Approval workflow

#### Phase 2: Smart Scheduling + Transcription (2-3 weeks)
- Auto-schedule with named schedules
- **Video transcription / auto-captions**
- Manual scheduling (date/time picker)
- Post history page
- **Link shortening** for SmartLink URLs in captions

#### Phase 3: Overlays + SmartLink Combo (2-3 weeks)
- Video overlay editor (text, watermark)
- "Create SmartLink & Share" combined flow
- UTM auto-generation
- **Post translation** (100+ languages)
- **Caption rewriting** per platform

#### Phase 4: Analytics + Social Inbox (2-3 weeks)
- **Post analytics** pulled into dashboard
- **Account analytics** (followers, growth, demographics)
- **Social Inbox** - comments management across platforms
- **Sentiment analysis** on incoming comments
- Subscription tier enforcement

#### Phase 5: Polish + Advanced (1-2 weeks)
- **AI alt text** for images
- **Image resize & watermark** via Ayrshare
- Custom link domains for premium tiers
- Social linking page customization (branding)

---

## Notes

- Ayrshare is the only aggregator with a true multi-tenant reseller API. Late (getlate.dev) at $299/mo is a cheaper alternative worth evaluating.
- Buffer, Hootsuite, Publer, and SocialBee are consumer/agency tools - none offer white-label embedding.
- The Plausible integration (see `docs/PLAUSIBLE_INTEGRATION.md`) handles the inbound side (social -> SmartLink clicks). Ayrshare handles outbound (SmartLink -> social posts) and post-level metrics.
- Existing `shareLink()` in `MediaPage.tsx` uses `navigator.share()` for basic sharing - this feature is a full step up from that.
- **MaxPack add-on required** for AI features (text generation, transcription, translation, sentiment, alt text, link shortener). Token-based: 300K tokens/mo on Business plan.
- **Video transcription** requires video to be uploaded to Ayrshare first (fits naturally into the posting flow since we pass `mediaURLs`).
- **Comments API** works with posts created outside Ayrshare too (using `searchPlatformId=true`), so we could manage comments on all social posts, not just those created through Hiway.
