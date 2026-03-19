# Clip Delivery for Social Distribution — Technical Proposal

## The Problem

When a user clips content in the Hiway portal and sends it to social platforms via Ayrshare, the clip URL contains a **time-limited Content Fabric auth token**. This creates two failure modes:

1. **Immediate posts** — By the time Ayrshare fetches the clip (seconds to minutes later), the token may have expired. Ayrshare either gets the full unclipped source file or fails entirely.
2. **Scheduled posts** — If a user schedules a post for tomorrow or next week, the token will certainly be expired when Ayrshare eventually tries to download it.

The current clip URL format:
```
https://{fabric-node}/s/files/q/{versionHash}/call/media/files/{jobId}/download
  ?header-x_set_content_disposition=attachment;%20filename=clip.mp4
  &authorization={time-limited-token}
```

The clip itself is correct (trimmed, ~5MB), but the delivery mechanism breaks because the URL is not durable.

## Proposed Solution: Temporary Object Storage (Cloudflare R2)

### Flow

```
User clips video → Clicks "Post Now" or "Schedule"
        ↓
Social Integration Service receives clip URL (token is fresh)
        ↓
Service immediately downloads the clip from Content Fabric
        ↓
Uploads to Cloudflare R2 bucket (temp storage)
        ↓
Generates a durable R2 URL (no expiry)
        ↓
Passes R2 URL to Ayrshare API
        ↓
Ayrshare downloads whenever ready (immediate or scheduled)
        ↓
On publish confirmation (webhook), delete from R2
```

### Why R2

| Factor | Detail |
|--------|--------|
| **Egress fees** | Zero — Ayrshare downloading clips costs nothing |
| **Storage cost** | ~$0.015/GB/month — negligible for temp clips |
| **Lifecycle rules** | Auto-delete after N days as a safety net |
| **Compatibility** | S3-compatible API — standard tooling |
| **Region** | Can be placed close to Ayrshare's servers for fast download |

### Storage Impact

- Average clip size: ~5MB
- Clips are only stored between "schedule" and "published"
- Immediate posts: stored for seconds to minutes
- Scheduled posts: stored for hours to days
- Auto-cleanup on publish + lifecycle rule fallback (7 days max)
- Even at 1000 clips/month with 7-day retention: ~35GB peak = ~$0.50/month

### What This Requires

1. **Cloudflare R2 bucket** — one bucket, e.g. `hiway-social-clips`
2. **R2 credentials** — access key + secret for the social integration service
3. **Small code change** — in the social integration service's post creation flow:
   - Download clip from Content Fabric URL
   - Upload to R2
   - Pass R2 URL to Ayrshare
   - Delete from R2 on webhook confirmation
4. **Lifecycle rule** — auto-delete objects older than 7 days (safety net)

### No changes needed to:
- The clipping tool
- The frontend
- Content Fabric
- Ayrshare configuration

## Alternatives Considered

### Longer Content Fabric Tokens
- Could work for immediate posts but **does not solve scheduling**
- Token would need to be valid for days/weeks — security risk
- Rejected

### Client-Side Upload to R2
- Browser uploads the clip blob directly to R2 via presigned URL
- Adds upload time to the user flow and requires frontend changes
- More complex, less reliable
- Rejected in favour of server-side handling

### FFmpeg Proxy (Stream Processing)
- Social service clips the video on-the-fly using FFmpeg
- No storage needed but requires FFmpeg on the server
- Railway memory limits make this risky for larger clips
- Adds processing latency and complexity
- Rejected

### Ayrshare Direct Upload
- Ayrshare supports direct media upload via their API
- Would require downloading the clip server-side first anyway
- Still needs temp storage or streaming — same problem
- Could be a future optimisation but doesn't avoid the core issue

## Recommendation

Implement R2 temp storage. It's the simplest, cheapest, and most reliable solution. The social integration service already sits between the frontend and Ayrshare — adding a download-upload step is a small change with no impact on the user experience or other systems.

Estimated implementation time: half a day.
