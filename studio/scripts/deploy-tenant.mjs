#!/usr/bin/env node
/**
 * Build and deploy a single tenant site to Surge.sh.
 *
 * Usage:
 *   node scripts/deploy-tenant.mjs <tenantId> [--build]
 *
 * Flags:
 *   --build   Run a full Next.js build before assembling (slower but ensures fresh output)
 *
 * Examples:
 *   node scripts/deploy-tenant.mjs dr-amit-sharma
 *   node scripts/deploy-tenant.mjs nitesh-garwa --build
 */
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const sitesDir = path.join(rootDir, 'sites');
const contentDir = path.join(rootDir, 'content');

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const tenantId = args.find((a) => !a.startsWith('--'));
const shouldBuild = args.includes('--build');

if (!tenantId) {
  console.error('Usage: node scripts/deploy-tenant.mjs <tenantId> [--build]');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function copyDir(src, dest) {
  if (!(await exists(src))) return;
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? await copyDir(s, d) : await fs.copyFile(s, d);
  }
}

async function fixHtmlFile(filePath, tenantRoot) {
  const relativePath = path.relative(path.dirname(filePath), tenantRoot);
  const prefix = relativePath ? relativePath + '/' : './';
  let content = await fs.readFile(filePath, 'utf-8');
  content = content.replace(/"\/_next\//g, `"${prefix}_next/`);
  content = content.replace(/'\/_next\//g, `'${prefix}_next/`);
  content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
  content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
  content = content.replace(/url\(\/_next\//g, `url(${prefix}_next/`);
  content = content.replace(/src="\/content\/[^\/]+\/[^\/]+\//g, `src="${prefix}content/`);
  content = content.replace(/href="\/content\/[^\/]+\/[^\/]+\//g, `href="${prefix}content/`);
  await fs.writeFile(filePath, content, 'utf-8');
}

async function fixHtmlPaths(dir, tenantRoot) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await fixHtmlPaths(full, tenantRoot);
    else if (entry.name.endsWith('.html')) await fixHtmlFile(full, tenantRoot);
  }
}

async function cleanTxtFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await cleanTxtFiles(full);
    else if (entry.name.endsWith('.txt') && entry.name.startsWith('__next'))
      await fs.unlink(full).catch(() => {});
  }
}

// ── Resolve tenant type ───────────────────────────────────────────────────────

async function resolveTenantType(id) {
  const inDoctors = await exists(path.join(contentDir, 'doctors', id));
  if (inDoctors) return 'doctor';
  const inHospitals = await exists(path.join(contentDir, 'hospitals', id));
  if (inHospitals) return 'hospital';
  return null;
}

// ── Assemble site ─────────────────────────────────────────────────────────────

async function assembleSite(id, type) {
  const typeDir = path.join(sitesDir, type + 's');
  const tenantDistDir = path.join(typeDir, id);
  const tenantSourceDir = path.join(nextDir, 'server', 'app', 'site', id);
  const rootHtmlSource = path.join(nextDir, 'server', 'app', 'site', `${id}.html`);

  await fs.mkdir(tenantDistDir, { recursive: true });

  // Copy _next/static
  await copyDir(path.join(nextDir, 'static'), path.join(tenantDistDir, '_next', 'static'));

  // Copy pre-rendered HTML pages
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

  // Set up index.html
  const homeHtml = path.join(tenantDistDir, 'home.html');
  const indexHtml = path.join(tenantDistDir, 'index.html');
  if (await exists(homeHtml)) {
    await fs.copyFile(homeHtml, indexHtml);
  } else if (await exists(rootHtmlSource)) {
    const rootContent = await fs.readFile(rootHtmlSource, 'utf-8');
    if (!rootContent.includes('NEXT_REDIRECT')) {
      await fs.copyFile(rootHtmlSource, indexHtml);
      await fs.copyFile(rootHtmlSource, homeHtml);
    }
  }

  await fixHtmlPaths(tenantDistDir, tenantDistDir);
  await cleanTxtFiles(tenantDistDir);

  // Copy tenant content (images, etc.)
  const tenantContentDir = path.join(rootDir, 'public', 'content', type + 's', id);
  if (await exists(tenantContentDir)) {
    const contentDestDir = path.join(tenantDistDir, 'content');
    await fs.mkdir(contentDestDir, { recursive: true });
    const entries = await fs.readdir(tenantContentDir);
    for (const entry of entries) {
      const src = path.join(tenantContentDir, entry);
      const dest = path.join(contentDestDir, entry);
      (await fs.stat(src)).isDirectory()
        ? await copyDir(src, dest)
        : await fs.copyFile(src, dest);
    }
  }

  // Copy public assets
  for (const asset of ['favicon.ico', 'robots.txt']) {
    const src = path.join(rootDir, 'public', asset);
    if (await exists(src)) await fs.copyFile(src, path.join(tenantDistDir, asset)).catch(() => {});
  }

  // Generate sitemap.xml from page slugs
  await generateSitemap(id, type, tenantDistDir);

  return tenantDistDir;
}

async function generateSitemap(id, type, tenantDistDir) {
  const pagesDir = path.join(contentDir, type + 's', id, 'pages');
  const siteJson = path.join(contentDir, type + 's', id, 'site', 'index.json');

  let domain = `${id}.surge.sh`;
  try {
    const siteData = JSON.parse(await fs.readFile(siteJson, 'utf-8'));
    const settings = Array.isArray(siteData.settings) ? siteData.settings : [];
    const domainBlock = settings.find(s => s._template === 'domains');
    if (domainBlock?.primary) domain = domainBlock.primary;
  } catch { /* use default */ }

  const baseUrl = domain.startsWith('http') ? domain.replace(/\/$/, '') : `https://${domain}`;
  const urls = [];

  if (await exists(pagesDir)) {
    const entries = await fs.readdir(pagesDir);
    for (const file of entries) {
      if (!file.endsWith('.json')) continue;
      const slug = file.replace(/\.json$/, '');
      try {
        const pageData = JSON.parse(await fs.readFile(path.join(pagesDir, file), 'utf-8'));
        const urlSettings = Array.isArray(pageData.settings)
          ? pageData.settings.find(s => s._template === 'urlSettings')
          : undefined;
        const isHome = urlSettings?.isHome ?? slug === 'home';
        const pagePath = isHome ? '' : (urlSettings?.path ?? slug);
        urls.push({ loc: `${baseUrl}/${pagePath}`.replace(/\/+$/, ''), isHome });
      } catch {
        urls.push({ loc: `${baseUrl}/${slug}`, isHome: slug === 'home' });
      }
    }
  }

  // Home page first
  urls.sort((a, b) => (b.isHome ? 1 : 0) - (a.isHome ? 1 : 0));

  const now = new Date().toISOString().split('T')[0];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, isHome }) => [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      `    <changefreq>${isHome ? 'weekly' : 'monthly'}</changefreq>`,
      `    <priority>${isHome ? '1.0' : '0.8'}</priority>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
  ].join('\n');

  await fs.writeFile(path.join(tenantDistDir, 'sitemap.xml'), xml, 'utf-8');
  console.log(`   ✓ sitemap.xml (${urls.length} URL${urls.length !== 1 ? 's' : ''})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🎯 Target tenant: ${tenantId}\n`);

  // Resolve type
  const type = await resolveTenantType(tenantId);
  if (!type) {
    console.error(`❌ Tenant "${tenantId}" not found in content/doctors or content/hospitals`);
    process.exit(1);
  }
  console.log(`   Type: ${type}`);

  // Optional full Next.js build
  if (shouldBuild) {
    console.log('\n🏗️  Running Next.js build...');
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  } else {
    const nextExists = await exists(nextDir);
    if (!nextExists) {
      console.error('❌ No .next build found. Run with --build flag or run `npm run build` first.');
      process.exit(1);
    }
    console.log('   Using existing .next build (pass --build to rebuild)');
  }

  // Assemble tenant site
  console.log(`\n📦 Assembling site for ${tenantId}...`);
  const tenantDistDir = await assembleSite(tenantId, type);
  console.log(`   ✓ ${tenantDistDir}`);

  // Check for surge CLI
  try {
    execSync('surge --version', { stdio: 'ignore' });
  } catch {
    console.error('\n❌ Surge CLI not found. Install with: npm install -g surge');
    process.exit(1);
  }

  // Deploy
  const domain = `${tenantId}.surge.sh`;
  console.log(`\n📤 Deploying to Surge.sh (${domain})...`);
  execSync(`surge "${tenantDistDir}" "${domain}"`, { stdio: 'inherit', cwd: rootDir });
  console.log(`\n✅ Deployed ${tenantId} → https://${domain}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
