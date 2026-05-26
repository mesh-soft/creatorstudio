#!/usr/bin/env tsx
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const sitesDir = path.join(rootDir, 'sites');

async function main() {
  console.log('🚀 Deploying to Cloudflare Pages...\n');
  
  // Check for wrangler CLI
  try {
    execSync('wrangler --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ Wrangler CLI not found. Install with: npm install -g wrangler');
    console.log('\nThen login with: wrangler login');
    process.exit(1);
  }
  
  // Get all tenant sites
  const tenants = await fs.readdir(sitesDir);
  
  for (const tenant of tenants) {
    const tenantDir = path.join(sitesDir, tenant);
    const stat = await fs.stat(tenantDir);
    if (!stat.isDirectory()) continue;
    
    console.log(`\n📤 Deploying: ${tenant}`);
    
    try {
      // Deploy to Cloudflare Pages
      execSync(
        `wrangler pages deploy "${tenantDir}" --project-name="${tenant}" --branch=main`,
        { stdio: 'inherit', cwd: rootDir }
      );
      
      console.log(`   ✅ https://${tenant}.pages.dev`);
    } catch (error) {
      console.error(`   ❌ Failed to deploy ${tenant}`);
    }
  }
  
  console.log('\n🎉 All sites deployed!');
  console.log('\nTo add custom domains:');
  console.log('  1. Go to Cloudflare Dashboard > Pages');
  console.log('  2. Select project > Custom Domains');
  console.log('  3. Add domain (e.g., dramitsharma.com)');
}

main().catch(console.error);
