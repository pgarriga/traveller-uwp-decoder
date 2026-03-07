// UWP parsing and validation utilities

// UWP pattern: letter (A-E or X) + 6 hex digits + optional dash + 1 hex digit (tech level)
export const UWP_PATTERN = /[ABCDEX][0-9A-F]{6}[-\s]?[0-9A-F]/gi;

// Convert hex character to number
export const hex = (v) => parseInt(v, 16);

// Parse UWP string into components
export const parseUwp = (uwpString, STARPORT) => {
  const clean = uwpString.replace(/\s|-/g, "").toUpperCase();
  if (clean.length < 8) return null;

  const sp = clean[0];
  if (!STARPORT[sp]) return null;

  const vals = [];
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
export const formatUwp = (uwpString) => {
  const clean = uwpString.replace(/\s/g, "").toUpperCase();
  if (clean.length === 8 && !clean.includes("-")) {
    return clean.slice(0, 7) + "-" + clean.slice(7);
  }
  return clean;
};
