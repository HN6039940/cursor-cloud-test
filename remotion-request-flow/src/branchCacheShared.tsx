import type { CSSProperties, FC, ReactNode } from "react";
import { Img, staticFile } from "remotion";

export const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({
  style,
  children,
}) => <p style={{ margin: 0, ...style }}>{children}</p>;

export const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
const SVG_W = 1400;
const SVG_H = 720;
export const SCALE = Math.min(WIDTH / SVG_W, HEIGHT / SVG_H);
const DRAW_W = SVG_W * SCALE;
const DRAW_H = SVG_H * SCALE;
export const OFFSET_X = (WIDTH - DRAW_W) / 2;
export const OFFSET_Y = (HEIGHT - DRAW_H) / 2;

export type Pt = { x: number; y: number };

export const toScreen = (p: Pt): Pt => ({
  x: OFFSET_X + p.x * SCALE,
  y: OFFSET_Y + p.y * SCALE,
});

export const NODES = [
  { id: "client", label: "Client", x: 60, y: 320, w: 150, h: 80, color: "#59A6FF" },
  { id: "lb", label: "LB", x: 320, y: 320, w: 150, h: 80, color: "#4DD18C" },
  { id: "appa", label: "App A", x: 600, y: 140, w: 150, h: 80, color: "#F0C14B" },
  { id: "appb", label: "App B", x: 600, y: 500, w: 150, h: 80, color: "#FF8A4C" },
  { id: "cache", label: "Cache", x: 880, y: 140, w: 150, h: 80, color: "#C084FC" },
  { id: "db", label: "DB", x: 1160, y: 320, w: 150, h: 80, color: "#A78BFA" },
] as const;

export type NodeId = (typeof NODES)[number]["id"];

export const CENTER: Record<NodeId, Pt> = {
  client: { x: 135, y: 360 },
  lb: { x: 395, y: 360 },
  appa: { x: 675, y: 180 },
  appb: { x: 675, y: 540 },
  cache: { x: 955, y: 180 },
  db: { x: 1235, y: 360 },
};

export const PATH_CLIENT_LB: Pt[] = [CENTER.client, CENTER.lb];
export const PATH_LB_APPA: Pt[] = [
  CENTER.lb,
  { x: 474, y: 360 },
  { x: 474, y: 284 },
  { x: 675, y: 284 },
  CENTER.appa,
];
export const PATH_LB_APPB: Pt[] = [
  CENTER.lb,
  { x: 474, y: 360 },
  { x: 474, y: 436 },
  { x: 675, y: 436 },
  CENTER.appb,
];
export const PATH_APPA_DB: Pt[] = [
  CENTER.appa,
  { x: 675, y: 244 },
  { x: 1026, y: 244 },
  { x: 1026, y: 360 },
  CENTER.db,
];
export const PATH_APPB_DB: Pt[] = [
  CENTER.appb,
  { x: 1156, y: 540 },
  { x: 1156, y: 360 },
  CENTER.db,
];
export const PATH_APPA_CACHE: Pt[] = [CENTER.appa, CENTER.cache];
export const PATH_CACHE_DB: Pt[] = [
  CENTER.cache,
  { x: 1034, y: 180 },
  { x: 1034, y: 360 },
  CENTER.db,
];
export const PATH_CACHE_APPA: Pt[] = [CENTER.cache, CENTER.appa];

export const PATH_A = [...PATH_CLIENT_LB, ...PATH_LB_APPA.slice(1), ...PATH_APPA_DB.slice(1)];
export const PATH_B = [...PATH_CLIENT_LB, ...PATH_LB_APPB.slice(1), ...PATH_APPB_DB.slice(1)];
export const PATH_MISS = [
  ...PATH_CLIENT_LB,
  ...PATH_LB_APPA.slice(1),
  ...PATH_APPA_CACHE.slice(1),
  ...PATH_CACHE_DB.slice(1),
];
export const PATH_HIT = [
  ...PATH_CLIENT_LB,
  ...PATH_LB_APPA.slice(1),
  ...PATH_APPA_CACHE.slice(1),
  ...PATH_CACHE_APPA.slice(1),
];

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

export const nearestNode = (pos: Pt, ids: readonly NodeId[]): NodeId => {
  let best: NodeId = ids[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const id of ids) {
    const d = Math.hypot(pos.x - CENTER[id].x, pos.y - CENTER[id].y);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
};

export type PacketView = {
  pos: Pt;
  color: string;
  opacity: number;
};

export const TopologyStage: FC<{
  labelProgress: number;
  active: Partial<Record<NodeId, string>>;
  packets: PacketView[];
  title: string;
  caption: string;
  titleOpacity: number;
}> = ({ labelProgress, active, packets, title, caption, titleOpacity }) => {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: "#121726",
        fontFamily: FONT_FAMILY,
        position: "relative",
      }}
    >
      <Img
        src={staticFile("parts-branch-cache.svg")}
        style={{
          position: "absolute",
          left: OFFSET_X,
          top: OFFSET_Y,
          width: DRAW_W,
          height: DRAW_H,
        }}
      />
      {NODES.map((node, index) => {
        const glow = active[node.id];
        const origin = toScreen({ x: node.x, y: node.y });
        const appear = Math.max(0, Math.min(1, (labelProgress - index * 0.08) / 0.22));
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: origin.x,
              top: origin.y,
              width: node.w * SCALE,
              height: node.h * SCALE,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: 22,
              borderRadius: 20,
              border: glow ? `3px solid ${glow}` : "3px solid transparent",
              boxShadow: glow ? `0 0 0 5px ${glow}33, 0 0 28px ${glow}88` : "none",
            }}
          >
            <Txt
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 28,
                fontWeight: 700,
                color: "#EBF0FA",
                opacity: appear,
                letterSpacing: "0.03em",
              }}
            >
              {node.label}
            </Txt>
          </div>
        );
      })}
      {packets.map((packet, index) => {
        const screen = toScreen(packet.pos);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: screen.x,
              top: screen.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              borderRadius: "50%",
              background: packet.color,
              opacity: packet.opacity,
              boxShadow: `0 0 0 4px ${packet.color}33, 0 0 22px ${packet.color}`,
            }}
          />
        );
      })}
      <Txt
        style={{
          position: "absolute",
          top: 28,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 40,
          fontWeight: 700,
          color: "#F4F7FF",
          opacity: titleOpacity,
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </Txt>
      <Txt
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 36,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 26,
          fontWeight: 500,
          color: "#C5D3EE",
          opacity: titleOpacity,
        }}
      >
        {caption}
      </Txt>
    </div>
  );
};
