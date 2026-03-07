export const Footer = ({ theme, t, showVersion = false }) => (
  <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: theme.textDimmed }}>
    {t("disclaimer")}<br />
    {t("manualNote")}
    {showVersion && (
      <div style={{ marginTop: 16 }}>
        v{__APP_VERSION__}
      </div>
    )}
  </div>
);
