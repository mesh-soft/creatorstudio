#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const sitesDir = path.join(rootDir, 'sites');

async function main() {
  console.log('🏗️  Building tenant sites...\n');
  
  // Read all tenant folders from content
  const contentDir = path.join(rootDir, 'content');
  const doctorsDir = path.join(contentDir, 'doctors');
  const hospitalsDir = path.join(contentDir, 'hospitals');
  
  const doctors = await fs.readdir(doctorsDir).catch(() => []);
  const hospitals = await fs.readdir(hospitalsDir).catch(() => []);
  
  // Create sites directory
  await fs.mkdir(sitesDir, { recursive: true });
  
  for (const tenant of doctors) {
    await buildTenantSite(tenant, 'doctor');
  }
  
  for (const tenant of hospitals) {
    await buildTenantSite(tenant, 'hospital');
  }
  
  console.log('\n✅ All sites built in ./sites/ folder');
  console.log('\nTo deploy:');
  console.log('  npm run deploy:cloudflare');
}

async function buildTenantSite(tenantId, type) {
  console.log(`  📦 Building ${type}: ${tenantId}...`);
  
  // Organize by type: sites/doctors/ or sites/hospitals/
  const typeDir = path.join(sitesDir, type + 's');
  const tenantDistDir = path.join(typeDir, tenantId);
  // SSG HTML pages can be at .next/server/app/site/{tenantId}/{pageSlug}.html
  const tenantSourceDir = path.join(nextDir, 'server', 'app', 'site', tenantId);
  const rootHtmlSource = path.join(nextDir, 'server', 'app', 'site', `${tenantId}.html`);
  
  // Create tenant folder
  await fs.mkdir(tenantDistDir, { recursive: true });
  
  // Copy static assets: .next/static/ → _next/static/ (preserving the _next prefix browsers expect)
  await copyDir(path.join(nextDir, 'static'), path.join(tenantDistDir, '_next', 'static'));
  
  // 1. Copy pre-rendered HTML pages from tenant folder (e.g. home.html, about.html)
  if (await exists(tenantSourceDir)) {
    const entries = await fs.readdir(tenantSourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        await fs.copyFile(
          path.join(tenantSourceDir, entry.name),
          path.join(tenantDistDir, entry.name)
        );
      }
    }
  }

  // 2. Handle index.html (the root of the tenant site)
  const homeHtml = path.join(tenantDistDir, 'home.html');
  const indexHtml = path.join(tenantDistDir, 'index.html');
  
  if (await exists(homeHtml)) {
    // If we have a home.html, it is our best candidate for index.html
    await fs.copyFile(homeHtml, indexHtml);
  } else if (await exists(rootHtmlSource)) {
    // Fallback to the root HTML file if it's not a redirect (or as a last resort)
    const rootContent = await fs.readFile(rootHtmlSource, 'utf-8');
    if (!rootContent.includes('NEXT_REDIRECT')) {
        await fs.copyFile(rootHtmlSource, indexHtml);
        await fs.copyFile(rootHtmlSource, homeHtml);
    }
  }
  
  // Fix HTML files to use relative paths
  await fixHtmlPaths(tenantDistDir, tenantDistDir);
  
  // Clean up __next*.txt files
  await cleanTxtFiles(tenantDistDir);
  
  // Copy tenant-specific content folder contents
  const tenantContentDir = path.join(rootDir, 'public', 'content', type + 's', tenantId);
  const contentDestDir = path.join(tenantDistDir, 'content');
  if (await exists(tenantContentDir)) {
    await fs.mkdir(contentDestDir, { recursive: true });
    const entries = await fs.readdir(tenantContentDir);
    for (const entry of entries) {
      const src = path.join(tenantContentDir, entry);
      const dest = path.join(contentDestDir, entry);
      const stat = await fs.stat(src);
      if (stat.isDirectory()) {
        await copyDir(src, dest);
      } else {
        await fs.copyFile(src, dest);
      }
    }
  }
  
  // Copy other public assets
  const publicDir = path.join(rootDir, 'public');
  const assets = ['favicon.ico', 'robots.txt'];
  for (const asset of assets) {
    const src = path.join(publicDir, asset);
    const dest = path.join(tenantDistDir, asset);
    if (await exists(src)) {
      await fs.copyFile(src, dest).catch(() => {});
    }
  }
  
  console.log(`     ✓ ${tenantDistDir}`);
}

async function fixHtmlPaths(dir, tenantRoot) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await fixHtmlPaths(fullPath, tenantRoot);
    } else if (entry.name.endsWith('.html')) {
      await fixHtmlFile(fullPath, tenantRoot);
    }
  }
}

async function fixHtmlFile(filePath, tenantRoot) {
  // Calculate relative path from file location to tenant root
  const relativePath = path.relative(path.dirname(filePath), tenantRoot);
  const prefix = relativePath ? relativePath + '/' : './';
  
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Fix ALL _next paths to relative (including in JSON/JS strings)
  content = content.replace(/"\/_next\//g, `"${prefix}_next/`);
  content = content.replace(/'\/_next\//g, `'${prefix}_next/`);
  content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
  content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
  content = content.replace(/url\(\/_next\//g, `url(${prefix}_next/`);
  
  // Fix content image paths
  content = content.replace(/src="\/content\/[^\/]+\/[^\/]+\//g, `src="${prefix}content/`);
  content = content.replace(/href="\/content\/[^\/]+\/[^\/]+\//g, `href="${prefix}content/`);
  
  await fs.writeFile(filePath, content, 'utf-8');
}

async function cleanTxtFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await cleanTxtFiles(fullPath);
    } else if (entry.name.endsWith('.txt') && entry.name.startsWith('__next')) {
      await fs.unlink(fullPath).catch(() => {});
    }
  }
}

async function copyDir(src, dest) {
  if (!(await exists(src))) return;
  
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch(console.error);
