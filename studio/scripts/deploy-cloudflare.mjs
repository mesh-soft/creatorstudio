#!/usr/bin/env node
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
  
  // Collect all individual tenant site directories (sites/<type>/<tenantId>/)
  const typeEntries = await fs.readdir(sitesDir);
  const tenants = [];
  for (const typeFolder of typeEntries) {
    const typeDir = path.join(sitesDir, typeFolder);
    const typeStat = await fs.stat(typeDir);
    if (!typeStat.isDirectory()) continue;
    const entries = await fs.readdir(typeDir);
    for (const tenantId of entries) {
      const tenantDir = path.join(typeDir, tenantId);
      const tenantStat = await fs.stat(tenantDir);
      if (tenantStat.isDirectory()) tenants.push({ tenantId, tenantDir });
    }
  }

  for (const { tenantId, tenantDir } of tenants) {
    console.log(`\n📤 Deploying: ${tenantId}`);
    
    try {
      // Deploy to Cloudflare Pages — one project per tenant
      execSync(
        `wrangler pages deploy "${tenantDir}" --project-name="${tenantId}" --branch=main`,
        { stdio: 'inherit', cwd: rootDir }
      );
      
      console.log(`   ✅ https://${tenantId}.pages.dev`);
    } catch (error) {
      console.error(`   ❌ Failed to deploy ${tenantId}`);
    }
  }
  
  console.log('\n🎉 All sites deployed!');
  console.log('\nTo add custom domains:');
  console.log('  1. Go to Cloudflare Dashboard > Pages');
  console.log('  2. Select project > Custom Domains');
  console.log('  3. Add domain (e.g., dramitsharma.com)');
}

main().catch(console.error);
