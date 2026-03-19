# Platform-Specific Options for Social Posting

When posting to each platform, the frontend can pass platform-specific fields. These get sent to Ayrshare as `{platform}Options` in the API call.

## Working Status

| Platform | Video Post | Notes |
|----------|-----------|-------|
| Instagram | ✅ Works | Direct upload via Meta API |
| Facebook | ✅ Works | Direct upload via Meta API |
| Telegram | ✅ Works | 20MB video limit on Ayrshare |
| LinkedIn | ✅ Likely works | Direct upload |
| Threads | ✅ Likely works | Meta API |
| TikTok | ⚠️ Test needed | May have URL format issues |
| YouTube | ⚠️ Needs title | Requires `youTubeOptions.title` |
| Twitter/X | ❌ URL fetch issue | Ayrshare passes URL to X, X can't fetch CF URLs |
| Bluesky | ❌ URL fetch issue | Same as Twitter |
| Pinterest | ⚠️ Test needed | |
| Reddit | ❌ No video | Images only |

---

## YouTube — `youTubeOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Video title, max 100 chars |
| `visibility` | string | No | `public`, `unlisted`, `private` (default: `private`) |
| `tags` | string[] | No | Tags, 2+ chars each, 400 chars total |
| `madeForKids` | boolean | No | Is the video for children (default: `false`) |
| `shorts` | boolean | No | Post as YouTube Short (max 3min, 9:16 ratio) |
| `categoryId` | number | No | Category — e.g. `17` = Sports, `24` = Entertainment |
| `notifySubscribers` | boolean | No | Notify subs (default: `true`) |
| `playListId` | string | No | Add to existing playlist |
| `thumbNail` | string | No | Cover image URL (JPEG/PNG, < 2MB) |

---

## Instagram — `instagramOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stories` | boolean | No | Post as Instagram Story (24hr disappearing) |
| `shareReelsFeed` | boolean | No | Show Reel in Feed + Reels tabs |
| `thumbNail` | string | No | Cover image URL for Reel |
| `thumbNailOffset` | number | No | Milliseconds into video for thumbnail frame |
| `altText` | string[] | No | Accessibility text per image, max 1000 chars each |
| `collaborators` | string[] | No | Up to 3 Instagram usernames for co-authoring |
| `locationId` | number/string | No | Facebook Page ID for location tag |

**Post limits:** Max 2,200 chars, 5 hashtags, 3 mentions. Up to 10 images/videos carousel.

---

## Facebook — `faceBookOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reels` | boolean | No | Post as Facebook Reel |
| `stories` | boolean | No | Post as Facebook Story |
| `title` | string | No | Video/Reel title, max 255 chars |
| `thumbNail` | string | No | Cover image URL (JPEG/PNG, < 10MB) |
| `draft` | boolean | No | Create as draft in Meta Business Suite |
| `altText` | string[] | No | Accessibility text per image/video |
| `locationId` | number/string | No | Facebook Page ID for location |
| `link` | string | No | Force specific link preview |

---

## TikTok — `tikTokOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `visibility` | string | No | `public`, `private`, `followers`, `friends` (default: `public`) |
| `title` | string | No | Image post title |
| `autoAddMusic` | boolean | No | Auto-add recommended music |
| `disableComments` | boolean | No | Turn off comments |
| `disableDuet` | boolean | No | Disable duets (video only) |
| `disableStitch` | boolean | No | Disable stitching (video only) |
| `draft` | boolean | No | Create as draft for editing |
| `isAIGenerated` | boolean | No | Label as AI-generated |
| `isBrandedContent` | boolean | No | "Paid partnership" label |
| `thumbNail` | string | No | Thumbnail image URL |
| `thumbNailOffset` | number | No | Thumbnail frame in milliseconds |

**Rate limits:** 6 posts/minute, 15 posts/day max.

---

## Twitter/X — `twitterOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thread` | boolean | No | Post as thread |
| `threadNumber` | boolean | No | Auto-number threads (1/n) |
| `longPost` | boolean | No | Allow > 280 chars (Premium only) |
| `longVideo` | boolean | No | Allow longer videos (approved accounts) |
| `replySettings` | string | No | `following`, `mentioned`, `subscribers`, `verified` |
| `altText` | string[] | No | Alt text per image, max 1000 chars each |
| `thumbNail` | string | No | Video thumbnail URL (JPEG/PNG/WebP) |
| `quoteTweetId` | string | No | Tweet ID to quote |
| `poll` | object | No | `{ duration: minutes, options: string[] }` |

**Note:** As of March 31, 2026, X requires OAuth1 API keys in headers.

---

## LinkedIn — `linkedInOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `visibility` | string | No | `public`, `connections`, `loggedin` (default: `public`) |
| `title` | string | No | Document title (for PDF/PPT posts), max 400 chars |
| `titles` | string[] | No | Captions per image/video |
| `thumbNail` | string | No | Video cover image URL (PNG/JPG, < 10MB) |
| `altText` | string[] | No | Accessibility text per image |
| `disableShare` | boolean | No | Prevent resharing |

**Post limits:** Max 3,000 chars. Up to 9 images.

---

## Threads — `threadsOptions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thread` | boolean | No | Break into connected thread series |
| `threadNumber` | boolean | No | Auto-number threads |

**Post limits:** Max 500 chars, 1 hashtag, up to 20 images/videos carousel. 250 posts per 24hrs.

---

## Telegram

No platform-specific options. Just `post` and `mediaUrls`.

**Limits:** 1 image, 1 video per post. 20MB video max on Ayrshare.

---

## Bluesky

No platform-specific options documented. Just `post` and `mediaUrls`.

**Limits:** 4 images, 1 video per post.

---

## Frontend Implementation

When user selects platforms, show relevant fields for each selected platform. The backend will include the options automatically. The request body should look like:

```json
{
  "mediaUrl": "https://...",
  "platforms": [
    {
      "platform": "youtube",
      "caption": "My video description",
      "hashtags": ["sports", "highlights"]
    },
    {
      "platform": "instagram",
      "caption": "Check this out!",
      "hashtags": ["sports"]
    }
  ],
  "youTubeOptions": {
    "title": "Game Highlights",
    "visibility": "public",
    "categoryId": 17
  },
  "instagramOptions": {
    "shareReelsFeed": true
  }
}
```

The backend needs to be updated to pass these through to Ayrshare. Currently only `youTubeOptions` is auto-generated.
