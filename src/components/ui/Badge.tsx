import type { FC } from "react";
import { COLORS } from "../../constants/colors";

interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge: FC<BadgeProps> = ({ text, color = COLORS.primary }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600, margin: 2, display: "inline-block" }}>{text}</span>
);
