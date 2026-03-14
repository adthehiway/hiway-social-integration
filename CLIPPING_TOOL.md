# Clipping Tool - Architecture & Code Reference

## Overview
The clipping tool lets users select a segment of existing video content and create a SmartLink that plays only that clip. No new files are created — the clip boundaries (start/end seconds) are stored on the SmartLink and passed to the Eluvio player at playback time.

## Key Files

### 1. Clipping Page
**`app/(web)/(protected)/dashboard/clipping/page.tsx`**

Main page component that handles:
- Content selection via `SearchMediaInput`
- Video playback with mark in/out controls via `VideoPlayer`
- Clip validation (minimum 5 seconds, start < end)
- SmartLink creation via `SmartLinkModal`
- "My Clips" sidebar showing existing clips (filtered by "clip" tag)

**State:**
```typescript
const [selectedMedia, setSelectedMedia] = useState<IMedia | undefined>();
const [segmentStartSeconds, setSegmentStartSeconds] = useState(0);
const [segmentEndSeconds, setSegmentEndSeconds] = useState(0);
const [segmentError, setSegmentError] = useState<string>();
const [smartLinkModalOpen, setSmartLinkModalOpen] = useState(false);
const [mediaDuration, setMediaDuration] = useState<number>();
const hasManualSelection = useRef(false);
```

**Clip validation:**
```typescript
useEffect(() => {
  const diff = segmentEndSeconds - segmentStartSeconds;
  if (segmentStartSeconds >= segmentEndSeconds && segmentEndSeconds > 0) {
    setSegmentError("Start time must be before end time");
  } else if (diff > 0 && diff <= 4) {
    setSegmentError("Clip must be longer than 5 seconds");
  } else {
    setSegmentError(undefined);
  }
}, [segmentStartSeconds, segmentEndSeconds]);
```

**Fetching clips sidebar:**
```typescript
const { data: allTags } = useSmartLinkTags();
const clipTagId = useMemo(() => {
  const clipTag = (allTags || []).find(t => t.name.toLowerCase() === "clip");
  return clipTag?.id;
}, [allTags]);

const { smartLinks: clipSmartLinks } = useSmartLinks({
  tagIds: clipTagId || undefined,
  limit: 50,
  enabled: !!clipTagId,
});
```

### 2. Video Player Component
**`components/common/video-player.component.tsx`**

Wraps `@eluvio/elv-player-js`. Key props for clipping:
```typescript
interface VideoPlayerProps {
  token: string;             // Signed playout token from API
  versionHash?: string;      // Eluvio content fabric hash
  autoplay?: boolean;
  controls?: {
    markInOut?: boolean;         // Enable in/out marker buttons
    previewMode?: boolean;       // Preview mode
    markInOutCallback?: (values: { in: number; out: number }) => void;
  };
  onDuration?: (duration: number) => void;
}
```

**Critical: Token fetching**
The video player needs a signed token. Use `useMedia(id, true)` — the `true` flag requests `?token=true` which returns `signedToken`. Without it, the player falls back to an anonymous token that gets 403'd.

```typescript
const { data: mediaWithToken } = useMedia(selectedMedia?.id || "", true);

// Only render player when token is ready
{mediaWithToken?.signedToken ? (
  <VideoPlayer token={mediaWithToken.signedToken} ... />
) : (
  <Loader />
)}
```

**ElvClient profile patch:**
The video player patches `ElvClient.prototype.ContentObjectMetadata` to inject `profile: true` query param, which was removed in elv-client-js v4.2.x but is required for proper content resolution.

### 3. SmartLink Modal
**`components/dashboard/common/SmartLinkModal.tsx`**

Creates SmartLinks with optional clip boundaries. Key props:
```typescript
interface SmartLinkModalProps {
  media?: IMedia;
  isOpen: boolean;
  onClose: () => void;
  clipStart?: number;        // Clip start in seconds
  clipEnd?: number;          // Clip end in seconds
  defaultTagNames?: string[]; // Tags to auto-assign (e.g. ["clip"])
}
```

**Auto-tagging flow:**
After SmartLink creation, if `defaultTagNames` is provided:
1. Check if tag exists via `useSmartLinkTags()`
2. Create tag if not found via `useCreateSmartLinkTag()`
3. Assign tag via `useBulkAssignTags()`

**Payload includes clip boundaries:**
```typescript
const payload: Partial<ISmartLink> = {
  name: formData.name,
  mediaId: formData.mediaId,
  access: formData.access,
  clipStart: clipStart,
  clipEnd: clipEnd,
  // ... other fields
};
```

### 4. Search Media Input
**`components/dashboard/common/SearchMediaInput.tsx`**

Reusable component for searching and selecting media. Used in both the clipping page and SmartLink modal.

## Data Flow

```
User selects media → SearchMediaInput
  → useMedia(id, true) fetches signed token
  → VideoPlayer renders with token
  → User marks in/out on player timeline
  → markInOutCallback updates segmentStart/segmentEnd
  → User clicks "Create Clip SmartLink"
  → SmartLinkModal opens with clipStart/clipEnd/defaultTagNames
  → SmartLink created with clip boundaries
  → "clip" tag auto-assigned
  → Redirect to SmartLink edit page
```

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /media/{id}?token=true` | Get media with signed playout token |
| `GET /media?status=ready` | Search ready media for selection |
| `POST /smartlinks` | Create SmartLink with clipStart/clipEnd |
| `GET /smartlinks/tags` | Fetch all tags |
| `POST /smartlinks/tags` | Create new tag |
| `POST /smartlinks/bulk/assign-tags` | Assign tags to SmartLink |
| `GET /smartlinks?tagIds=xxx` | Fetch SmartLinks filtered by tag |

## UI Layout

```
┌─────────────────────────────────────────┐
│ Clipping - Page Title                   │
├─────────────────────────────────────────┤
│ [Search and select content]             │
├─────────────────────────────────────────┤
│ My Clips (if any exist)                 │
│ ├─ Clip Name 1  00:15 – 01:30         │
│ ├─ Clip Name 2  02:00 – 03:45         │
├──────────┬──────────────────────────────┤
│ Clip     │                              │
│ Settings │    Video Player              │
│          │    (with mark in/out)        │
│ Start:   │                              │
│ End:     │                              │
│ Duration:│                              │
├──────────┤                              │
│ Status   │                              │
│ Card     │                              │
└──────────┴──────────────────────────────┘
│        [Create Clip SmartLink]          │
└─────────────────────────────────────────┘
```

## Dependencies

- `@eluvio/elv-player-js` — Video player with mark in/out support
- `@eluvio/elv-client-js` — Content Fabric client (needs profile patch)
- `@tanstack/react-query` — Data fetching/caching
- `react-toastify` — Success/error notifications
- `lucide-react` — Icons
- `shadcn/ui` — Card, Button, Badge, Input, Modal, etc.

## Porting Notes

1. The video player is tightly coupled to Eluvio Content Fabric. For a different video platform, replace `VideoPlayer` with your own player that supports mark in/out callbacks.
2. The SmartLink creation and tagging system is specific to the Hiway backend API. Replace with your own content sharing/link creation endpoints.
3. The signed token system (`useMedia(id, true)`) is specific to Eluvio's DRM. Replace with your platform's auth/token mechanism.
4. Core clipping logic (time selection, validation, UI) is platform-agnostic and can be reused.
