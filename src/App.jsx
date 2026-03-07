import { useState, useMemo, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { useTranslation, getSTARPORT, getSIZE, getATMO, getHYDRO, getPOP, getGOV, getLAW_WEAPONS, getLAW_ARMOR } from "./i18n";

const hex = v => parseInt(v, 16);

// UWP pattern: letter (A-E or X) + 6 hex digits + optional dash + 1 hex digit (tech level)
const UWP_PATTERN = /[ABCDEX][0-9A-F]{6}[-\s]?[0-9A-F]/gi;

const ZONE_COLORS = { A: "#f59e0b", R: "#ef4444" };

// Flat icons (decorative, hidden from screen readers)
const IconCamera = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconClock = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconSearch = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconTrash = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconMenu = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconSettings = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const Section = ({ title, children, color = "#3b82f6", theme }) => (
  <div style={{ background: theme?.bgCard || "#1e293b", borderRadius: 12, padding: "16px 20px", marginBottom: 12, borderLeft: `4px solid ${color}` }}>
    <div className="section-title" style={{ color, fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

const Row = ({ label, value, warn, theme }) => (
  <div className="data-row">
    <span className="data-row-label" style={{ color: theme?.textMuted }}>{label}</span>
    <span className="data-row-value" style={{ color: warn ? "#f59e0b" : (theme?.text || "#e2e8f0") }}>{value}</span>
  </div>
);

const Badge = ({ text, color = "#3b82f6" }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600, margin: 2, display: "inline-block" }}>{text}</span>
);

// URL routing helpers
const getBasePath = () => {
  // Support GitHub Pages subdirectory
  const base = document.querySelector("base")?.getAttribute("href") || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const parseUrl = () => {
  const basePath = getBasePath();
  const path = window.location.pathname.replace(basePath, "") || "/";

  if (path === "/" || path === "") {
    return { view: "decoder", uwp: null };
  }
  if (path === "/recent") {
    return { view: "saved", uwp: null };
  }
  if (path === "/settings") {
    return { view: "settings", uwp: null };
  }
  const planetMatch = path.match(/^\/planet\/([A-Za-z0-9-]+)$/);
  if (planetMatch) {
    return { view: "planet", uwp: planetMatch[1].toUpperCase() };
  }
  return { view: "decoder", uwp: null };
};

const buildUrl = (view, uwp = null) => {
  const basePath = getBasePath();
  if (view === "saved") return `${basePath}/recent`;
  if (view === "settings") return `${basePath}/settings`;
  if (view === "planet" && uwp) return `${basePath}/planet/${uwp.toUpperCase()}`;
  return basePath || "/";
};

// Theme colors
const THEMES = {
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
};

export default function App() {
  const { t, lang, langMode, setLangMode } = useTranslation();
  const [uwp, setUwp] = useState("");
  const [name, setName] = useState("");
  const [zoneInput, setZoneInput] = useState("V");
  const [recentPlanets, setRecentPlanets] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [view, setView] = useState("decoder"); // "decoder" | "saved" | "planet" | "settings"
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [themeMode, setThemeMode] = useState("auto"); // "auto" | "dark" | "light"
  const fileInputRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Compute actual theme based on mode and system preference
  const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const actualTheme = themeMode === "auto" ? getSystemTheme() : themeMode;
  const theme = THEMES[actualTheme];

  // Get translated game data
  const STARPORT = useMemo(() => getSTARPORT(t)[lang], [lang, t]);
  const SIZE = useMemo(() => getSIZE(lang), [lang]);
  const ATMO = useMemo(() => getATMO(lang), [lang]);
  const HYDRO = useMemo(() => getHYDRO(lang), [lang]);
  const POP = useMemo(() => getPOP(lang), [lang]);
  const GOV = useMemo(() => getGOV(lang), [lang]);
  const LAW_WEAPONS = useMemo(() => getLAW_WEAPONS(lang), [lang]);
  const LAW_ARMOR = useMemo(() => getLAW_ARMOR(lang), [lang]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("traveller-recent");
      if (stored) {
        setRecentPlanets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent planets:", e);
      localStorage.removeItem("traveller-recent");
    }
    // Load theme preference
    const savedTheme = localStorage.getItem("traveller-theme");
    if (savedTheme && ["auto", "dark", "light"].includes(savedTheme)) {
      setThemeMode(savedTheme);
    }
    setDataLoaded(true);
  }, []);

  // Sync recentPlanets to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem("traveller-recent", JSON.stringify(recentPlanets));
    }
  }, [recentPlanets, dataLoaded]);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem("traveller-theme", themeMode);
  }, [themeMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeMode(prev => prev); // Force re-render
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [themeMode]);

  // Parse URL on initial load and load planet if needed
  useEffect(() => {
    if (!dataLoaded) return;

    const { view: urlView, uwp: urlUwp } = parseUrl();

    if (urlView === "planet" && urlUwp) {
      // Try to find planet in recent list
      const planet = recentPlanets.find(p => p.uwp.toUpperCase() === urlUwp);
      if (planet) {
        setName(planet.name);
        setUwp(planet.uwp);
        setZoneInput(planet.zone || "V");
        setView("planet");
      } else {
        // Planet not in recent, just set UWP
        setUwp(urlUwp);
        setName("");
        setZoneInput("V");
        setView("planet");
      }
    } else {
      setView(urlView);
    }
    isInitialLoad.current = false;
  }, [dataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const { view: urlView, uwp: urlUwp } = parseUrl();

      if (urlView === "planet" && urlUwp) {
        const planet = recentPlanets.find(p => p.uwp.toUpperCase() === urlUwp);
        if (planet) {
          setName(planet.name);
          setUwp(planet.uwp);
          setZoneInput(planet.zone || "V");
        } else {
          setUwp(urlUwp);
          setName("");
          setZoneInput("V");
        }
        setView("planet");
      } else if (urlView === "saved") {
        setView("saved");
      } else if (urlView === "settings") {
        setView("settings");
      } else {
        setName("");
        setUwp("");
        setZoneInput("V");
        setScanStatus("");
        setView("decoder");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [recentPlanets]);

  // Navigation functions
  const navigateTo = (newView, newUwp = null) => {
    const url = buildUrl(newView, newUwp);
    window.history.pushState({ view: newView, uwp: newUwp }, "", url);
    setView(newView);
    setMenuOpen(false);
  };

  const resetDecoder = () => {
    setName("");
    setUwp("");
    setZoneInput("V");
    setScanStatus("");
    navigateTo("decoder");
  };

  // Navbar component
  const Navbar = () => (
    <>
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: theme.navBg,
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 1000
      }}>
        {/* Logo */}
        <div
          onClick={resetDecoder}
          style={{
            fontSize: 18,
            fontWeight: 800,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            cursor: "pointer"
          }}>
          UWP Decoder
        </div>

        {/* Desktop nav links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 8 }}>
          <button
            onClick={resetDecoder}
            style={{
              background: view === "decoder" ? theme.border : "transparent",
              border: "none",
              borderRadius: 8,
              color: view === "decoder" ? theme.text : theme.textMuted,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconCamera />{t("scan")}
          </button>
          <button
            onClick={() => navigateTo("saved")}
            style={{
              background: view === "saved" ? theme.border : "transparent",
              border: "none",
              borderRadius: 8,
              color: view === "saved" ? theme.text : theme.textMuted,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconClock />{t("viewRecent")}
          </button>
          <button
            onClick={() => navigateTo("settings")}
            style={{
              background: view === "settings" ? theme.border : "transparent",
              border: "none",
              borderRadius: 8,
              color: view === "settings" ? theme.text : theme.textMuted,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconSettings />{t("settings")}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            color: theme.text,
            padding: 8,
            cursor: "pointer"
          }}>
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.bg + "ee",
            zIndex: 999,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
          <button
            onClick={resetDecoder}
            style={{
              background: view === "decoder" ? theme.border : theme.bgCard,
              border: "none",
              borderRadius: 8,
              color: theme.text,
              padding: "16px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconCamera />{t("scan")}
          </button>
          <button
            onClick={() => navigateTo("saved")}
            style={{
              background: view === "saved" ? theme.border : theme.bgCard,
              border: "none",
              borderRadius: 8,
              color: theme.text,
              padding: "16px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconClock />{t("viewRecent")}
          </button>
          <button
            onClick={() => navigateTo("settings")}
            style={{
              background: view === "settings" ? theme.border : theme.bgCard,
              border: "none",
              borderRadius: 8,
              color: theme.text,
              padding: "16px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}>
            <IconSettings />{t("settings")}
          </button>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div style={{ height: 56 }} />
    </>
  );

  const loadPlanet = (planet) => {
    setName(planet.name);
    setUwp(planet.uwp);
    setZoneInput(planet.zone || "V");

    // Move planet to top of recent list (localStorage sync handled by effect)
    const updatedPlanet = { ...planet, timestamp: Date.now() };
    setRecentPlanets(prev => {
      const filtered = prev.filter(p => p.uwp !== planet.uwp);
      return [updatedPlanet, ...filtered];
    });

    navigateTo("planet", planet.uwp);
  };

  const deletePlanet = (planetUwp) => {
    setRecentPlanets(prev => prev.filter(p => p.uwp !== planetUwp));
  };

  const clearAllPlanets = () => {
    setRecentPlanets([]);
  };

  // OCR Scanner function
  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset current values before scanning
    setUwp("");
    setName("");
    setScanStatus("");

    setScanning(true);
    setScanStatus(t("loadingOcr"));

    try {
      const worker = await createWorker("eng");
      setScanStatus(t("scanning"));

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Debug: log OCR result
      console.log("=== OCR Result ===");
      console.log(text);
      console.log("==================");

      // Find UWP codes in the text
      const matches = text.match(UWP_PATTERN);

      if (matches && matches.length > 0) {
        // Clean and format the first match
        const detectedUwp = matches[0].replace(/\s/g, "").toUpperCase();
        // Ensure proper format with dash
        const formattedUwp = detectedUwp.length === 8 && !detectedUwp.includes("-")
          ? detectedUwp.slice(0, 7) + "-" + detectedUwp.slice(7)
          : detectedUwp;
        setUwp(formattedUwp);
        setScanStatus(`${t("uwpDetected")}: ${formattedUwp}`);

        // Try to find planet name (it's BELOW the UWP code, with larger font)
        const uwpIndex = text.indexOf(matches[0]);
        const textAfter = text.slice(uwpIndex + matches[0].length, uwpIndex + matches[0].length + 150);

        // Common words to filter out
        const commonWords = [
          "THE", "AND", "FOR", "WITH", "FROM", "ZONE", "RED", "AMBER", "GREEN",
          "UWP", "WORLD", "PLANET", "STARPORT", "CLASS", "SIZE", "ATMOSPHERE",
          "POPULATION", "GOVERNMENT", "LAW", "TECH", "LEVEL", "TRAVEL", "NAME",
          "PROFILE", "UNIVERSAL", "DATA", "INFO", "SYSTEM", "SECTOR", "BASES",
          "FACILITIES", "ALLEGIANCE", "REMARKS", "TRADE", "CODES", "GAS", "GIANT"
        ];

        // Split by lines and look at the lines AFTER the UWP
        const lines = text.split(/[\n\r]+/);
        const uwpLineIndex = lines.findIndex(line => line.includes(matches[0]));

        let detectedName = null;

        // Strategy 1: Check the next few lines after UWP line
        if (uwpLineIndex >= 0) {
          for (let i = uwpLineIndex + 1; i < Math.min(uwpLineIndex + 4, lines.length); i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Clean the line
            const cleaned = line.replace(/[^a-zA-Z\s'-]/g, "").trim();

            // Skip if too short, too long, or is a common word
            if (cleaned.length < 2 || cleaned.length > 35) continue;
            if (commonWords.includes(cleaned.toUpperCase())) continue;

            // Skip if looks like a UWP code or numbers
            if (/^[ABCDEX][0-9A-F]/i.test(cleaned)) continue;

            // Found a potential name
            detectedName = cleaned.split(/\s+/).map(w =>
              w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            ).join(" ");
            break;
          }
        }

        // Strategy 2: Fallback - look for capitalized words in text after UWP
        if (!detectedName) {
          const capsPattern = /\b([A-Z][A-Za-z'-]{2,}(?:\s+[A-Z][A-Za-z'-]+)*)\b/g;
          const capsMatches = textAfter.match(capsPattern) || [];
          const filtered = capsMatches.filter(w =>
            w.length >= 3 &&
            w.length <= 35 &&
            !commonWords.includes(w.toUpperCase())
          );
          if (filtered.length > 0) {
            detectedName = filtered[0];
          }
        }

        if (detectedName) {
          setName(detectedName);
          setScanStatus(prev => `${prev} | ${t("nameDetected")}: ${detectedName}`);
        }

        // Navigate to planet detail view after successful scan
        navigateTo("planet", formattedUwp);
      } else {
        setScanStatus(t("noUwpFound"));
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setScanStatus(t("scanError"));
    } finally {
      setScanning(false);
      // Clear file input for re-scanning
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const parsed = useMemo(() => {
    const clean = uwp.replace(/\s|-/g, "").toUpperCase();
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
  }, [uwp, STARPORT]);

  // Auto-save to recent when on planet view (localStorage sync handled by separate effect)
  useEffect(() => {
    if (view === "planet" && parsed && uwp.trim()) {
      const normalizedUwp = uwp.toUpperCase();
      const planet = {
        name: name.trim() || normalizedUwp,
        uwp: normalizedUwp,
        zone: zoneInput,
        timestamp: Date.now()
      };

      setRecentPlanets(prev => {
        const filtered = prev.filter(p => p.uwp !== planet.uwp);
        return [planet, ...filtered].slice(0, 20);
      });
    }
  }, [view, uwp, parsed, name, zoneInput]);

  // Zone display name helper
  const getZoneName = (zone) => {
    if (zone === "R") return lang === "es" ? "Roja" : "Red";
    if (zone === "A") return lang === "es" ? "Ámbar" : "Amber";
    return t("zoneGreen");
  };

  // Redirect to decoder if planet view has no valid UWP
  useEffect(() => {
    if (view === "planet" && !parsed && !isInitialLoad.current) {
      navigateTo("decoder");
    }
  }, [view, parsed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Settings View
  if (view === "settings") {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          <h1 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 800 }}>{t("settings")}</h1>

          <div style={{ background: theme.bgCard, borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>{t("theme")}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["auto", "light", "dark"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    background: themeMode === mode ? "#3b82f6" : theme.border,
                    border: "none",
                    borderRadius: 8,
                    color: themeMode === mode ? "#fff" : theme.text,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}>
                  {t(mode === "auto" ? "themeAuto" : mode === "light" ? "themeLight" : "themeDark")}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: theme.textDimmed, marginTop: 12 }}>
              {t("themeDescription")}
            </div>
          </div>

          <div style={{ background: theme.bgCard, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>{t("language")}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["auto", "es", "en"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setLangMode(mode)}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    background: langMode === mode ? "#3b82f6" : theme.border,
                    border: "none",
                    borderRadius: 8,
                    color: langMode === mode ? "#fff" : theme.text,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}>
                  {t(mode === "auto" ? "langAuto" : mode === "es" ? "langEs" : "langEn")}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: theme.textDimmed, marginTop: 12 }}>
              {t("langDescription")}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: theme.textDimmed }}>
            {t("disclaimer")}<br />
            {t("manualNote")}
          </div>
        </div>
      </div>
    );
  }

  // Planet Detail View
  if (view === "planet") {
    if (!parsed) {
      return null; // Will redirect via useEffect
    }
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          {/* Planet header */}
          <div style={{ background: theme.bgHeader, borderRadius: 12, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <input
              className="planet-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t("unnamed")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "2px solid #3b82f644",
                fontWeight: 800,
                color: theme.text,
                textAlign: "center",
                width: "100%",
                marginBottom: 4,
                padding: "4px 0",
                outline: "none"
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontFamily: "monospace", fontSize: 16, color: theme.textMuted, letterSpacing: 2 }}>{uwp.toUpperCase()}</span>
              <select
                value={zoneInput}
                onChange={e => setZoneInput(e.target.value)}
                style={{
                  background: zoneInput === "R" ? "#ef444433" : zoneInput === "A" ? "#f59e0b33" : "#10b98133",
                  border: `1px solid ${zoneInput === "R" ? "#ef4444" : zoneInput === "A" ? "#f59e0b" : "#10b981"}`,
                  borderRadius: 6,
                  color: zoneInput === "R" ? "#ef4444" : zoneInput === "A" ? "#f59e0b" : "#10b981",
                  padding: "4px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                <option value="V">{t("zoneGreen")}</option>
                <option value="A">{t("zoneAmber")}</option>
                <option value="R">{t("zoneRed")}</option>
              </select>
            </div>
          </div>

          {/* Planet details */}
          <Section title={`${t("starport")} — ${t("class")} ${parsed.sp}`} color="#f59e0b" theme={theme}>
            <Row label={t("quality")} value={STARPORT[parsed.sp].name} theme={theme} />
            <Row label={t("fuel")} value={STARPORT[parsed.sp].fuel} theme={theme} />
            <Row label={t("berth")} value={STARPORT[parsed.sp].berth} theme={theme} />
            <Row label={t("services")} value={STARPORT[parsed.sp].services} theme={theme} />
            <Row label={t("possibleBases")} value={STARPORT[parsed.sp].bases} theme={theme} />
          </Section>

          <Section title={`${t("size")} — ${parsed.sz} ${SIZE[parsed.sz] ? `(${SIZE[parsed.sz].d})` : ""}`} color="#3b82f6" theme={theme}>
            {SIZE[parsed.sz] && <>
              <Row label={t("diameter")} value={SIZE[parsed.sz].d} theme={theme} />
              <Row label={t("gravity")} value={`${SIZE[parsed.sz].g}g`} theme={theme} />
              {SIZE[parsed.sz].ex && <Row label={t("example")} value={SIZE[parsed.sz].ex} theme={theme} />}
              <Row label={t("description")} value={SIZE[parsed.sz].desc} theme={theme} />
              {parsed.sz <= 6 && parsed.sz > 0 && <Row label={`⚠ ${t("gravityWarning")}`} value={t("lowGravity")} warn theme={theme} />}
              {parsed.sz >= 10 && <Row label={`⚠ ${t("gravityWarning")}`} value={t("highGravity")} warn theme={theme} />}
            </>}
          </Section>

          <Section title={`${t("atmosphere")} — ${parsed.at} (${ATMO[parsed.at]?.comp || t("unknown")})`} color="#10b981" theme={theme}>
            {ATMO[parsed.at] && <>
              <Row label={t("composition")} value={ATMO[parsed.at].comp} theme={theme} />
              <Row label={t("pressure")} value={ATMO[parsed.at].pres} theme={theme} />
              <Row label={t("equipRequired")} value={ATMO[parsed.at].equip} warn={ATMO[parsed.at].equip !== t("none") && ATMO[parsed.at].equip !== "None" && ATMO[parsed.at].equip !== "Ninguno"} theme={theme} />
              <Row label={t("description")} value={ATMO[parsed.at].desc} theme={theme} />
              {parsed.at >= 11 && <Row label={`⚠ ${t("danger")}`} value={t("dangerousAtmo")} warn theme={theme} />}
            </>}
          </Section>

          <Section title={`${t("hydrographics")} — ${parsed.hy} (${parsed.hy * 10}%-${Math.min(parsed.hy * 10 + 9, 100)}%)`} color="#06b6d4" theme={theme}>
            <Row label={t("liquidCoverage")} value={HYDRO[parsed.hy] || `${parsed.hy * 10}%`} theme={theme} />
            {parsed.at >= 10 && parsed.hy > 0 && <Row label={`⚠ ${t("note")}`} value={t("liquidNote")} warn theme={theme} />}
          </Section>

          <Section title={`${t("population")} — ${parsed.po}`} color="#8b5cf6" theme={theme}>
            <Row label={t("inhabitants")} value={POP[parsed.po] || `${t("level")} ${parsed.po}`} theme={theme} />
            {parsed.po === 0 && <Row label={`⚠ ${t("note")}`} value={t("uninhabitedNote")} warn theme={theme} />}
            {parsed.po <= 3 && parsed.po > 0 && <Row label={`⚠ ${t("note")}`} value={t("smallColonyNote")} warn theme={theme} />}
          </Section>

          <Section title={`${t("government")} — ${parsed.go} (${GOV[parsed.go]?.type || t("unknown")})`} color="#ec4899" theme={theme}>
            {GOV[parsed.go] && <>
              <Row label={t("type")} value={GOV[parsed.go].type} theme={theme} />
              <Row label={t("description")} value={GOV[parsed.go].desc} theme={theme} />
              <Row label={t("commonContraband")} value={GOV[parsed.go].contra} warn={GOV[parsed.go].contra !== t("none") && GOV[parsed.go].contra !== "None" && GOV[parsed.go].contra !== "Ninguno"} theme={theme} />
            </>}
          </Section>

          <Section title={`${t("lawLevel")} — ${parsed.la}`} color="#f43f5e" theme={theme}>
            <Row label={t("bannedWeapons")} value={LAW_WEAPONS[Math.min(parsed.la, 9)] || LAW_WEAPONS[9]} warn={parsed.la >= 4} theme={theme} />
            <Row label={t("bannedArmor")} value={LAW_ARMOR[Math.min(parsed.la, 9)] || LAW_ARMOR[9]} warn={parsed.la >= 8} theme={theme} />
            {parsed.la === 0 && <Row label={t("note")} value={t("noRestrictions")} theme={theme} />}
            {parsed.la >= 9 && <Row label={`⚠ ${t("martialLaw")}`} value={t("allWeaponsArmorBanned")} warn theme={theme} />}
          </Section>

          <Section title={`${t("techLevel")} — ${parsed.tl}`} color="#6366f1" theme={theme}>
            <Row label={t("tl")} value={`${parsed.tl}`} theme={theme} />
            <Row label={t("equivalent")} value={
              parsed.tl <= 0 ? t("primitive") :
              parsed.tl <= 3 ? t("preindustrial") :
              parsed.tl <= 5 ? t("industrial") :
              parsed.tl <= 7 ? t("preatomic") :
              parsed.tl <= 9 ? t("earlySpace") :
              parsed.tl <= 11 ? t("earlyStellar") :
              parsed.tl <= 13 ? t("midStellar") :
              t("advancedStellar")
            } theme={theme} />
            {parsed.tl < 3 && <Row label={`⚠ ${t("communications")}`} value={t("noTelecom")} warn theme={theme} />}
            {parsed.tl >= 4 && parsed.tl <= 6 && <Row label={t("communications")} value={t("radioPhone")} theme={theme} />}
            {parsed.tl >= 9 && <Row label={t("communications")} value={t("fullNetwork")} theme={theme} />}
          </Section>

          {(zoneInput === "A" || zoneInput === "R") && (
            <Section title={`${t("travelZone")} — ${getZoneName(zoneInput)}`} color={ZONE_COLORS[zoneInput]} theme={theme}>
              <Row label={t("code")} value={zoneInput === "A" ? t("amberCaution") : t("redProhibited")} warn theme={theme} />
              <Row label={t("meaning")} value={zoneInput === "A" ? t("amberMeaning") : t("redMeaning")} theme={theme} />
            </Section>
          )}

          <div style={{ background: theme.bgCard, borderRadius: 12, padding: 16, textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: theme.textDimmed, textTransform: "uppercase", marginBottom: 6 }}>{t("worldLine")}</div>
            <code style={{ fontSize: 15, color: "#f59e0b", fontWeight: 700, letterSpacing: 1 }}>
              {name} {uwp.toUpperCase()} {zoneInput}
            </code>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: theme.textDimmed }}>
            {t("disclaimer")}<br />
            {t("manualNote")}
          </div>
        </div>
      </div>
    );
  }

  // Recent Planets View
  if (view === "saved") {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.text }}>
                {t("recentPlanets")}
              </h1>
              {recentPlanets.length > 0 && (
                <button
                  onClick={clearAllPlanets}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textDimmed,
                    fontSize: 13,
                    cursor: "pointer",
                    padding: "4px 8px"
                  }}>
                  {t("clearAll")}
                </button>
              )}
            </div>
            <div style={{ color: theme.textDimmed, fontSize: 13 }}>
              {recentPlanets.length} {t("planetCount")}
            </div>
          </div>

          {recentPlanets.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: theme.textDimmed }}>
              {t("noRecentPlanets")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentPlanets.map((planet) => (
                <div
                  key={planet.uwp}
                  onClick={() => loadPlanet(planet)}
                  style={{
                    background: theme.bgCard,
                    borderRadius: 10,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    border: `1px solid ${theme.border}`,
                    borderLeft: `3px solid ${planet.zone === "R" ? "#ef4444" : planet.zone === "A" ? "#f59e0b" : "#10b981"}`
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{planet.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: theme.textDimmed, letterSpacing: 0.5 }}>{planet.uwp}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePlanet(planet.uwp); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: theme.textDimmed,
                      padding: 8,
                      cursor: "pointer",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center"
                    }}>
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: theme.textDimmed }}>
            {t("disclaimer")}<br />
            {t("manualNote")}
          </div>
        </div>
      </div>
    );
  }

  // Scan View (simplified)
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>{t("subtitle")}</div>
          <h1 className="app-title">
            {t("title")}
          </h1>
        </div>

        {/* Main scan button */}
        <div style={{ background: theme.bgCard, borderRadius: 12, padding: 24, marginBottom: 16, border: `1px solid ${theme.border}` }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleScan}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            style={{
              width: "100%",
              background: scanning ? theme.border : "#8b5cf6",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "24px 20px",
              fontSize: 18,
              fontWeight: 700,
              cursor: scanning ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}>
            <IconCamera />
            {scanning ? t("scanning") : t("scan")}
          </button>
          {scanStatus && (
            <div style={{ fontSize: 12, color: scanStatus.includes(t("uwpDetected")) ? "#10b981" : "#f59e0b", marginTop: 12, textAlign: "center" }}>
              {scanStatus}
            </div>
          )}

          {/* Separator */}
          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
            <span style={{ color: theme.textDimmed, fontSize: 12 }}>{t("or")}</span>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
          </div>

          {/* Manual input (secondary) */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: theme.textDimmed }}>{t("enterManually")}</span>
          </div>
          <div className="manual-input-row">
            <input
              id="uwp-code"
              value={uwp}
              onChange={e => setUwp(e.target.value)}
              placeholder={t("uwpPlaceholder")}
              style={{
                flex: 1,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: theme.text,
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: 600,
                letterSpacing: 1,
                textAlign: "center"
              }}
            />
            <button
              onClick={() => navigateTo("planet", uwp)}
              disabled={!parsed}
              style={{
                background: parsed ? "#3b82f6" : theme.border,
                border: "none",
                borderRadius: 8,
                color: parsed ? "#fff" : theme.textDimmed,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: parsed ? "pointer" : "not-allowed"
              }}>
              {t("decode")}
            </button>
          </div>
          {!parsed && uwp.trim() && (
            <div style={{ textAlign: "center", marginTop: 8, color: "#f59e0b", fontSize: 11 }}>
              {t("invalidUwp")}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: theme.textDimmed }}>
          {t("disclaimer")}<br />
          {t("manualNote")}
        </div>
      </div>
    </div>
  );
}
