"use client";

/**
 * @file src/blocks/shared/MarkdownText.tsx
 *
 * Renders body / description / bio content.
 *
 * Supports two storage formats:
 *   • HTML string (from the richtext WYSIWYG editor) — used directly.
 *   • Plain text / markdown — converted via parseMarkdown().
 *
 * HTML detection: if the trimmed value starts with a tag (e.g. "<p", "<h2",
 * "<ul", "<strong") it is treated as HTML; otherwise as markdown/plain text.
 *
 * Extracted verbatim from SiteRenderer.tsx.
 */

import React from "react";
import type { CSSProperties } from "react";

// ── Markdown parser (minimal, no external dependency) ─────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safehref(url: string): string {
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed)) return "#";
  return trimmed;
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      (_, label, url) =>
        `<a href="${escapeHtml(safehref(url))}" style="color:var(--primary)">${label}</a>`,
    );
}

function parseMarkdown(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs
    .map((para) => {
      const lines = para.split("\n");
      const listItems = lines.filter((l) => /^[-*]\s/.test(l));

      if (listItems.length === lines.length) {
        const lis = lines
          .map((l) => `<li>${inlineMarkdown(l.replace(/^[-*]\s/, ""))}</li>`)
          .join("");
        return `<ul style="padding-left:1.4em;margin:0.5em 0">${lis}</ul>`;
      }

      const content = lines.map(inlineMarkdown).join("<br>");
      return `<p style="margin:0 0 0.75em">${content}</p>`;
    })
    .join("");
}

// ── Component ──────────────────────────────────────────────────────────────

export function MarkdownText({
  children,
  editPath,
  style,
}: {
  children?: string;
  editPath?: string;
  style?: CSSProperties;
}) {
  if (!children) return null;

  const isHtml = /^<[a-zA-Z]/.test(children.trim());
  const html   = isHtml ? children : parseMarkdown(children);

  return (
    <div
      data-edit-path={editPath}
      style={{ fontFamily: "var(--body)", lineHeight: 1.7, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
