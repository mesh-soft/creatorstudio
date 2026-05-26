import type { ContentAdapter } from './types';

let _adapter: ContentAdapter | null = null;

export async function getContentAdapter(): Promise<ContentAdapter> {
  if (_adapter) return _adapter;

  const backend = process.env.CONTENT_BACKEND || 'fs';

  switch (backend) {
    case 'github': {
      const { GitHubAdapter } = await import('./adapters/github');
      _adapter = new GitHubAdapter({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
        branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main',
      });
      break;
    }
    case 's3': {
      const { S3Adapter } = await import('./adapters/s3');
      _adapter = new S3Adapter({
        region: process.env.S3_REGION!,
        bucket: process.env.S3_BUCKET!,
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        endpoint: process.env.S3_ENDPOINT,
      });
      break;
    }
    case 'gcp': {
      const { GCPAdapter } = await import('./adapters/gcp');
      _adapter = new GCPAdapter({
        projectId: process.env.GCP_PROJECT_ID!,
        bucket: process.env.GCP_BUCKET!,
        clientEmail: process.env.GCP_CLIENT_EMAIL!,
        privateKey: process.env.GCP_PRIVATE_KEY!,
      });
      break;
    }
    case 'fs':
    default: {
      const { FilesystemAdapter } = await import('./adapters/fs');
      _adapter = new FilesystemAdapter(process.cwd());
      break;
    }
  }

  return _adapter;
}

export type { ContentAdapter, ContentEntry } from './types';
export { FilesystemAdapter } from './adapters/fs';
export {
  resolveMediaPath,
  resolveTenantDir,
  resolveContentDir,
} from './adapters/fs';
