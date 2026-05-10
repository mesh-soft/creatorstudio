import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, "content");
const backupRoot = path.join(projectRoot, "content-history", "migration-backup");

const groups = [
  { type: "doctor", folder: "doctors" },
  { type: "hospital", folder: "hospitals" },
];

for (const group of groups) {
  const groupDir = path.join(contentRoot, group.folder);
  if (!fs.existsSync(groupDir)) continue;

  const entries = fs.readdirSync(groupDir).filter((entry) => entry.endsWith(".json"));
  for (const file of entries) {
    const filePath = path.join(groupDir, file);
    const slug = file.replace(/\.json$/i, "");
    const tenantDir = path.join(groupDir, slug);
    const siteFile = path.join(tenantDir, "site.json");
    const pagesDir = path.join(tenantDir, "pages");
    const homeFile = path.join(pagesDir, "home.json");

    if (fs.existsSync(siteFile) && fs.existsSync(homeFile)) {
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);

    const site = {
      tenantId: json.tenantId ?? slug,
      tenantType: json.tenantType ?? group.type,
      status: json.status ?? "trial",
      subscription: json.subscription ?? {},
      domains: json.domains ?? {},
      profile: json.profile ?? {},
      business: json.business ?? {},
      presentation: json.presentation ?? {},
      seo: json.seo ?? {},
    };

    const page = {
      slug: "home",
      title: "Home",
      path: "/",
      isHome: true,
      content: json.content ?? {},
    };

    fs.mkdirSync(tenantDir, { recursive: true });
    fs.mkdirSync(pagesDir, { recursive: true });
    fs.mkdirSync(path.join(projectRoot, "public", "content", group.folder, slug, "media"), {
      recursive: true,
    });
    fs.writeFileSync(siteFile, JSON.stringify(site, null, 2));
    fs.writeFileSync(homeFile, JSON.stringify(page, null, 2));

    const backupDir = path.join(backupRoot, group.folder);
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(filePath, path.join(backupDir, file));

    fs.unlinkSync(filePath);
    console.log(`Migrated ${group.folder}/${file} -> ${group.folder}/${slug}/`);
  }
}

console.log("Migration complete.");
