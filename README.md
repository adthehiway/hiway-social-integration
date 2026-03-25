# Hiway Social Integration

Microservice that distributes video clips from the Hiway portal to social media platforms via [Ayrshare's API](https://www.ayrshare.com/).

## Stack

- **Runtime:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod
- **Social API:** Ayrshare (multi-platform posting, analytics, AI)
- **Testing:** Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Ayrshare account with API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AYRSHARE_API_KEY` | Yes | Ayrshare API key |
| `AYRSHARE_PRIVATE_KEY` | No | Ayrshare private key for JWT generation |
| `AYRSHARE_BASE_URL` | No | Ayrshare API base URL (default: `https://app.ayrshare.com/api`) |
| `AYRSHARE_DOMAIN` | No | Ayrshare domain ID |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (`development`, `production`, `test`) |

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/webhooks/ayrshare` | Ayrshare webhook for post status updates |

### Internal Only (localhost / *.railway.internal)

All internal routes require an `x-company-id` header.

#### Posts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/social/posts` | Create a post |
| `GET` | `/social/posts` | List posts (paginated: `?page=1&limit=20`) |
| `GET` | `/social/posts/pending` | List posts pending approval |
| `GET` | `/social/posts/:id` | Get a post |
| `DELETE` | `/social/posts/:id` | Cancel a post |
| `POST` | `/social/posts/:id/approve` | Approve a post |
| `POST` | `/social/posts/:id/reject` | Reject a post |

#### Profiles & Accounts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/social/profiles` | Create Ayrshare profile for a company |
| `POST` | `/social/profiles/reset` | Reset profile and re-create |
| `POST` | `/social/accounts/connect` | Get platform connect URL |
| `GET` | `/social/accounts` | List connected social accounts |
| `DELETE` | `/social/accounts/:platform` | Disconnect a platform |

#### AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/social/ai/generate-caption` | Generate caption from text |
| `POST` | `/social/ai/hashtags` | Generate hashtags from post text |

#### Schedules

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/social/schedules` | Create a posting schedule |
| `GET` | `/social/schedules` | List all schedules |
| `PUT` | `/social/schedules/:id` | Update a schedule |
| `DELETE` | `/social/schedules/:id` | Delete a schedule |

#### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/social/analytics/post` | Get analytics for a specific post |
| `POST` | `/social/analytics/social` | Get account-level analytics |
| `GET` | `/social/analytics/history` | Get post history |

## Supported Platforms

YouTube, Instagram, Facebook, TikTok, Twitter/X, LinkedIn, Threads, Pinterest, Bluesky, Reddit, Snapchat

Each platform supports platform-specific options (thumbnails, visibility, reels, shorts, stories, etc.) passed through the post creation body.

## Data Model

```
AyrshareProfile
├── companyId (unique)
├── profileKey
└── posts[] → SocialPost

SocialPost
├── companyId
├── mediaUrl
├── status (DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHING → PUBLISHED/PARTIAL/FAILED)
├── scheduledAt / publishedAt
├── platforms[] → SocialPostPlatform
└── approval? → PostApproval

SocialPostPlatform
├── platform
├── caption / hashtags
├── externalPostId / externalPostUrl
├── status / errorMessage

PostApproval
├── approvedBy / approvedAt
└── rejectedBy / rejectedAt / rejectionNotes
```

## Access Control

This service does not use API key authentication. Instead, access is restricted to:

- **localhost** / **127.0.0.1** — local development
- **\*.railway.internal** — Railway private networking

External requests are rejected with `403 Forbidden`. All internal requests must include the `x-company-id` header.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to `dist/` |
| `npm start` | Production start (migrate + run) |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run migrate:deploy` | Apply migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio |

## Deployment

Deployed on [Railway](https://railway.app/) with automatic deploys. The start command runs pending database migrations before starting the server.

Ensure `NODE_ENV=production` is set in Railway environment variables.
