import type { ThemeConfig } from "../types/theme";

// UI colors reutilizables
export const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  warning: "#f59e0b",
  danger: "#ef4444",
  success: "#10b981",
  info: "#06b6d4",
  pink: "#ec4899",
  indigo: "#6366f1",
  rose: "#f43f5e",
} as const;

// Section colors por tipo de dato UWP
export const SECTION_COLORS = {
  starport: COLORS.warning,
  size: COLORS.primary,
  atmosphere: COLORS.success,
  hydrographics: COLORS.info,
  population: COLORS.secondary,
  government: COLORS.pink,
  lawLevel: COLORS.rose,
  techLevel: COLORS.indigo,
} as const;

// Theme colors
export const THEMES: ThemeConfig = {
  dark: {
    bg: "#0f172a",
    bgCard: "#1e293b",
    bgHeader: "linear-gradient(135deg, #1e3a5f, #1e293b)",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textDimmed: "#64748b",
    border: "#334155",
    navBg: "#1e293b",
  },
  light: {
    bg: "#f1f5f9",
    bgCard: "#ffffff",
    bgHeader: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
    text: "#1e293b",
    textMuted: "#475569",
    textDimmed: "#64748b",
    border: "#cbd5e1",
    navBg: "#ffffff",
  }
} as const;
