import type { StarportClass, ParsedUWP } from "../types/uwp";
import type { StarportData } from "../types/game-data";

// UWP parsing and validation utilities

// UWP pattern: letter (A-E or X) + 6 hex digits + optional dash + 1 hex digit (tech level)
export const UWP_PATTERN = /[ABCDEX][0-9A-F]{6}[-\s]?[0-9A-F]/gi;

// Convert hex character to number
export const hex = (v: string): number => parseInt(v, 16);

// Type for starport lookup object
type StarportLookup = Record<StarportClass, StarportData>;

// Internal parsed type with different property names
interface InternalParsedUWP {
  sp: StarportClass;
  sz: number;
  at: number;
  hy: number;
  po: number;
  go: number;
  la: number;
  tl: number;
}

// Parse UWP string into components
export const parseUwp = (uwpString: string, STARPORT: StarportLookup): InternalParsedUWP | null => {
  const clean = uwpString.replace(/\s|-/g, "").toUpperCase();
  if (clean.length < 8) return null;

  const sp = clean[0] as StarportClass;
  if (!STARPORT[sp]) return null;

  const vals: number[] = [];
  for (let i = 1; i < 8; i++) {
    const v = hex(clean[i]);
    if (isNaN(v)) return null;
    vals.push(v);
  }

  const [sz, at, hy, po, go, la] = vals;
  const tl = clean.length >= 9 ? hex(clean[clean.length - 1]) : vals[6];

  return { sp, sz, at, hy, po, go, la, tl };
};

// Format UWP string with dash
export const formatUwp = (uwpString: string): string => {
  const clean = uwpString.replace(/\s/g, "").toUpperCase();
  if (clean.length === 8 && !clean.includes("-")) {
    return clean.slice(0, 7) + "-" + clean.slice(7);
  }
  return clean;
};
