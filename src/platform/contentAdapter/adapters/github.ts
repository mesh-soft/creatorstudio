import { Octokit } from "@octokit/rest";
import type { ContentAdapter, ContentEntry } from "../types";

export interface GitHubAdapterOptions {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export class GitHubAdapter implements ContentAdapter {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(opts: GitHubAdapterOptions) {
    this.octokit = new Octokit({ auth: opts.token });
    this.owner = opts.owner;
    this.repo = opts.repo;
    this.branch = opts.branch;
  }

  async read(p: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner, repo: this.repo, path: p, ref: this.branch,
    });
    if (Array.isArray(data)) throw new Error(`Path is a directory: ${p}`);
    const file = data as { content?: string; encoding?: string };
    if (!file.content) throw new Error(`No content at: ${p}`);
    return Buffer.from(file.content, "base64").toString("utf8");
  }

  async write(p: string, content: string): Promise<void> {
    let sha: string | undefined;
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner, repo: this.repo, path: p, ref: this.branch,
      });
      if (!Array.isArray(data)) sha = (data as any).sha;
    } catch {}

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner, repo: this.repo, path: p,
      message: `Update ${p}`,
      content: Buffer.from(content).toString("base64"),
      branch: this.branch, sha,
    });
  }

  async delete(p: string): Promise<void> {
    let sha: string | undefined;
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner, repo: this.repo, path: p, ref: this.branch,
      });
      if (!Array.isArray(data)) sha = (data as any).sha;
    } catch { return; }

    if (sha) {
      await this.octokit.repos.deleteFile({
        owner: this.owner, repo: this.repo, path: p,
        message: `Delete ${p}`, branch: this.branch, sha,
      });
    }
  }

  async list(dir: string): Promise<ContentEntry[]> {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner, repo: this.repo, path: dir, ref: this.branch,
    });
    const items = Array.isArray(data) ? data : [];
    return items.map((item: any) => ({
      name: item.name,
      type: item.type === "dir" ? "dir" : "file",
    }));
  }

  async exists(p: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner: this.owner, repo: this.repo, path: p, ref: this.branch,
      });
      return true;
    } catch { return false; }
  }
}
