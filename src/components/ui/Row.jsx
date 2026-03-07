import { COLORS } from "../../constants/colors";

export const Row = ({ label, value, warn, theme }) => (
  <div className="data-row">
    <span className="data-row-label" style={{ color: theme?.textMuted }}>{label}</span>
    <span className="data-row-value" style={{ color: warn ? COLORS.warning : (theme?.text || "#e2e8f0") }}>{value}</span>
  </div>
);
