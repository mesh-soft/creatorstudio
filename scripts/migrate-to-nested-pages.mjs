import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(__dirname, "..", "content");

function migrateTenantFolders(tenantType) {
  const directory = path.join(contentRoot, tenantType);
  if (!fs.existsSync(directory)) {
    console.log(`No ${tenantType} directory found, skipping.`);
    return;
  }

  const tenantSlugs = fs
    .readdirSync(directory)
    .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory());

  console.log(`Migrating ${tenantSlugs.length} ${tenantType} tenants...`);

  for (const tenantSlug of tenantSlugs) {
    migrateTenant(directory, tenantSlug);
  }
}

function migrateTenant(directory, tenantSlug) {
  const tenantDirectory = path.join(directory, tenantSlug);
  const siteFile = path.join(tenantDirectory, "site.json");
  const pagesDirectory = path.join(tenantDirectory, "pages");
  const backupDirectory = path.join(tenantDirectory, "pages-backup");

  // Check if already migrated (has pages array in site.json)
  if (fs.existsSync(siteFile)) {
    const siteContent = JSON.parse(fs.readFileSync(siteFile, "utf8"));
    if (siteContent.pages && Array.isArray(siteContent.pages)) {
      console.log(`  ${tenantSlug}: Already migrated, skipping.`);
      return;
    }
  }

  // Check if old structure exists
  if (!fs.existsSync(siteFile) || !fs.existsSync(pagesDirectory)) {
    console.log(`  ${tenantSlug}: Old structure not found, skipping.`);
    return;
  }

  // Read site.json
  const siteContent = JSON.parse(fs.readFileSync(siteFile, "utf8"));

  // Read all page files
  const pageFiles = fs.readdirSync(pagesDirectory).filter((file) => file.endsWith(".json"));
  const pages = pageFiles.map((file) => {
    const pagePath = path.join(pagesDirectory, file);
    return JSON.parse(fs.readFileSync(pagePath, "utf8"));
  });

  // Add pages to site content
  siteContent.pages = pages;

  // Backup old pages directory
  if (fs.existsSync(backupDirectory)) {
    fs.rmSync(backupDirectory, { recursive: true, force: true });
  }
  fs.renameSync(pagesDirectory, backupDirectory);

  // Write new site.json
  fs.writeFileSync(siteFile, JSON.stringify(siteContent, null, 2));

  console.log(`  ${tenantSlug}: Migrated successfully (${pages.length} pages)`);
}

// Run migration
console.log("Starting migration to nested pages structure...\n");

migrateTenantFolders("doctors");
migrateTenantFolders("hospitals");

console.log("\nMigration complete!");
console.log("Old pages directories have been backed up as 'pages-backup'.");
console.log("Please review the changes and delete the backups if everything looks correct.");
