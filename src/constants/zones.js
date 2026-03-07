// Travel zone constants
export const ZONES = {
  GREEN: "V",
  AMBER: "A",
  RED: "R",
};

export const ZONE_COLORS = {
  [ZONES.AMBER]: "#f59e0b",
  [ZONES.RED]: "#ef4444",
  [ZONES.GREEN]: "#10b981",
};

// Helper to get zone color
export const getZoneColor = (zone) => {
  return ZONE_COLORS[zone] || ZONE_COLORS[ZONES.GREEN];
};
