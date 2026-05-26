# Creator Studio — Self-Hosted CMS for Doctor & Hospital Sites

A Next.js App Router application that manages multi-tenant doctor and hospital websites. Content is stored as JSON and edited through a visual block editor with live preview.

## Quick Start

```bash
cd studio
pnpm dev
```

Open [http://localhost:3000/creator](http://localhost:3000/creator) to access the Creator Studio editor.

## Architecture

```
src/
├── app/
│   ├── creator/          — Visual block editor (replaces TinaCMS admin)
│   ├── site/[tenantId]/  — Public tenant site pages (SSG + preview)
│   └── api/
│       ├── content/read   — Read tenant JSON from configured backend
│       ├── content/save   — Write tenant JSON to configured backend
│       └── create-tenant  — Create new tenant folder structure
├── platform/
│   ├── content.ts         — Async content queries via ContentAdapter
│   ├── contentAdapter/    — Backend-agnostic CRUD layer
│   │   ├── types.ts       — ContentAdapter interface
│   │   ├── index.ts       — Factory (reads CONTENT_BACKEND env var)
│   │   └── adapters/
│   │       ├── fs.ts      — Local filesystem
│   │       ├── github.ts  — GitHub REST API (commits on save)
│   │       ├── s3.ts      — AWS S3 / Cloudflare R2 / MinIO
│   │       └── gcp.ts     — Google Cloud Storage
│   └── SiteRenderer.tsx   — Renders site pages from Tenant objects
└── components/
    └── editor/
        └── BlockEditor.tsx — Visual block editor with live preview
```

## Content Backends

Set `CONTENT_BACKEND` to choose where content is stored:

| Value | Backend | Write behavior |
|-------|---------|---------------|
| `fs` (default) | Local filesystem | Writes to `content/` directory |
| `github` | GitHub repository | Commits JSON changes to the repo |
| `s3` | AWS S3-compatible | Writes objects to bucket |
| `gcp` | Google Cloud Storage | Writes objects to bucket |

## Environment Variables

### Required for all backends

| Variable | Description |
|----------|-------------|
| `CONTENT_BACKEND` | `fs` (default), `github`, `s3`, or `gcp` |

---

### Filesystem (`CONTENT_BACKEND=fs`)

No additional variables required. Content is read/written from `content/` in the project root. This is the default for local development.

---

### GitHub (`CONTENT_BACKEND=github`)

Creates commits directly to the repository on every save.

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_OWNER` | Yes | GitHub username or organization |
| `GITHUB_REPO` | Yes | Repository name |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Yes | GitHub PAT with repo read/write access |
| `GITHUB_BRANCH` | No | Target branch (defaults to `VERCEL_GIT_COMMIT_REF` or `main`) |

#### Creating a GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Fine-grained token**
3. Set **Resource owner** to your account or organization
4. Set **Repository access** → **Only select repositories** → pick your repo
5. Under **Permissions** → **Repository permissions**:
   - **Contents**: Read and write
   - **Metadata**: Read (auto-selected)
6. Click **Generate token** and copy the value

```
# .env.local (for local dev testing)
CONTENT_BACKEND=github
GITHUB_OWNER=your-username
GITHUB_REPO=doctor-sites
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_xxxx
GITHUB_BRANCH=main
```

#### Vercel deployment

Add the same variables in **Vercel Dashboard → Settings → Environment Variables**. Set `CONTENT_BACKEND=github` for production. During build, the filesystem adapter is used (content is available from the repo). At runtime, the GitHub adapter handles reads/writes.

---

### S3 (`CONTENT_BACKEND=s3`)

Works with any S3-compatible storage (AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces).

| Variable | Required | Description |
|----------|----------|-------------|
| `S3_REGION` | Yes | AWS region (e.g. `us-east-1`, `auto` for R2) |
| `S3_BUCKET` | Yes | Bucket name |
| `S3_ACCESS_KEY_ID` | Yes | AWS access key ID |
| `S3_SECRET_ACCESS_KEY` | Yes | AWS secret access key |
| `S3_ENDPOINT` | No | Custom endpoint for S3-compatible services |

#### AWS S3 Setup

1. Create an S3 bucket in the AWS Console
2. Go to **IAM → Users → Create user**
3. Attach the policy below (replace `YOUR-BUCKET-NAME`):
4. Create access key (use the values for `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`)

**Required IAM policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

```
# Cloudflare R2 example
CONTENT_BACKEND=s3
S3_REGION=auto
S3_BUCKET=my-bucket
S3_ACCESS_KEY_ID=xxxx
S3_SECRET_ACCESS_KEY=xxxx
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

#### S3 Bucket Setup for Public Sites

If your generated tenant sites need to serve publicly from S3, enable static website hosting on the bucket and set appropriate CORS/bucket policy.

---

### GCP (`CONTENT_BACKEND=gcp`)

Uses Google Cloud Storage JSON API with service account JWT authentication. No additional SDK needed.

| Variable | Required | Description |
|----------|----------|-------------|
| `GCP_PROJECT_ID` | Yes | GCP project ID |
| `GCP_BUCKET` | Yes | GCS bucket name |
| `GCP_CLIENT_EMAIL` | Yes | Service account email |
| `GCP_PRIVATE_KEY` | Yes | Service account private key (PEM format) |

#### GCP Setup

1. Go to **GCP Console → IAM & Admin → Service Accounts**
2. Create a service account or select an existing one
3. Under **Keys**, add a new JSON key and download it
4. Assign the **Storage Object Admin** role (`roles/storage.objectAdmin`)
5. Use the values from the downloaded JSON:

```
# From the service account JSON:
#   client_email  → GCP_CLIENT_EMAIL
#   private_key   → GCP_PRIVATE_KEY (include full key with newlines as \n)
#   project_id    → GCP_PROJECT_ID

CONTENT_BACKEND=gcp
GCP_PROJECT_ID=my-project-12345
GCP_BUCKET=doctor-sites-content
GCP_CLIENT_EMAIL=sa-name@my-project-12345.iam.gserviceaccount.com
GCP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvg...\n-----END PRIVATE KEY-----\n
```

**Required IAM role:** `roles/storage.objectAdmin` on the bucket — grants `storage.objects.create`, `storage.objects.get`, `storage.objects.delete`, `storage.objects.list`.

#### GCP Bucket Setup

1. Create a GCS bucket: **Cloud Storage → Create bucket**
2. Choose a globally unique name
3. Set **Location type** and **Storage class** as needed
4. For public serving of tenant sites, enable uniform bucket-level access and set appropriate permissions

---

## Vercel Deployment

`vercel.json` is pre-configured:

```json
{
  "framework": "nextjs",
  "rootDirectory": "studio",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run build:tina"
}
```

1. Connect the repo to Vercel
2. Set **Root Directory** to `studio`
3. Add environment variables in **Settings → Environment Variables**
4. For GitHub backend: set `CONTENT_BACKEND=github` + GitHub PAT vars
5. For S3/GCP: set `CONTENT_BACKEND=s3` or `gcp` + service credentials
6. Deploy

## Local Development

```bash
pnpm dev       # Start on http://localhost:3000
pnpm build     # Production build
```

- Public site: `http://localhost:3000/site/<tenant-slug>`
- Creator editor: `http://localhost:3000/creator`
- Preview: `http://localhost:3000/site/<tenant-slug>/home/preview`

## Content Structure

```
content/
├── doctors/
│   └── <tenant-slug>/
│       ├── site/
│       │   └── index.json     — Site settings (profile, theme, SEO)
│       └── pages/
│           ├── home.json       — Home page blocks
│           └── about.json      — Additional pages
└── hospitals/
    └── <tenant-slug>/
        └── ...
```

Each page JSON contains a `blocks` array. The block editor renders these as editable cards with two tabs (Content + Presentation). Save commits changes to the configured backend.
