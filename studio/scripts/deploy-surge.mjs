#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const sitesDir = path.join(rootDir, 'sites');

async function main() {
  console.log('🚀 Deploying to Surge.sh...\n');

  // Check for surge CLI
  try {
    execSync('surge --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ Surge CLI not found. Install with: npm install -g surge');
    console.log('\nThen login with: surge login');
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
      execSync(`surge "${tenantDir}"`, { stdio: 'inherit', cwd: rootDir });
      console.log(`   ✅ Deployed ${tenantId}`);
    } catch {
      console.error(`   ❌ Failed to deploy ${tenantId}`);
    }
  }

  console.log('\n🎉 All sites deployed!');
  console.log('\nTo use a custom domain, add a CNAME record pointing to na.surge.sh');
}

main().catch(console.error);
