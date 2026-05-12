#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
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

async function buildTenantSite(tenantId: string, type: 'doctor' | 'hospital') {
  console.log(`  📦 Building ${type}: ${tenantId}...`);
  
  const tenantDistDir = path.join(sitesDir, tenantId);
  const tenantSourceDir = path.join(distDir, 'site', tenantId);
  
  // Create tenant folder
  await fs.mkdir(tenantDistDir, { recursive: true });
  
  // Copy static files (CSS, JS, _next folder)
  await copyDir(path.join(distDir, '_next'), path.join(tenantDistDir, '_next'));
  
  // Copy this tenant's pages
  if (await exists(tenantSourceDir)) {
    await copyDir(tenantSourceDir, tenantDistDir);
  }
  
  // Fix HTML files to use relative paths
  await fixHtmlPaths(tenantDistDir, tenantDistDir);
  
  // Clean up __next*.txt files
  await cleanTxtFiles(tenantDistDir);
  
  // Copy index.html as home.html and create root index
  const homeHtml = path.join(tenantDistDir, 'home.html');
  if (await exists(homeHtml)) {
    await fs.copyFile(homeHtml, path.join(tenantDistDir, 'index.html'));
    await fixHtmlFile(path.join(tenantDistDir, 'index.html'), tenantDistDir);
  }
  
  // Copy public assets
  const publicDir = path.join(rootDir, 'public');
  const assets = ['content', 'favicon.ico', 'robots.txt'];
  for (const asset of assets) {
    const src = path.join(publicDir, asset);
    const dest = path.join(tenantDistDir, asset);
    if (await exists(src)) {
      await copyDir(src, dest).catch(() => {});
    }
  }
  
  console.log(`     ✓ ${tenantDistDir}`);
}

async function fixHtmlPaths(dir: string, tenantRoot: string) {
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

async function fixHtmlFile(filePath: string, tenantRoot: string) {
  // Calculate relative path from file location to tenant root
  const relativePath = path.relative(path.dirname(filePath), tenantRoot);
  const prefix = relativePath ? relativePath + '/' : './';
  
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Fix absolute paths to relative
  content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
  content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
  content = content.replace(/url\(\/_next\//g, `url(${prefix}_next/`);
  
  await fs.writeFile(filePath, content, 'utf-8');
}

async function cleanTxtFiles(dir: string) {
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

async function copyDir(src: string, dest: string) {
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

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch(console.error);
