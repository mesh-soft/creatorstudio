/**
 * Scans a parsed JSON object (site or page) for relative image paths.
 * Pure TS — no Node.js / Next.js imports — safe on both client and server.
 *
 * "Relative" means the path starts with /content/ — the convention used
 * by this platform for media stored in public/content/{type}s/{tenantId}/.
 *
 * External URLs (https://...) are ignored — they don't need to be uploaded.
 */

const RELATIVE_PREFIX = "/content/";

// All object keys that hold image URLs in our block/site schemas
const IMAGE_KEYS = new Set([
  "photo",
  "src",
  "backgroundImage",
  "logo",
  "ogImage",
  "image",
]);

/** Recursively walk a JSON value and collect all relative image paths. */
function walk(node: unknown, found: Set<string>): void {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) walk(item, found);
    return;
  }

  const obj = node as Record<string, unknown>;
  for (const [key, val] of Object.entries(obj)) {
    if (IMAGE_KEYS.has(key) && typeof val === "string" && val.startsWith(RELATIVE_PREFIX)) {
      found.add(val);
    }
    // Always recurse — image fields can be nested inside items[], buttons[], settings[], etc.
    if (val && typeof val === "object") walk(val, found);
  }
}

/**
 * Returns every unique relative image path found in the JSON.
 * Example output: ["/content/doctors/dr-priya/photo.jpg", "/content/doctors/dr-priya/clinic.jpg"]
 */
export function scanImages(data: Record<string, unknown>): string[] {
  const found = new Set<string>();
  walk(data, found);
  return [...found].sort();
}

/**
 * Given a relative image path like /content/doctors/dr-priya/photo.jpg,
 * returns just the filename: "photo.jpg"
 */
export function filenameFromPath(imagePath: string): string {
  return imagePath.split("/").at(-1) ?? imagePath;
}

/**
 * Given a set of uploaded File objects, return a Set of their sanitised names.
 * Uses the same sanitisation the media API applies when it writes to disk.
 */
export function uploadedFilenames(files: File[]): Set<string> {
  return new Set(
    files.map(f =>
      f.name
        .normalize("NFC")
        .replace(/[^\w.\- ]/g, "_")
        .replace(/\s+/g, "_"),
    ),
  );
}

export interface ImageScanResult {
  /** All relative image paths found in the JSON */
  all: string[];
  /** Paths whose filename matches one of the uploaded files */
  covered: string[];
  /** Paths that are NOT covered by any uploaded file */
  missing: string[];
}

/**
 * Cross-reference the images found in the JSON against:
 *   1. uploadedFiles — files the user is uploading right now
 *   2. existingFilenames — filenames already on disk (from GET /api/content/media)
 */
export function auditImages(
  data: Record<string, unknown>,
  uploadedFiles: File[],
  existingFilenames: string[] = [],
): ImageScanResult {
  const all      = scanImages(data);
  const uploaded = uploadedFilenames(uploadedFiles);
  const existing = new Set(existingFilenames);

  const covered: string[] = [];
  const missing: string[] = [];

  for (const imgPath of all) {
    const fname = filenameFromPath(imgPath);
    if (uploaded.has(fname) || existing.has(fname)) {
      covered.push(imgPath);
    } else {
      missing.push(imgPath);
    }
  }

  return { all, covered, missing };
}
