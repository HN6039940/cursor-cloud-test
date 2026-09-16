import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 750;

const CARD_W = 168;
const CARD_H = 188;
const STROKE = 3.5;
const PATH_COLOR = "#9BB8DC";
const A_COLOR = "#7CE7FF";
const B_COLOR = "#FFB020";

type Pt = { x: number; y: number };
type NodeId = "client" | "lb" | "appa" | "appb" | "cache" | "db";

type NodeDef = {
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
const X_DB = X_CACHE + CARD_W + COL_GAP;

const CY_MID = 540;
const CY_UP = 340;
const CY_DN = 740;
const topFor = (cy: number) => cy - CARD_H / 2;

const NODES: NodeDef[] = [
  { id: "client", label: "Client", file: "icons/client.svg", accent: "#59A6FF", x: X_CLIENT, y: topFor(CY_MID) },
  { id: "lb", label: "LB", file: "icons/lb.svg", accent: "#4DD18C", x: X_LB, y: topFor(CY_MID) },
  { id: "appa", label: "App A", file: "icons/app.svg", accent: "#F0C14B", x: X_APPS, y: topFor(CY_UP) },
  { id: "appb", label: "App B", file: "icons/app.svg", accent: "#FF8A4C", x: X_APPS, y: topFor(CY_DN) },
  { id: "cache", label: "Cache", file: "icons/cache.svg", accent: "#C084FC", x: X_CACHE, y: topFor(CY_UP) },
  { id: "db", label: "DB", file: "icons/db.svg", accent: "#A78BFA", x: X_DB, y: topFor(CY_MID) },
];

const NODE = Object.fromEntries(NODES.map((node) => [node.id, node])) as Record<NodeId, NodeDef>;

const leftMid = (node: NodeDef): Pt => ({ x: node.x, y: node.y + CARD_H / 2 });
const rightMid = (node: NodeDef): Pt => ({ x: node.x + CARD_W, y: node.y + CARD_H / 2 });
const center = (node: NodeDef): Pt => ({ x: node.x + CARD_W / 2, y: node.y + CARD_H / 2 });

const CENTER: Record<NodeId, Pt> = {
  client: center(NODE.client),
  lb: center(NODE.lb),
  appa: center(NODE.appa),
  appb: center(NODE.appb),
  cache: center(NODE.cache),
  db: center(NODE.db),
};

const BRANCH_X = (rightMid(NODE.lb).x + leftMid(NODE.appa).x) / 2;
const MERGE_X = (rightMid(NODE.cache).x + leftMid(NODE.db).x) / 2;

const CLIENT_RIGHT = rightMid(NODE.client);
const LB_LEFT = leftMid(NODE.lb);
const LB_RIGHT = rightMid(NODE.lb);
const APPA_LEFT = leftMid(NODE.appa);
const APPA_RIGHT = rightMid(NODE.appa);
const APPB_LEFT = leftMid(NODE.appb);
const APPB_RIGHT = rightMid(NODE.appb);
const CACHE_LEFT = leftMid(NODE.cache);
const CACHE_RIGHT = rightMid(NODE.cache);
const DB_LEFT = leftMid(NODE.db);
const BRANCH_PT: Pt = { x: BRANCH_X, y: CY_MID };
const MERGE_PT: Pt = { x: MERGE_X, y: CY_MID };

const PATH_CLIENT_LB: Pt[] = [CLIENT_RIGHT, LB_LEFT];
const PATH_LB_STUB: Pt[] = [LB_RIGHT, BRANCH_PT];
const PATH_LB_APPA: Pt[] = [BRANCH_PT, { x: BRANCH_X, y: CY_UP }, APPA_LEFT];
const PATH_LB_APPB: Pt[] = [BRANCH_PT, { x: BRANCH_X, y: CY_DN }, APPB_LEFT];
const PATH_APPA_CACHE: Pt[] = [APPA_RIGHT, CACHE_LEFT];
const PATH_CACHE_TO_MERGE: Pt[] = [CACHE_RIGHT, { x: MERGE_X, y: CY_UP }, MERGE_PT];
const PATH_APPB_TO_MERGE: Pt[] = [APPB_RIGHT, { x: MERGE_X, y: CY_DN }, MERGE_PT];
const PATH_TRUNK: Pt[] = [MERGE_PT, DB_LEFT];
const PATH_SPINE: Pt[] = [
  { x: MERGE_X, y: CY_UP },
  { x: MERGE_X, y: CY_DN },
];

const DRAW_PATHS: { pts: Pt[]; start: number; dur: number }[] = [
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

const joinPolylines = (...parts: Pt[][]): Pt[] => {
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

const PATH_A: Pt[] = joinPolylines(
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

const PATH_B: Pt[] = joinPolylines(
  PATH_CLIENT_LB,
  [LB_LEFT, LB_RIGHT],
  PATH_LB_STUB,
  PATH_LB_APPB,
  [APPB_LEFT, APPB_RIGHT],
  PATH_APPB_TO_MERGE,
  PATH_TRUNK,
);

const PATH_A_NODES: NodeId[] = ["client", "lb", "appa", "cache", "db"];
const PATH_B_NODES: NodeId[] = ["client", "lb", "appb", "db"];

const A_START = 175;
const A_DUR = 300;
const B_START = 250;
const B_DUR = 300;

const ease = Easing.inOut(Easing.cubic);

const polylineLength = (pts: Pt[]) => {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
};

const walkPolyline = (pts: Pt[], t: number): Pt => {
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

const nearestNode = (pos: Pt, ids: readonly NodeId[]): NodeId => {
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

const toD = (pts: Pt[]) =>
  pts.map((pt, index) => `${index === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");

const Connector: FC<{ pts: Pt[]; progress: number }> = ({ pts, progress }) => {
  const draw = Math.max(0, Math.min(1, progress));
  if (draw <= 0 || pts.length < 2) {
    return null;
  }
  const len = polylineLength(pts);
  return (
    <path
      d={toD(pts)}
      fill="none"
      stroke={PATH_COLOR}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - draw)}
      opacity={0.95}
    />
  );
};

type PacketView = { pos: Pt; color: string; opacity: number };

const packetAlong = (
  frame: number,
  start: number,
  duration: number,
  path: Pt[],
  color: string,
): PacketView | null => {
  if (frame < start) {
    return null;
  }
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [start, start + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { pos: walkPolyline(path, t), color, opacity: fade };
};

export const IconPathBranch: FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const aDone = frame >= A_START + A_DUR;
  const bDone = frame >= B_START + B_DUR;
  const packetA = packetAlong(frame, A_START, A_DUR, PATH_A, A_COLOR);
  const packetB = packetAlong(frame, B_START, B_DUR, PATH_B, B_COLOR);
  if (packetA && aDone && bDone) {
    packetA.pos = { x: CENTER.db.x - 16, y: CENTER.db.y - 16 };
  }
  if (packetB && aDone && bDone) {
    packetB.pos = { x: CENTER.db.x - 16, y: CENTER.db.y + 16 };
  }

  const active: Partial<Record<NodeId, string>> = {};
  if (packetA) {
    active[nearestNode(packetA.pos, PATH_A_NODES)] = A_COLOR;
  }
  if (packetB) {
    const id = nearestNode(packetB.pos, PATH_B_NODES);
    active[id] = id === "db" && active.db ? "#E8F4FF" : B_COLOR;
  }

  let caption = "Lucide アイコンと Remotion パス";
  if (aDone && bDone) {
    caption = "DB で合流";
  } else if (packetA && packetA.pos.x >= MERGE_X - 8 && packetB && packetB.pos.x >= MERGE_X - 8) {
    caption = "1 本のトランクに合流";
  } else if (frame >= B_START) {
    caption = "App A / App B へ分岐";
  } else if (frame >= A_START) {
    caption = "LB で振り分け";
  }

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
          return <Connector key={index} pts={item.pts} progress={progress} />;
        })}
      </svg>

      {NODES.map((node, index) => {
        const appear = interpolate(frame, [8 + index * 7, 24 + index * 7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(appear, [0, 1], [14, 0]);
        const glow = active[node.id];
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
              opacity: appear,
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
          </div>
        );
      })}

      {[packetA, packetB].filter((item): item is PacketView => item !== null).map((packet, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: packet.pos.x,
            top: packet.pos.y,
            width: 18,
            height: 18,
            marginLeft: -9,
            marginTop: -9,
            borderRadius: "50%",
            background: packet.color,
            opacity: packet.opacity,
            boxShadow: `0 0 0 4px ${packet.color}33, 0 0 22px ${packet.color}`,
          }}
        />
      ))}

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
        アイコン経路の分岐と合流
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

export const ICON_PATH_BRANCH = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
