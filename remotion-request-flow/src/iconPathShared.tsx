import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

export const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 750;

export const CARD_W = 168;
export const CARD_H = 188;
export const STROKE = 3.5;
export const PATH_COLOR = "#9BB8DC";
export const A_COLOR = "#7CE7FF";
export const B_COLOR = "#FFB020";
export const SUCCESS_COLOR = "#5EE9A0";
export const FAIL_COLOR = "#FF7A8A";

export type Pt = { x: number; y: number };
export type NodeId = "client" | "lb" | "appa" | "appb" | "cache" | "db";
export type BadgeKind = "check" | "x";

export type NodeDef = {
  id: NodeId;
  label: string;
  file: string;
  accent: string;
  x: number;
  y: number;
};

const MARGIN = 100;
const COL_GAP = (WIDTH - MARGIN * 2 - CARD_W * 5) / 4;
const X_CLIENT = MARGIN;
const X_LB = X_CLIENT + CARD_W + COL_GAP;
const X_APPS = X_LB + CARD_W + COL_GAP;
const X_CACHE = X_APPS + CARD_W + COL_GAP;
const X_APPB = (X_APPS + X_CACHE) / 2;
const X_DB = X_CACHE + CARD_W + COL_GAP;

export const CY_MID = 540;
export const CY_UP = 340;
export const CY_DN = 740;
const topFor = (cy: number) => cy - CARD_H / 2;

export const NODES: NodeDef[] = [
  { id: "client", label: "Client", file: "icons/client.svg", accent: "#59A6FF", x: X_CLIENT, y: topFor(CY_MID) },
  { id: "lb", label: "LB", file: "icons/lb.svg", accent: "#4DD18C", x: X_LB, y: topFor(CY_MID) },
  { id: "appa", label: "App A", file: "icons/app.svg", accent: "#F0C14B", x: X_APPS, y: topFor(CY_UP) },
  { id: "appb", label: "App B", file: "icons/app.svg", accent: "#FF8A4C", x: X_APPB, y: topFor(CY_DN) },
  { id: "cache", label: "Cache", file: "icons/cache.svg", accent: "#C084FC", x: X_CACHE, y: topFor(CY_UP) },
  { id: "db", label: "DB", file: "icons/db.svg", accent: "#A78BFA", x: X_DB, y: topFor(CY_MID) },
];

export const NODE = Object.fromEntries(NODES.map((node) => [node.id, node])) as Record<NodeId, NodeDef>;

export const leftMid = (node: NodeDef): Pt => ({ x: node.x, y: node.y + CARD_H / 2 });
export const rightMid = (node: NodeDef): Pt => ({ x: node.x + CARD_W, y: node.y + CARD_H / 2 });
export const center = (node: NodeDef): Pt => ({ x: node.x + CARD_W / 2, y: node.y + CARD_H / 2 });

export const CENTER: Record<NodeId, Pt> = {
  client: center(NODE.client),
  lb: center(NODE.lb),
  appa: center(NODE.appa),
  appb: center(NODE.appb),
  cache: center(NODE.cache),
  db: center(NODE.db),
};

export const BRANCH_X = (rightMid(NODE.lb).x + leftMid(NODE.appa).x) / 2;
export const MERGE_X = (rightMid(NODE.cache).x + leftMid(NODE.db).x) / 2;

export const CLIENT_RIGHT = rightMid(NODE.client);
export const LB_LEFT = leftMid(NODE.lb);
export const LB_RIGHT = rightMid(NODE.lb);
export const APPA_LEFT = leftMid(NODE.appa);
export const APPA_RIGHT = rightMid(NODE.appa);
export const APPB_LEFT = leftMid(NODE.appb);
export const APPB_RIGHT = rightMid(NODE.appb);
export const CACHE_LEFT = leftMid(NODE.cache);
export const CACHE_RIGHT = rightMid(NODE.cache);
export const DB_LEFT = leftMid(NODE.db);
export const BRANCH_PT: Pt = { x: BRANCH_X, y: CY_MID };
export const MERGE_PT: Pt = { x: MERGE_X, y: CY_MID };

export const PATH_CLIENT_LB: Pt[] = [CLIENT_RIGHT, LB_LEFT];
export const PATH_LB_STUB: Pt[] = [LB_RIGHT, BRANCH_PT];
export const PATH_LB_APPA: Pt[] = [BRANCH_PT, { x: BRANCH_X, y: APPA_LEFT.y }, APPA_LEFT];
export const PATH_LB_APPB: Pt[] = [BRANCH_PT, { x: BRANCH_X, y: APPB_LEFT.y }, APPB_LEFT];
export const PATH_APPA_CACHE: Pt[] = [APPA_RIGHT, CACHE_LEFT];
export const PATH_CACHE_TO_MERGE: Pt[] = [CACHE_RIGHT, { x: MERGE_X, y: CACHE_RIGHT.y }, MERGE_PT];
export const PATH_APPB_TO_MERGE: Pt[] = [APPB_RIGHT, { x: MERGE_X, y: APPB_RIGHT.y }, MERGE_PT];
export const PATH_TRUNK: Pt[] = [MERGE_PT, DB_LEFT];
export const PATH_SPINE: Pt[] = [
  { x: MERGE_X, y: CACHE_RIGHT.y },
  { x: MERGE_X, y: APPB_RIGHT.y },
];

export const DRAW_PATHS: { pts: Pt[]; start: number; dur: number }[] = [
  { pts: PATH_CLIENT_LB, start: 48, dur: 22 },
  { pts: PATH_LB_STUB, start: 62, dur: 14 },
  { pts: PATH_LB_APPA, start: 70, dur: 24 },
  { pts: PATH_LB_APPB, start: 70, dur: 24 },
  { pts: PATH_APPA_CACHE, start: 92, dur: 18 },
  { pts: PATH_CACHE_TO_MERGE.slice(0, 2), start: 108, dur: 20 },
  { pts: PATH_APPB_TO_MERGE.slice(0, 2), start: 108, dur: 20 },
  { pts: PATH_SPINE, start: 122, dur: 22 },
  { pts: PATH_TRUNK, start: 136, dur: 18 },
];

export const joinPolylines = (...parts: Pt[][]): Pt[] => {
  const out: Pt[] = [];
  for (const part of parts) {
    for (const pt of part) {
      const prev = out[out.length - 1];
      if (prev && prev.x === pt.x && prev.y === pt.y) {
        continue;
      }
      out.push(pt);
    }
  }
  return out;
};

export const PATH_A: Pt[] = joinPolylines(
  PATH_CLIENT_LB,
  [LB_LEFT, LB_RIGHT],
  PATH_LB_STUB,
  PATH_LB_APPA,
  [APPA_LEFT, APPA_RIGHT],
  PATH_APPA_CACHE,
  [CACHE_LEFT, CACHE_RIGHT],
  PATH_CACHE_TO_MERGE,
  PATH_TRUNK,
);

export const PATH_B: Pt[] = joinPolylines(
  PATH_CLIENT_LB,
  [LB_LEFT, LB_RIGHT],
  PATH_LB_STUB,
  PATH_LB_APPB,
  [APPB_LEFT, APPB_RIGHT],
  PATH_APPB_TO_MERGE,
  PATH_TRUNK,
);

export const PATH_B_LOST: Pt[] = joinPolylines(
  PATH_CLIENT_LB,
  [LB_LEFT, LB_RIGHT],
  PATH_LB_STUB,
  PATH_LB_APPB,
  [APPB_LEFT, CENTER.appb],
);

export const PATH_FAIL_BRANCH: Pt[] = joinPolylines(PATH_LB_APPB, [APPB_LEFT, CENTER.appb]);

export const PATH_A_NODES: NodeId[] = ["client", "lb", "appa", "cache", "db"];
export const PATH_B_NODES: NodeId[] = ["client", "lb", "appb", "db"];
export const PATH_B_LOST_NODES: NodeId[] = ["client", "lb", "appb"];

export const A_START = 175;
export const A_DUR = 300;
export const B_START = 250;
export const B_DUR = 300;

export const ease = Easing.inOut(Easing.cubic);

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

export const closestProgress = (pts: Pt[], target: Pt): number => {
  const total = polylineLength(pts);
  if (total === 0) {
    return 0;
  }
  let bestDist = Number.POSITIVE_INFINITY;
  let bestWalked = 0;
  let walked = 0;
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1].x;
    const ay = pts[i - 1].y;
    const dx = pts[i].x - ax;
    const dy = pts[i].y - ay;
    const seg = Math.hypot(dx, dy);
    if (seg === 0) {
      continue;
    }
    const u = Math.max(0, Math.min(1, ((target.x - ax) * dx + (target.y - ay) * dy) / (seg * seg)));
    const px = ax + dx * u;
    const py = ay + dy * u;
    const dist = Math.hypot(target.x - px, target.y - py);
    if (dist < bestDist) {
      bestDist = dist;
      bestWalked = walked + seg * u;
    }
    walked += seg;
  }
  return bestWalked / total;
};

export const arrivalT = (path: Pt[], ids: readonly NodeId[]): Record<NodeId, number> => {
  const out = {} as Record<NodeId, number>;
  for (const id of ids) {
    out[id] = closestProgress(path, CENTER[id]);
  }
  return out;
};

export const PATH_A_ARRIVAL = arrivalT(PATH_A, PATH_A_NODES);
export const PATH_B_ARRIVAL = arrivalT(PATH_B, PATH_B_NODES);
export const PATH_B_LOST_ARRIVAL = arrivalT(PATH_B_LOST, PATH_B_LOST_NODES);
export const PATH_B_LOST_BRANCH_T = closestProgress(PATH_B_LOST, BRANCH_PT);

export const B_LOST_DUR = Math.max(90, Math.round(B_DUR * (polylineLength(PATH_B_LOST) / polylineLength(PATH_B))));

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

const toD = (pts: Pt[]) => pts.map((pt, index) => `${index === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");

export const Connector: FC<{
  pts: Pt[];
  progress: number;
  color?: string;
  width?: number;
  opacity?: number;
}> = ({ pts, progress, color = PATH_COLOR, width = STROKE, opacity = 0.95 }) => {
  const draw = Math.max(0, Math.min(1, progress));
  if (draw <= 0 || pts.length < 2) {
    return null;
  }
  const len = polylineLength(pts);
  return (
    <path
      d={toD(pts)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - draw)}
      opacity={opacity}
    />
  );
};

export type PacketView = { pos: Pt; color: string; opacity: number; scale?: number };

export const packetAlong = (
  frame: number,
  start: number,
  duration: number,
  path: Pt[],
  color: string,
  opts?: { fadeOutStart?: number; fadeOutDur?: number },
): PacketView | null => {
  if (frame < start) {
    return null;
  }
  const fadeOutDur = opts?.fadeOutDur ?? 20;
  if (opts?.fadeOutStart !== undefined && frame >= opts.fadeOutStart + fadeOutDur) {
    return null;
  }
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeIn = interpolate(frame, [start, start + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let opacity = fadeIn;
  let scale = 1;
  if (opts?.fadeOutStart !== undefined) {
    const fadeOut = interpolate(frame, [opts.fadeOutStart, opts.fadeOutStart + fadeOutDur], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    opacity *= fadeOut;
    scale = interpolate(frame, [opts.fadeOutStart, opts.fadeOutStart + fadeOutDur], [1, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return { pos: walkPolyline(path, t), color, opacity, scale };
};

export const packetT = (frame: number, start: number, duration: number): number => {
  if (frame < start) {
    return 0;
  }
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const badgeFromT = (t: number, arrival: number, done: boolean): number => {
  if (done) {
    return 1;
  }
  const start = Math.min(arrival, 0.96);
  return interpolate(t, [start, start + 0.05], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export type NodeFx = {
  glow?: string;
  badge?: BadgeKind;
  badgeOpacity?: number;
  dim?: number;
};

export type OverlayPath = {
  pts: Pt[];
  progress: number;
  color: string;
  width?: number;
  opacity?: number;
};

const Badge: FC<{ kind: BadgeKind; opacity: number }> = ({ kind, opacity }) => {
  if (opacity <= 0) {
    return null;
  }
  const success = kind === "check";
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        background: success ? "#16382C" : "#3A1A22",
        border: `1.5px solid ${success ? SUCCESS_COLOR : FAIL_COLOR}`,
        boxShadow: success ? `0 0 16px ${SUCCESS_COLOR}88` : `0 0 16px ${FAIL_COLOR}88`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={staticFile(success ? "icons/check.svg" : "icons/x.svg")}
        style={{ width: 22, height: 22 }}
      />
    </div>
  );
};

export const IconPathStage: FC<{
  title: string;
  caption: string;
  packets: PacketView[];
  nodeFx: Partial<Record<NodeId, NodeFx>>;
  overlays?: OverlayPath[];
}> = ({ title, caption, packets, nodeFx, overlays = [] }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {DRAW_PATHS.map((item, index) => {
          const progress = interpolate(frame, [item.start, item.start + item.dur], [0, 1], {
            easing: ease,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return <Connector key={`base-${index}`} pts={item.pts} progress={progress} />;
        })}
        {overlays.map((item, index) => (
          <Connector
            key={`overlay-${index}`}
            pts={item.pts}
            progress={item.progress}
            color={item.color}
            width={item.width}
            opacity={item.opacity}
          />
        ))}
      </svg>

      {NODES.map((node, index) => {
        const appear = interpolate(frame, [8 + index * 7, 24 + index * 7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(appear, [0, 1], [14, 0]);
        const fx = nodeFx[node.id];
        const glow = fx?.glow;
        const dim = fx?.dim ?? 1;
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y + y,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 20,
              background: "linear-gradient(180deg, #1A2438 0%, #151C2C 100%)",
              border: glow ? `2px solid ${glow}` : "1.5px solid rgba(255,255,255,0.08)",
              boxShadow: glow
                ? `0 0 0 5px ${glow}33, 0 0 28px ${glow}88, 0 16px 36px rgba(0,0,0,0.28)`
                : "0 16px 36px rgba(0,0,0,0.28)",
              opacity: appear * dim,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", height: 6, background: node.accent }} />
            <Img src={staticFile(node.file)} style={{ width: 64, height: 64, marginTop: 28 }} />
            <Txt
              style={{
                marginTop: 16,
                fontFamily: FONT_FAMILY,
                fontSize: 24,
                fontWeight: 700,
                color: "#EBF0FA",
                letterSpacing: "0.03em",
              }}
            >
              {node.label}
            </Txt>
            {fx?.badge ? <Badge kind={fx.badge} opacity={fx.badgeOpacity ?? 1} /> : null}
          </div>
        );
      })}

      {packets.map((packet, index) => {
        const size = 18 * (packet.scale ?? 1);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: packet.pos.x,
              top: packet.pos.y,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
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
          top: 36,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 40,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.04em",
          opacity: titleOpacity,
        }}
      >
        {title}
      </Txt>
      <Txt
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
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
    </AbsoluteFill>
  );
};

export const ICON_PATH_META = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
