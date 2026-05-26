/**
 * content-sync.mjs
 *
 * Watches the content/ directory and auto-commits + pushes to GitHub
 * whenever TinaCMS saves a file.  Designed to run alongside `pnpm dev`
 * on a hosted server (Railway, Render, VPS, etc.) so edits made in the
 * browser are immediately pushed to the remote repo.
 *
 * Required env vars:
 *   GIT_AUTHOR_NAME   – commit author name  (default: "Content Sync")
 *   GIT_AUTHOR_EMAIL  – commit author email (default: "sync@localhost")
 *   GIT_REMOTE        – remote name         (default: "origin")
 *   GIT_BRANCH        – branch to push to   (default: current branch)
 *
 * Optional – only needed if the repo remote uses HTTPS + token auth:
 *   GIT_TOKEN         – GitHub personal access token
 *   GIT_REPO_URL      – full HTTPS repo URL (e.g. https://github.com/user/repo)
 *                       If set, the remote is rewritten to embed the token.
 *
 * Usage (standalone):
 *   node scripts/content-sync.mjs
 *
 * Usage (alongside dev server in package.json):
 *   "dev:cloud": "concurrently \"pnpm dev\" \"node scripts/content-sync.mjs\""
 */

import { watch } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const AUTHOR_NAME  = process.env.GIT_AUTHOR_NAME  || "Content Sync";
const AUTHOR_EMAIL = process.env.GIT_AUTHOR_EMAIL || "sync@localhost";
const REMOTE       = process.env.GIT_REMOTE       || "origin";
const GIT_TOKEN    = process.env.GIT_TOKEN;
const REPO_URL     = process.env.GIT_REPO_URL;

// ── Embed token into remote URL once at startup ───────────────────────────────
if (GIT_TOKEN && REPO_URL) {
  try {
    const url = new URL(REPO_URL);
    url.username = "x-token";
    url.password = GIT_TOKEN;
    git(`remote set-url ${REMOTE} ${url.toString()}`);
    console.log(`[sync] Remote "${REMOTE}" configured with token auth.`);
  } catch {
    console.error("[sync] Could not parse GIT_REPO_URL — skipping token injection.");
  }
}

// ── Configure git identity (needed in headless environments) ──────────────────
git(`config user.name "${AUTHOR_NAME}"`);
git(`config user.email "${AUTHOR_EMAIL}"`);

// ── Determine branch ──────────────────────────────────────────────────────────
const BRANCH = process.env.GIT_BRANCH || currentBranch();

console.log(`[sync] Watching content/ — will push to ${REMOTE}/${BRANCH}`);

// ── File watcher with debounce ────────────────────────────────────────────────
const contentDir = path.join(repoRoot, "content");
let debounceTimer = null;
let pending = false;

watch(contentDir, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  pending = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(commitAndPush, 1500); // wait 1.5s after last change
});

function commitAndPush() {
  if (!pending) return;
  pending = false;

  console.log("[sync] Content changed — committing…");

  try {
    // Stage only the content directory (never accidentally stage .env etc.)
    git("add content/");

    // Check if there's anything to commit
    const status = spawnSync("git", ["diff", "--cached", "--name-only"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const changedFiles = status.stdout.trim();
    if (!changedFiles) {
      console.log("[sync] Nothing new to commit.");
      return;
    }

    const timestamp = new Date().toISOString();
    git(`commit -m "content: auto-save ${timestamp}"`);
    git(`push ${REMOTE} HEAD:${BRANCH}`);

    console.log(`[sync] Pushed ${changedFiles.split("\n").length} file(s) to ${REMOTE}/${BRANCH}`);
    changedFiles.split("\n").forEach((f) => console.log(`  • ${f}`));
  } catch (err) {
    console.error("[sync] Git operation failed:", err.message);
    // Don't crash — TinaCMS keeps working, next save will retry
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function git(cmd) {
  execSync(`git ${cmd}`, { cwd: repoRoot, stdio: "pipe" });
}

function currentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return "main";
  }
}
