import type { CSSProperties, FC, ReactNode } from "react";
import { Img, interpolate, staticFile } from "remotion";

export const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const BG = "#121726";
export const PATH_COLOR = "#9BB8DC";
export const GLOW_COLOR = "#7CE7FF";
export const SUCCESS_COLOR = "#5EE9A0";
export const WARN_COLOR = "#FFB020";
export const DANGER_COLOR = "#FF6B7A";
export const MUTED = "#8EA0C2";
export const TEXT = "#F4F7FF";
export const TEXT_SOFT = "#C5D3EE";

export const CLUSTER_ACCENT = "#7CE7FF";
export const PARTITION_ACCENT = "#C084FC";
export const SPREAD_ACCENT = "#5EE9A0";
export const ENI_ACCENT = "#59A6FF";
export const SG_ACCENT = "#FFB020";
export const SUBNET_ACCENT = "#C084FC";
export const INSTANCE_ACCENT = "#59A6FF";

export type Pt = { x: number; y: number };
export type CameraView = { scale: number; x: number; y: number };

export const IDENTITY_CAM: CameraView = { scale: 1, x: 0, y: 0 };

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const linearT = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const cameraFocus = (target: Pt, peakScale: number): CameraView => ({
  scale: peakScale,
  x: WIDTH / 2 - target.x * peakScale,
  y: HEIGHT / 2 - target.y * peakScale,
});

export const lerpCam = (from: CameraView, to: CameraView, t: number): CameraView => {
  const u = clamp01(t);
  return {
    scale: from.scale + (to.scale - from.scale) * u,
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  };
};

export const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, fontFamily: FONT_FAMILY, ...style }}>{children}</p>
);

export const IconImg: FC<{ file: string; size: number }> = ({ file, size }) => (
  <Img src={staticFile(file)} style={{ width: size, height: size }} />
);

export const Tag: FC<{
  label: string;
  accent?: string;
  dim?: boolean;
}> = ({ label, accent = GLOW_COLOR, dim = false }) => (
  <span
    style={{
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.04em",
      color: dim ? "#6D7F9E" : TEXT_SOFT,
      background: dim ? "rgba(255,255,255,0.04)" : `${accent}22`,
      border: dim ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${accent}59`,
    }}
  >
    {label}
  </span>
);

export const IconBadge: FC<{ file: string; size?: number; accent?: string }> = ({
  file,
  size = 52,
  accent,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: "#101828",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: accent ? `1px solid ${accent}66` : "1px solid rgba(255,255,255,0.08)",
      boxShadow: accent ? `0 0 14px ${accent}33` : "none",
      flexShrink: 0,
    }}
  >
    <IconImg file={file} size={Math.round(size * 0.58)} />
  </div>
);

export const ScreenCaption: FC<{
  kicker: string;
  line: string;
  opacity: number;
}> = ({ kicker, line, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: 220,
      right: 220,
      bottom: 22,
      textAlign: "center",
      opacity,
      pointerEvents: "none",
      padding: "12px 28px 14px",
      borderRadius: 18,
      background: "rgba(8, 12, 22, 0.82)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <Txt
      style={{
        fontSize: 14,
        letterSpacing: "0.22em",
        color: "#6D7F9E",
        marginBottom: 8,
        fontWeight: 600,
      }}
    >
      {kicker}
    </Txt>
    <Txt style={{ fontSize: 26, fontWeight: 600, color: TEXT_SOFT }}>{line}</Txt>
  </div>
);

export const Vignette: FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 55% at 50% 42%, #13203a 0%, #121726 72%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 48%, #050814 100%)",
        pointerEvents: "none",
      }}
    />
  </>
);

export const polylineLength = (pts: Pt[]) => {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
};

export const walkPolyline = (pts: Pt[], t: number): Pt => {
  const total = polylineLength(pts);
  let remain = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (remain <= seg) {
      const u = seg === 0 ? 0 : remain / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
      };
    }
    remain -= seg;
  }
  return pts[pts.length - 1];
};

export const toD = (pts: Pt[]) => pts.map((pt, index) => `${index === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
