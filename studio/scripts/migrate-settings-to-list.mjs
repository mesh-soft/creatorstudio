import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

function migrateFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!data) return;

    let modified = false;

    // We only migrate if there isn't already a settings array
    if (!data.settings || !Array.isArray(data.settings)) {
      const settings = [];

      // Migrate URL Settings
      if (data.slug || data.title || data.path || data.isHome !== undefined) {
        settings.push({
          _template: "urlSettings",
          slug: data.slug,
          title: data.title,
          path: data.path,
          isHome: data.isHome,
        });
        delete data.slug;
        delete data.title;
        delete data.path;
        delete data.isHome;
        modified = true;
      }

      // Migrate Presentation
      if (data.presentation) {
        settings.push({
          _template: "presentation",
          ...data.presentation,
        });
        delete data.presentation;
        modified = true;
      }

      // Migrate SEO
      if (data.seo) {
        settings.push({
          _template: "seo",
          ...data.seo,
        });
        delete data.seo;
        modified = true;
      }

      if (settings.length > 0) {
        data.settings = settings;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Migrated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to migrate ${filePath}:`, err.message);
  }
}

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      // Only migrate files in "pages" directory or if they are page files
      if (fullPath.includes("/pages/")) {
        migrateFile(fullPath);
      }
    }
  }
}

console.log("Migrating page files to new settings list format...");
processDirectory(path.join(contentDir, "doctors"));
processDirectory(path.join(contentDir, "hospitals"));
console.log("Migration complete!");
