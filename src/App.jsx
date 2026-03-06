import { useState, useMemo, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { useTranslation, getSTARPORT, getSIZE, getATMO, getHYDRO, getPOP, getGOV, getLAW_WEAPONS, getLAW_ARMOR } from "./i18n";

const hex = v => parseInt(v, 16);

// UWP pattern: letter (A-E or X) + 6 hex digits + optional dash + 1 hex digit (tech level)
const UWP_PATTERN = /[ABCDEX][0-9A-F]{6}[-\s]?[0-9A-F]/gi;

const ZONE_COLORS = { A: "#f59e0b", R: "#ef4444" };

// Flat icons
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const Section = ({ title, children, color = "#3b82f6" }) => (
  <div style={{ background: "#1e293b", borderRadius: 12, padding: "16px 20px", marginBottom: 12, borderLeft: `4px solid ${color}` }}>
    <div className="section-title" style={{ color, fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

const Row = ({ label, value, warn }) => (
  <div className="data-row">
    <span className="data-row-label">{label}</span>
    <span className="data-row-value" style={{ color: warn ? "#f59e0b" : "#e2e8f0" }}>{value}</span>
  </div>
);

const Badge = ({ text, color = "#3b82f6" }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600, margin: 2, display: "inline-block" }}>{text}</span>
);

export default function App() {
  const { t, lang } = useTranslation();
  const [uwp, setUwp] = useState("");
  const [name, setName] = useState("");
  const [zoneInput, setZoneInput] = useState("V");
  const [recentPlanets, setRecentPlanets] = useState([]);
  const [view, setView] = useState("decoder"); // "decoder" | "saved" | "planet"
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const fileInputRef = useRef(null);

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
    const stored = localStorage.getItem("traveller-recent");
    if (stored) {
      setRecentPlanets(JSON.parse(stored));
    }
  }, []);

  const loadPlanet = (planet) => {
    setName(planet.name);
    setUwp(planet.uwp);
    setZoneInput(planet.zone);

    // Move planet to top of recent list
    const updatedPlanet = { ...planet, timestamp: Date.now() };
    setRecentPlanets(prev => {
      const filtered = prev.filter(p => p.uwp !== planet.uwp);
      const updated = [updatedPlanet, ...filtered];
      localStorage.setItem("traveller-recent", JSON.stringify(updated));
      return updated;
    });

    setView("planet");
  };

  const deletePlanet = (planetUwp) => {
    const newPlanets = recentPlanets.filter(p => p.uwp !== planetUwp);
    setRecentPlanets(newPlanets);
    localStorage.setItem("traveller-recent", JSON.stringify(newPlanets));
  };

  const clearAllPlanets = () => {
    setRecentPlanets([]);
    localStorage.removeItem("traveller-recent");
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
        setView("planet");
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

  // Auto-save to recent when UWP is valid
  useEffect(() => {
    if (parsed && uwp.trim()) {
      const planet = {
        name: name.trim() || uwp.toUpperCase(),
        uwp: uwp.toUpperCase(),
        zone: zoneInput,
        timestamp: Date.now()
      };

      setRecentPlanets(prev => {
        // Remove duplicate (same UWP)
        const filtered = prev.filter(p => p.uwp !== planet.uwp);
        // Add to beginning, limit to 20
        const updated = [planet, ...filtered].slice(0, 20);
        localStorage.setItem("traveller-recent", JSON.stringify(updated));
        return updated;
      });
    }
  }, [parsed, uwp, name, zoneInput]);

  // Zone display name helper
  const getZoneName = (zone) => {
    if (zone === "R") return lang === "es" ? "Roja" : "Red";
    if (zone === "A") return lang === "es" ? "Ámbar" : "Amber";
    return t("zoneGreen");
  };

  // Planet Detail View (fallback to decoder if no valid UWP)
  if (view === "planet") {
    if (!parsed) {
      setView("decoder");
      return null;
    }
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          {/* Header with navigation */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => {
                setName("");
                setUwp("");
                setZoneInput("V");
                setScanStatus("");
                setView("decoder");
              }}
              style={{
                flex: 1,
                background: "#8b5cf6",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}>
              <IconCamera />{t("scan")}
            </button>
            <button
              onClick={() => setView("saved")}
              style={{
                flex: 1,
                background: "#334155",
                border: "none",
                borderRadius: 8,
                color: "#e2e8f0",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}>
              <IconClock />{t("viewRecent")}
            </button>
          </div>

          {/* Planet header */}
          <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1e293b)", borderRadius: 12, padding: 20, marginBottom: 16, textAlign: "center" }}>
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
                color: "#e2e8f0",
                textAlign: "center",
                width: "100%",
                marginBottom: 4,
                padding: "4px 0",
                outline: "none"
              }}
            />
            <div style={{ fontFamily: "monospace", fontSize: 16, color: "#94a3b8", letterSpacing: 2, marginBottom: 8 }}>{uwp.toUpperCase()}</div>
            {(zoneInput === "A" || zoneInput === "R") && (
              <Badge text={`${t("zoneLabel")} ${getZoneName(zoneInput)}`} color={ZONE_COLORS[zoneInput]} />
            )}
          </div>

          {/* Planet details */}
          <Section title={`${t("starport")} — ${t("class")} ${parsed.sp}`} color="#f59e0b">
            <Row label={t("quality")} value={STARPORT[parsed.sp].name} />
            <Row label={t("fuel")} value={STARPORT[parsed.sp].fuel} />
            <Row label={t("berth")} value={STARPORT[parsed.sp].berth} />
            <Row label={t("services")} value={STARPORT[parsed.sp].services} />
            <Row label={t("possibleBases")} value={STARPORT[parsed.sp].bases} />
          </Section>

          <Section title={`${t("size")} — ${parsed.sz} ${SIZE[parsed.sz] ? `(${SIZE[parsed.sz].d})` : ""}`} color="#3b82f6">
            {SIZE[parsed.sz] && <>
              <Row label={t("diameter")} value={SIZE[parsed.sz].d} />
              <Row label={t("gravity")} value={`${SIZE[parsed.sz].g}g`} />
              {SIZE[parsed.sz].ex && <Row label={t("example")} value={SIZE[parsed.sz].ex} />}
              <Row label={t("description")} value={SIZE[parsed.sz].desc} />
              {parsed.sz <= 6 && parsed.sz > 0 && <Row label={`⚠ ${t("gravityWarning")}`} value={t("lowGravity")} warn />}
              {parsed.sz >= 10 && <Row label={`⚠ ${t("gravityWarning")}`} value={t("highGravity")} warn />}
            </>}
          </Section>

          <Section title={`${t("atmosphere")} — ${parsed.at} (${ATMO[parsed.at]?.comp || t("unknown")})`} color="#10b981">
            {ATMO[parsed.at] && <>
              <Row label={t("composition")} value={ATMO[parsed.at].comp} />
              <Row label={t("pressure")} value={ATMO[parsed.at].pres} />
              <Row label={t("equipRequired")} value={ATMO[parsed.at].equip} warn={ATMO[parsed.at].equip !== t("none") && ATMO[parsed.at].equip !== "None" && ATMO[parsed.at].equip !== "Ninguno"} />
              <Row label={t("description")} value={ATMO[parsed.at].desc} />
              {parsed.at >= 11 && <Row label={`⚠ ${t("danger")}`} value={t("dangerousAtmo")} warn />}
            </>}
          </Section>

          <Section title={`${t("hydrographics")} — ${parsed.hy} (${parsed.hy * 10}%-${Math.min(parsed.hy * 10 + 9, 100)}%)`} color="#06b6d4">
            <Row label={t("liquidCoverage")} value={HYDRO[parsed.hy] || `${parsed.hy * 10}%`} />
            {parsed.at >= 10 && parsed.hy > 0 && <Row label={`⚠ ${t("note")}`} value={t("liquidNote")} warn />}
          </Section>

          <Section title={`${t("population")} — ${parsed.po}`} color="#8b5cf6">
            <Row label={t("inhabitants")} value={POP[parsed.po] || `${t("level")} ${parsed.po}`} />
            {parsed.po === 0 && <Row label={`⚠ ${t("note")}`} value={t("uninhabitedNote")} warn />}
            {parsed.po <= 3 && parsed.po > 0 && <Row label={`⚠ ${t("note")}`} value={t("smallColonyNote")} warn />}
          </Section>

          <Section title={`${t("government")} — ${parsed.go} (${GOV[parsed.go]?.type || t("unknown")})`} color="#ec4899">
            {GOV[parsed.go] && <>
              <Row label={t("type")} value={GOV[parsed.go].type} />
              <Row label={t("description")} value={GOV[parsed.go].desc} />
              <Row label={t("commonContraband")} value={GOV[parsed.go].contra} warn={GOV[parsed.go].contra !== t("none") && GOV[parsed.go].contra !== "None" && GOV[parsed.go].contra !== "Ninguno"} />
            </>}
          </Section>

          <Section title={`${t("lawLevel")} — ${parsed.la}`} color="#f43f5e">
            <Row label={t("bannedWeapons")} value={LAW_WEAPONS[Math.min(parsed.la, 9)] || LAW_WEAPONS[9]} warn={parsed.la >= 4} />
            <Row label={t("bannedArmor")} value={LAW_ARMOR[Math.min(parsed.la, 9)] || LAW_ARMOR[9]} warn={parsed.la >= 8} />
            {parsed.la === 0 && <Row label={t("note")} value={t("noRestrictions")} />}
            {parsed.la >= 9 && <Row label={`⚠ ${t("martialLaw")}`} value={t("allWeaponsArmorBanned")} warn />}
          </Section>

          <Section title={`${t("techLevel")} — ${parsed.tl}`} color="#6366f1">
            <Row label={t("tl")} value={`${parsed.tl}`} />
            <Row label={t("equivalent")} value={
              parsed.tl <= 0 ? t("primitive") :
              parsed.tl <= 3 ? t("preindustrial") :
              parsed.tl <= 5 ? t("industrial") :
              parsed.tl <= 7 ? t("preatomic") :
              parsed.tl <= 9 ? t("earlySpace") :
              parsed.tl <= 11 ? t("earlyStellar") :
              parsed.tl <= 13 ? t("midStellar") :
              t("advancedStellar")
            } />
            {parsed.tl < 3 && <Row label={`⚠ ${t("communications")}`} value={t("noTelecom")} warn />}
            {parsed.tl >= 4 && parsed.tl <= 6 && <Row label={t("communications")} value={t("radioPhone")} />}
            {parsed.tl >= 9 && <Row label={t("communications")} value={t("fullNetwork")} />}
          </Section>

          {(zoneInput === "A" || zoneInput === "R") && (
            <Section title={`${t("travelZone")} — ${getZoneName(zoneInput)}`} color={ZONE_COLORS[zoneInput]}>
              <Row label={t("code")} value={zoneInput === "A" ? t("amberCaution") : t("redProhibited")} warn />
              <Row label={t("meaning")} value={zoneInput === "A" ? t("amberMeaning") : t("redMeaning")} />
            </Section>
          )}

          <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{t("worldLine")}</div>
            <code style={{ fontSize: 15, color: "#f59e0b", fontWeight: 700, letterSpacing: 1 }}>
              {name} {uwp.toUpperCase()} {zoneInput}
            </code>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#475569" }}>
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
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          {/* Navigation button */}
          <button
            onClick={() => {
              setName("");
              setUwp("");
              setZoneInput("V");
              setScanStatus("");
              setView("decoder");
            }}
            style={{
              width: "100%",
              background: "#8b5cf6",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 20
            }}>
            <IconCamera />{t("scan")}
          </button>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#e2e8f0" }}>
                {t("recentPlanets")}
              </h1>
              {recentPlanets.length > 0 && (
                <button
                  onClick={clearAllPlanets}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: 13,
                    cursor: "pointer",
                    padding: "4px 8px"
                  }}>
                  {t("clearAll")}
                </button>
              )}
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {recentPlanets.length} {t("planetCount")}
            </div>
          </div>

          {recentPlanets.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
              {t("noRecentPlanets")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentPlanets.map((planet, i) => (
                <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{planet.name}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 14, color: "#94a3b8", letterSpacing: 1 }}>{planet.uwp}</div>
                    </div>
                    <Badge
                      text={getZoneName(planet.zone)}
                      color={planet.zone === "R" ? "#ef4444" : planet.zone === "A" ? "#f59e0b" : "#10b981"}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => loadPlanet(planet)}
                      style={{
                        flex: 1,
                        background: "#3b82f6",
                        border: "none",
                        borderRadius: 8,
                        color: "#fff",
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}>
                      <IconSearch />{t("viewInfo")}
                    </button>
                    <button
                      onClick={() => deletePlanet(planet.uwp)}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #ef4444",
                        borderRadius: 8,
                        color: "#ef4444",
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}>
                      <IconTrash />{t("delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#475569" }}>
            {t("disclaimer")}<br />
            {t("manualNote")}
          </div>
        </div>
      </div>
    );
  }

  // Scan View (input only)
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>{t("subtitle")}</div>
          <h1 className="app-title">
            {t("title")}
          </h1>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div className="form-grid">
            <div>
              <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{t("worldName")}</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{t("zone")}</label>
              <select value={zoneInput} onChange={e => setZoneInput(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}>
                <option value="V">{t("zoneGreen")}</option>
                <option value="A">{t("zoneAmber")}</option>
                <option value="R">{t("zoneRed")}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{t("uwpCode")}</label>
            <div className="uwp-row">
              <input value={uwp} onChange={e => setUwp(e.target.value)} placeholder={t("uwpPlaceholder")} style={{ flex: 1, background: "#0f172a", border: "2px solid #3b82f6", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 18, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, textAlign: "center" }} />
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
                  background: scanning ? "#334155" : "#8b5cf6",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: scanning ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap"
                }}>
                {scanning ? "..." : <><IconCamera />{t("scan")}</>}
              </button>
            </div>
            {scanStatus && (
              <div style={{ fontSize: 11, color: scanStatus.includes(t("uwpDetected")) ? "#10b981" : "#f59e0b", marginTop: 6 }}>
                {scanStatus}
              </div>
            )}
          </div>

          {/* Decode button */}
          <button
            onClick={() => setView("planet")}
            disabled={!parsed}
            style={{
              width: "100%",
              background: parsed ? "#3b82f6" : "#334155",
              border: "none",
              borderRadius: 8,
              color: parsed ? "#fff" : "#64748b",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: parsed ? "pointer" : "not-allowed",
              marginBottom: 12
            }}>
            {t("decode")}
          </button>

          <button
            onClick={() => setView("saved")}
            style={{
              width: "100%",
              background: "#334155",
              border: "none",
              borderRadius: 8,
              color: "#e2e8f0",
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}>
            <IconClock />{t("viewRecent")} ({recentPlanets.length})
          </button>
        </div>

        {!parsed && uwp.trim() && (
          <div style={{ textAlign: "center", padding: 20, color: "#f59e0b", fontSize: 13 }}>
            {t("invalidUwp")}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#475569" }}>
          {t("disclaimer")}<br />
          {t("manualNote")}
        </div>
      </div>
    </div>
  );
}
