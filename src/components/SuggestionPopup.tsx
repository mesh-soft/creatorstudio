"use client";

import { useEffect, useRef, useState } from "react";
import { getSuggestions, type SuggestionContext } from "../lib/catchphrases";

interface SuggestionPopupProps {
  anchorEl: HTMLElement;
  context: SuggestionContext;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SuggestionPopup({ anchorEl, context, onSelect, onClose }: SuggestionPopupProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(getSuggestions(context));
  }, [context]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (suggestions.length === 0) return null;

  const rect = anchorEl.getBoundingClientRect();
  const iframeEl = anchorEl.ownerDocument.defaultView?.frameElement as HTMLElement | null;
  const iframeRect = iframeEl?.getBoundingClientRect();
  const top = rect.bottom + 4 + (iframeRect?.top ?? 0);
  const left = rect.left + (iframeRect?.left ?? 0);
  const style: React.CSSProperties = {
    position: "fixed",
    top,
    left,
    minWidth: Math.max(rect.width, 320),
    maxWidth: 480,
    zIndex: 999999,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "8px 0",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    color: "#e2e8f0",
  };

  return (
    <div ref={popupRef} style={style}>
      <div
        style={{
          padding: "4px 12px 8px",
          borderBottom: "1px solid #334155",
          fontSize: "11px",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Suggestions</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(suggestion);
              onClose();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: "none",
              border: "none",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: "13px",
              lineHeight: 1.5,
              borderBottom: index < suggestions.length - 1 ? "1px solid #1e293b" : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#334155";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
