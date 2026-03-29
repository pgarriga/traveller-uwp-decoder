// i18n type definitions

export type Language = "es" | "en";

export type LangMode = "auto" | Language;

// Translation function type
export type TranslationFunction = (key: string) => string;

// All available translation keys
export type TranslationKey =
  // Header
  | "subtitle"
  | "title"
  // Form labels
  | "worldName"
  | "zone"
  | "zoneGreen"
  | "zoneAmber"
  | "zoneRed"
  | "uwpCode"
  | "uwpPlaceholder"
  // Buttons
  | "viewRecent"
  | "decode"
  | "newScan"
  // Recent planets
  | "recentPlanets"
  | "noRecentPlanets"
  | "delete"
  | "clearAll"
  // Planet display
  | "unnamed"
  | "zoneLabel"
  // Invalid UWP
  | "invalidUwp"
  // Section titles
  | "starport"
  | "class"
  | "size"
  | "atmosphere"
  | "hydrographics"
  | "population"
  | "government"
  | "lawLevel"
  | "techLevel"
  | "travelZone"
  // Starport labels
  | "quality"
  | "fuel"
  | "berth"
  | "services"
  | "possibleBases"
  // Size labels
  | "diameter"
  | "gravity"
  | "example"
  | "description"
  | "lowGravity"
  | "highGravity"
  | "gravityWarning"
  // Atmosphere labels
  | "composition"
  | "pressure"
  | "equipRequired"
  | "danger"
  | "dangerousAtmo"
  | "unknown"
  // Hydrographics labels
  | "liquidCoverage"
  | "liquidNote"
  // Population labels
  | "inhabitants"
  | "level"
  | "uninhabitedNote"
  | "smallColonyNote"
  // Government labels
  | "type"
  | "commonContraband"
  // Law labels
  | "bannedWeapons"
  | "bannedArmor"
  | "noRestrictions"
  | "martialLaw"
  | "allWeaponsArmorBanned"
  | "note"
  // Tech level
  | "tl"
  | "equivalent"
  | "primitive"
  | "preindustrial"
  | "industrial"
  | "preatomic"
  | "earlySpace"
  | "earlyStellar"
  | "midStellar"
  | "advancedStellar"
  | "communications"
  | "noTelecom"
  | "radioPhone"
  | "fullNetwork"
  // Travel zone
  | "amberCaution"
  | "redProhibited"
  | "code"
  | "meaning"
  | "amberMeaning"
  | "redMeaning"
  // Footer
  | "worldLine"
  | "disclaimer"
  | "manualNote"
  // None/varies
  | "none"
  | "varies"
  | "na"
  | "free"
  // Scanner
  | "home"
  | "scan"
  | "scanning"
  | "scanError"
  | "or"
  | "enterManually"
  | "noUwpFound"
  | "uwpDetected"
  | "nameDetected"
  | "loadingOcr"
  // Saved planets page
  | "back"
  | "viewInfo"
  | "confirmDelete"
  | "planetCount"
  | "edit"
  | "newPlanet"
  // Settings
  | "settings"
  | "theme"
  | "themeAuto"
  | "themeDark"
  | "themeLight"
  | "themeDescription"
  | "language"
  | "langAuto"
  | "langEs"
  | "langEn"
  | "langDescription";
