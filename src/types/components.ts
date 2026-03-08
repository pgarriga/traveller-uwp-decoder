import type { ReactNode } from "react";
import type { Theme } from "./theme";
import type { TranslationFunction } from "./i18n";
import type { ParsedUWP, RecentPlanet, ViewType, ZoneCode } from "./uwp";

// Button component types
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "nav"
  | "nav-mobile"
  | "option"
  | "icon"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  theme?: Theme;
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

// Common props passed to most components
export interface CommonProps {
  theme: Theme;
  t: TranslationFunction;
}

// Navbar props
export interface NavbarProps extends CommonProps {
  view: ViewType;
  onNavigate: (view: ViewType) => void;
}

// Section component props
export interface SectionProps {
  title: string;
  color?: string;
  theme: Theme;
  children: ReactNode;
}

// Row component props
export interface RowProps {
  label: string;
  value: string;
  theme: Theme;
  warn?: boolean;
}

// Badge component props
export interface BadgeProps {
  children: ReactNode;
  color?: string;
  theme?: Theme;
}

// Footer component props
export interface FooterProps extends CommonProps {
  showVersion?: boolean;
}

// View props
export interface DecoderViewProps extends CommonProps {
  onNavigate: (view: ViewType) => void;
  onDecode: (uwp: string, name: string, zone: ZoneCode) => void;
}

export interface RecentViewProps extends CommonProps {
  recentPlanets: RecentPlanet[];
  onSelect: (planet: RecentPlanet) => void;
  onDelete: (uwp: string) => void;
  onClearAll: () => void;
  onNavigate: (view: ViewType) => void;
}

export interface PlanetViewProps extends CommonProps {
  uwp: string;
  parsed: ParsedUWP;
  planetName: string;
  zone: ZoneCode;
  onBack: () => void;
  onEdit: () => void;
  onUpdateZone: (zone: ZoneCode) => void;
  onUpdateName: (name: string) => void;
  lang: string;
}

export interface SettingsViewProps extends CommonProps {
  themeMode: string;
  setThemeMode: (mode: string) => void;
  langMode: string;
  setLangMode: (mode: string) => void;
}
