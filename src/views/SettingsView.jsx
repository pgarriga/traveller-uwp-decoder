import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/Button";

export const SettingsView = ({
  theme,
  themeMode,
  setThemeMode,
  langMode,
  setLangMode,
  view,
  resetDecoder,
  navigateTo,
  menuOpen,
  setMenuOpen,
  t
}) => (
  <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
    <Navbar
      theme={theme}
      view={view}
      resetDecoder={resetDecoder}
      navigateTo={navigateTo}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      t={t}
    />
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 800 }}>{t("settings")}</h1>

      <div style={{ background: theme.bgCard, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>{t("theme")}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["auto", "light", "dark"].map(mode => (
            <Button
              key={mode}
              variant="option"
              active={themeMode === mode}
              theme={theme}
              onClick={() => setThemeMode(mode)}
              style={{ flex: 1, minWidth: 80, padding: "12px 16px" }}
            >
              {t(mode === "auto" ? "themeAuto" : mode === "light" ? "themeLight" : "themeDark")}
            </Button>
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
            <Button
              key={mode}
              variant="option"
              active={langMode === mode}
              theme={theme}
              onClick={() => setLangMode(mode)}
              style={{ flex: 1, minWidth: 80, padding: "12px 16px" }}
            >
              {t(mode === "auto" ? "langAuto" : mode === "es" ? "langEs" : "langEn")}
            </Button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: theme.textDimmed, marginTop: 12 }}>
          {t("langDescription")}
        </div>
      </div>

      <Footer theme={theme} t={t} showVersion />
    </div>
  </div>
);
