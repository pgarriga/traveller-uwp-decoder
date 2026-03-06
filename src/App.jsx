import { useState, useMemo, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { useTranslation, getSTARPORT, getSIZE, getATMO, getHYDRO, getPOP, getGOV, getLAW_WEAPONS, getLAW_ARMOR } from "./i18n";

const hex = v => parseInt(v, 16);

// UWP pattern: letter (A-E or X) + 6 hex digits + optional dash + 1 hex digit (tech level)
const UWP_PATTERN = /[ABCDEX][0-9A-F]{6}[-\s]?[0-9A-F]/gi;

const ZONE_COLORS = { A: "#f59e0b", R: "#ef4444" };

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
  const [savedPlanets, setSavedPlanets] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
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
    const stored = localStorage.getItem("traveller-planets");
    if (stored) {
      setSavedPlanets(JSON.parse(stored));
    }
  }, []);

  const canSave = name.trim() && uwp.trim() && zoneInput;

  const savePlanet = () => {
    if (!canSave) return;
    const planet = { name: name.trim(), uwp: uwp.toUpperCase(), zone: zoneInput };
    const existingIndex = savedPlanets.findIndex(p => p.name.toLowerCase() === planet.name.toLowerCase());
    let newPlanets;
    if (existingIndex >= 0) {
      newPlanets = [...savedPlanets];
      newPlanets[existingIndex] = planet;
    } else {
      newPlanets = [...savedPlanets, planet];
    }
    setSavedPlanets(newPlanets);
    localStorage.setItem("traveller-planets", JSON.stringify(newPlanets));
  };

  const loadPlanet = (planet) => {
    setName(planet.name);
    setUwp(planet.uwp);
    setZoneInput(planet.zone);
  };

  const deletePlanet = (planetName) => {
    const newPlanets = savedPlanets.filter(p => p.name !== planetName);
    setSavedPlanets(newPlanets);
    localStorage.setItem("traveller-planets", JSON.stringify(newPlanets));
  };

  // OCR Scanner function
  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStatus(t("loadingOcr"));

    try {
      const worker = await createWorker("eng");
      setScanStatus(t("scanning"));

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

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

        // Try to find a planet name (heuristic: capitalized word near UWP)
        const uwpIndex = text.toUpperCase().indexOf(matches[0].toUpperCase());
        const textBefore = text.slice(Math.max(0, uwpIndex - 50), uwpIndex);
        const textAfter = text.slice(uwpIndex + matches[0].length, uwpIndex + matches[0].length + 50);
        const surroundingText = textBefore + " " + textAfter;

        // Look for capitalized words (potential planet names)
        const namePattern = /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)\b/g;
        const nameMatches = surroundingText.match(namePattern);

        if (nameMatches && nameMatches.length > 0) {
          // Filter out common words that aren't planet names
          const commonWords = ["The", "And", "For", "With", "From", "Zone", "Red", "Amber", "Green"];
          const potentialName = nameMatches.find(n => !commonWords.includes(n));
          if (potentialName && !name) {
            setName(potentialName);
            setScanStatus(prev => `${prev} | ${t("nameDetected")}: ${potentialName}`);
          }
        }
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

  // Zone display name helper
  const getZoneName = (zone) => {
    if (zone === "R") return lang === "es" ? "Roja" : "Red";
    if (zone === "A") return lang === "es" ? "Ámbar" : "Amber";
    return t("zoneGreen");
  };

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

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{t("uwpCode")}</label>
            <div className="uwp-row">
              <input value={uwp} onChange={e => setUwp(e.target.value)} placeholder={t("uwpPlaceholder")} style={{ flex: 1, background: "#0f172a", border: "2px solid #3b82f6", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 20, fontFamily: "monospace", fontWeight: 700, letterSpacing: 3, textAlign: "center" }} />
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
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: scanning ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap"
                }}>
                {scanning ? "..." : t("scan")}
              </button>
            </div>
            {scanStatus && (
              <div style={{ fontSize: 11, color: scanStatus.includes(t("uwpDetected")) ? "#10b981" : "#f59e0b", marginTop: 6 }}>
                {scanStatus}
              </div>
            )}
          </div>

          <div className="button-row">
            <button
              onClick={savePlanet}
              disabled={!canSave}
              style={{
                flex: 1,
                background: canSave ? "#10b981" : "#334155",
                border: "none",
                borderRadius: 8,
                color: canSave ? "#fff" : "#64748b",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: canSave ? "pointer" : "not-allowed"
              }}>
              {t("savePlanet")}
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              style={{
                background: "#334155",
                border: "none",
                borderRadius: 8,
                color: "#e2e8f0",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}>
              {showSaved ? t("hide") : t("viewSaved")} ({savedPlanets.length})
            </button>
          </div>

          {!canSave && (name || uwp || zoneInput) && (
            <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 8 }}>
              {t("toSaveComplete")} {!name.trim() && t("fieldName")}{!name.trim() && (!uwp.trim() || !zoneInput) && ", "}{!uwp.trim() && t("fieldUwp")}{!uwp.trim() && !zoneInput && ", "}{!zoneInput && t("fieldZone")}
            </div>
          )}

          {showSaved && (
            <div style={{ marginTop: 12, background: "#0f172a", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>{t("savedPlanets")}</div>
              {savedPlanets.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 13 }}>{t("noSavedPlanets")}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {savedPlanets.map((planet, i) => (
                    <div key={i} className="planet-item" style={{ background: "#1e293b", borderRadius: 6, padding: "8px 12px" }}>
                      <div className="planet-info" style={{ cursor: "pointer" }} onClick={() => loadPlanet(planet)}>
                        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{planet.name}</span>
                        <span className="uwp-code" style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>{planet.uwp}</span>
                        <span style={{ marginLeft: 8, fontSize: 11, color: planet.zone === "R" ? "#ef4444" : planet.zone === "A" ? "#f59e0b" : "#10b981" }}>
                          {getZoneName(planet.zone)}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePlanet(planet.name)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 8px", fontSize: 12, minHeight: "auto" }}>
                        {t("delete")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {!parsed ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            {t("invalidUwp")}
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1e293b)", borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{name || t("unnamed")}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8" }}>{uwp.toUpperCase()}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {(zoneInput === "A" || zoneInput === "R") && <Badge text={`${t("zoneLabel")} ${getZoneName(zoneInput)}`} color={ZONE_COLORS[zoneInput]} />}
              </div>
            </div>

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
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#475569" }}>
          {t("disclaimer")}<br />
          {t("manualNote")}
        </div>
      </div>
    </div>
  );
}
