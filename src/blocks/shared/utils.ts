/**
 * @file src/blocks/shared/utils.ts
 *
 * Shared utility functions used across block site renderers.
 */

import { iconElement } from "../../lib/icons";
import type React from "react";

/**
 * Safely coerce a value to an array.
 * Returns the value itself when it is already an array, otherwise `[]`.
 *
 * Prevents "block.items.map is not a function" crashes when JSON data is
 * missing or malformed.
 */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Render an icon as a React element using the shared SVG icon library.
 * Returns `null` when the icon name is unknown.
 */
export function iconFor(icon?: string): React.ReactElement | null {
  return iconElement(icon, { width: "1.1em", height: "1.1em" });
}

/**
 * Emoji fallback map used in the Header nav links (icon displayed inline).
 * Prefer `iconFor()` for block content; this is a lightweight alternative
 * for the header where SVG elements would affect layout.
 */
export function iconToEmoji(icon: string): string {
  const map: Record<string, string> = {
    stethoscope:  "🩺",
    "heart-pulse": "💗",
    syringe:      "💉",
    bandage:      "🩹",
    pill:         "💊",
    thermometer:  "🌡️",
    brain:        "🧠",
    bone:         "🦴",
    heart:        "❤️",
    lungs:        "🫁",
    tooth:        "🦷",
    eye:          "👁️",
    baby:         "👶",
    dna:          "🧬",
    microscope:   "🔬",
    ambulance:    "🚑",
    hospital:     "🏥",
    ribbon:       "🎗️",
    siren:        "🚨",
    activity:     "📈",
    users:        "👥",
    "user-check": "🥼",
    smile:        "😊",
    award:        "🏆",
    certificate:  "📜",
    shield:       "🛡️",
    star:         "⭐",
    check:        "✅",
    lock:         "🔒",
    verified:     "✔️",
    calendar:     "📅",
    clock:        "⏰",
    phone:        "📞",
    mail:         "✉️",
    "map-pin":    "📍",
    whatsapp:     "💬",
    video:        "📹",
    globe:        "🌐",
    building:     "🏢",
    home:         "🏠",
    car:          "🚗",
    chart:        "📊",
    document:     "📄",
    sparkles:     "✨",
    zap:          "⚡",
    leaf:         "🌿",
    sun:          "☀️",
    info:         "ℹ️",
    "arrow-right": "→",
  };
  return map[icon] ?? "";
}
