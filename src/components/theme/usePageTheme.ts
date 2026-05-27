"use client";

import { useState, useEffect, useCallback } from "react";

export const dark = {
  shell: "#0c0a14", surface: "#1a172b", input: "#0e0c1a",
  border: "#2d2748", borderMd: "#3d3660", text: "#ede9f8",
  textSub: "#9488bc", textMute: "#5a5080", textDim: "#3d3660",
  accent: "#79589f", accentHov: "#6b3fa0", red: "#f87171",
  green: "#10b981", shadow: "0 8px 32px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.12)",
};

export const light = {
  shell: "#F5F6F7", surface: "#FFFFFF", input: "#FFFFFF",
  border: "#E4E7EB", borderMd: "#C8CBD0", text: "#1F2531",
  textSub: "#4B5563", textMute: "#68737A", textDim: "#A0ADB8",
  accent: "#79589f", accentHov: "#6b3fa0", red: "#C0392B",
  green: "#1E8449", shadow: "0 1px 3px rgba(0,0,0,.08),0 0 0 1px rgba(200,203,208,.5)",
};

export type ThemeTokens = typeof dark;

export function usePageTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor-theme");
      if (saved === "light") setIsDark(false);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("editor-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  const T = isDark ? dark : light;
  return { T, isDark, toggle };
}
