import type { CSSProperties, FC, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 540;

const CARD_W = 220;
const CARD_H = 214;
const PATH_COLOR = "#9BB8DC";
const SYN_COLOR = "#7CE7FF";
const SYNACK_COLOR = "#FFB020";
const ACK_COLOR = "#9BE7FF";
const SUCCESS_COLOR = "#5EE9A0";
const CLIENT_ACCENT = "#59A6FF";
const SERVER_ACCENT = "#F0C14B";

type Pt = { x: number; y: number };
type NodeId = "client" | "server";

type NodeDef = {
  id: NodeId;
  label: string;
  hint: string;
  file: string;
  accent: string;
  x: number;
  y: number;
};

const ease = Easing.inOut(Easing.cubic);

const CLIENT_X = 280;
const SERVER_X = WIDTH - 280 - CARD_W;
const CARD_Y = 430;
const CY = CARD_Y + CARD_H / 2;
const FORWARD_Y = CY - 28;
const REVERSE_Y = CY + 28;

const NODES: NodeDef[] = [
  {
    id: "client",
    label: "Client",
    hint: "クライアント",
    file: "icons/client.svg",
    accent: CLIENT_ACCENT,
    x: CLIENT_X,
    y: CARD_Y,
  },
  {
    id: "server",
    label: "Server",
    hint: "サーバ",
    file: "icons/server.svg",
    accent: SERVER_ACCENT,
    x: SERVER_X,
    y: CARD_Y,
  },
];

const CLIENT = NODES[0];
const SERVER = NODES[1];

const PATH_FORWARD: Pt[] = [
  { x: CLIENT.x + CARD_W, y: FORWARD_Y },
  { x: SERVER.x, y: FORWARD_Y },
];
const PATH_REVERSE: Pt[] = [
  { x: SERVER.x, y: REVERSE_Y },
  { x: CLIENT.x + CARD_W, y: REVERSE_Y },
];

const SYN_START = 86;
const SYN_DUR = 90;
const SYNACK_START = 186;
const SYNACK_DUR = 90;
const ACK_START = 286;
const ACK_DUR = 90;
const SUCCESS_AT = ACK_START + ACK_DUR + 4;

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

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

const toD = (pts: Pt[]) => pts.map((pt, index) => `${index === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");

const packetT = (frame: number, start: number, duration: number) => {
  if (frame < start) {
    return 0;
  }
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const Connector: FC<{
  pts: Pt[];
  progress: number;
  color?: string;
  width?: number;
  opacity?: number;
  markerId?: string;
}> = ({ pts, progress, color = PATH_COLOR, width = 3.5, opacity = 0.55, markerId }) => {
  const len = polylineLength(pts);
  const t = Math.max(0, Math.min(1, progress));
  return (
    <path
      d={toD(pts)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={t === 0 ? 0 : opacity}
      strokeDasharray={len}
      strokeDashoffset={len * (1 - t)}
      markerEnd={t > 0.92 && markerId ? `url(#${markerId})` : undefined}
    />
  );
};

type PacketView = {
  pos: Pt;
  color: string;
  label: string;
  hint: string;
  opacity: number;
};

const Badge: FC<{ opacity: number }> = ({ opacity }) => {
  if (opacity <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "#16382C",
        border: `1.5px solid ${SUCCESS_COLOR}`,
        boxShadow: `0 0 16px ${SUCCESS_COLOR}88`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile("icons/check.svg")} style={{ width: 22, height: 22 }} />
    </div>
  );
};

const Packet: FC<{ packet: PacketView }> = ({ packet }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: packet.pos.x,
        top: packet.pos.y,
        transform: "translate(-50%, -50%)",
        opacity: packet.opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          marginBottom: 10,
          padding: "6px 14px",
          borderRadius: 999,
          background: "#1A2438",
          border: `1.5px solid ${packet.color}`,
          color: packet.color,
          fontFamily: FONT_FAMILY,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.1em",
          boxShadow: `0 0 16px ${packet.color}55`,
          whiteSpace: "nowrap",
        }}
      >
        {packet.label}
        <span style={{ marginLeft: 8, fontSize: 13, letterSpacing: "0.04em", opacity: 0.85 }}>
          {packet.hint}
        </span>
      </div>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: packet.color,
          boxShadow: `0 0 0 4px ${packet.color}33, 0 0 22px ${packet.color}`,
        }}
      />
    </div>
  );
};

const captionFor = (frame: number) => {
  if (frame >= SUCCESS_AT) {
    return { kicker: "ESTABLISHED", text: "3ウェイハンドシェイク完了" };
  }
  if (frame >= ACK_START) {
    return { kicker: "STEP 3  ACK", text: "クライアントが確認し、接続が確立する" };
  }
  if (frame >= SYNACK_START) {
    return { kicker: "STEP 2  SYN-ACK", text: "サーバが受理し、自分の SYN を返す" };
  }
  if (frame >= SYN_START) {
    return { kicker: "STEP 1  SYN", text: "クライアントが接続開始を要求する" };
  }
  return { kicker: "TCP 3WAY", text: "SYN → SYN-ACK → ACK" };
};

export const TcpThreeWaySuccess: FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 18], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathDraw = interpolate(frame, [44, 76], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tSyn = packetT(frame, SYN_START, SYN_DUR);
  const tSynAck = packetT(frame, SYNACK_START, SYNACK_DUR);
  const tAck = packetT(frame, ACK_START, ACK_DUR);
  const success = frame >= SUCCESS_AT;
  const successFade = interpolate(frame, [SUCCESS_AT, SUCCESS_AT + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const packets: PacketView[] = [];
  if (frame >= SYN_START && frame < SYNACK_START - 6) {
    packets.push({
      pos: walkPolyline(PATH_FORWARD, tSyn),
      color: SYN_COLOR,
      label: "SYN",
      hint: "seq=x",
      opacity: interpolate(frame, [SYN_START, SYN_START + 6, SYN_START + SYN_DUR - 8, SYN_START + SYN_DUR], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    });
  }
  if (frame >= SYNACK_START && frame < ACK_START - 6) {
    packets.push({
      pos: walkPolyline(PATH_REVERSE, tSynAck),
      color: SYNACK_COLOR,
      label: "SYN-ACK",
      hint: "seq=y ack=x+1",
      opacity: interpolate(
        frame,
        [SYNACK_START, SYNACK_START + 6, SYNACK_START + SYNACK_DUR - 8, SYNACK_START + SYNACK_DUR],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    });
  }
  if (frame >= ACK_START && frame < SUCCESS_AT + 10) {
    packets.push({
      pos: walkPolyline(PATH_FORWARD, tAck),
      color: ACK_COLOR,
      label: "ACK",
      hint: "ack=y+1",
      opacity: interpolate(
        frame,
        [ACK_START, ACK_START + 6, ACK_START + ACK_DUR - 6, ACK_START + ACK_DUR + 8],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    });
  }

  const activeGlow: Partial<Record<NodeId, string>> = {};
  if (!success) {
    if (frame >= SYN_START && frame < SYNACK_START) {
      activeGlow.client = tSyn < 0.18 ? SYN_COLOR : undefined;
      activeGlow.server = tSyn > 0.82 ? SYN_COLOR : undefined;
    } else if (frame >= SYNACK_START && frame < ACK_START) {
      activeGlow.server = tSynAck < 0.18 ? SYNACK_COLOR : undefined;
      activeGlow.client = tSynAck > 0.82 ? SYNACK_COLOR : undefined;
    } else if (frame >= ACK_START) {
      activeGlow.client = tAck < 0.18 ? ACK_COLOR : undefined;
      activeGlow.server = tAck > 0.82 ? ACK_COLOR : undefined;
    }
  }

  const caption = captionFor(frame);
  const stepIndex = success ? 3 : frame >= ACK_START ? 2 : frame >= SYNACK_START ? 1 : frame >= SYN_START ? 0 : -1;
  const steps = [
    { key: "SYN", color: SYN_COLOR },
    { key: "SYN-ACK", color: SYNACK_COLOR },
    { key: "ACK", color: ACK_COLOR },
  ];

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 55% at 50% 42%, #13203a 0%, #121726 72%)",
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

      <Txt
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 48,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.04em",
          opacity: fadeIn,
          transform: `translateY(${titleY}px)`,
        }}
      >
        TCP 3ウェイハンドシェイク
      </Txt>
      <Txt
        style={{
          position: "absolute",
          top: 138,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: success ? SUCCESS_COLOR : "#8ea0c2",
          opacity: fadeIn,
        }}
      >
        SYN → SYN-ACK → ACK
      </Txt>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <marker id="arrow-fwd" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={success ? SUCCESS_COLOR : PATH_COLOR} />
          </marker>
          <marker id="arrow-rev" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={success ? SUCCESS_COLOR : PATH_COLOR} />
          </marker>
          <marker id="arrow-syn" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={SYN_COLOR} />
          </marker>
          <marker id="arrow-synack" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={SYNACK_COLOR} />
          </marker>
          <marker id="arrow-ack" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={ACK_COLOR} />
          </marker>
        </defs>
        <Connector pts={PATH_FORWARD} progress={pathDraw} markerId="arrow-fwd" />
        <Connector pts={PATH_REVERSE} progress={pathDraw} markerId="arrow-rev" />
        <Connector
          pts={PATH_FORWARD}
          progress={frame >= SYN_START ? tSyn : 0}
          color={success ? SUCCESS_COLOR : SYN_COLOR}
          width={5}
          opacity={success ? 0.9 : 0.72}
          markerId={success ? "arrow-fwd" : "arrow-syn"}
        />
        <Connector
          pts={PATH_REVERSE}
          progress={frame >= SYNACK_START ? tSynAck : 0}
          color={success ? SUCCESS_COLOR : SYNACK_COLOR}
          width={5}
          opacity={success ? 0.9 : 0.72}
          markerId={success ? "arrow-rev" : "arrow-synack"}
        />
        {frame >= ACK_START ? (
          <Connector
            pts={PATH_FORWARD}
            progress={tAck}
            color={success ? SUCCESS_COLOR : ACK_COLOR}
            width={6}
            opacity={success ? 0.95 : 0.8}
            markerId={success ? "arrow-fwd" : "arrow-ack"}
          />
        ) : null}
      </svg>

      {NODES.map((node, index) => {
        const appear = interpolate(frame, [10 + index * 12, 36 + index * 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(appear, [0, 1], [18, 0]);
        const glow = success ? SUCCESS_COLOR : activeGlow[node.id];
        const barColor = success ? SUCCESS_COLOR : node.accent;
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
            <div style={{ width: "100%", height: 6, background: barColor }} />
            <Img src={staticFile(node.file)} style={{ width: 64, height: 64, marginTop: 28 }} />
            <Txt
              style={{
                marginTop: 16,
                fontSize: 28,
                fontWeight: 700,
                color: "#EBF0FA",
                letterSpacing: "0.03em",
              }}
            >
              {node.label}
            </Txt>
            <Txt style={{ marginTop: 4, fontSize: 15, color: "#8ea0c2", letterSpacing: "0.08em" }}>
              {node.hint}
            </Txt>
            {success ? <Badge opacity={successFade} /> : null}
          </div>
        );
      })}

      {packets.map((packet) => (
        <Packet key={`${packet.label}-${packet.pos.x.toFixed(0)}`} packet={packet} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 168,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          opacity: fadeIn,
        }}
      >
        {steps.map((step, index) => {
          const done = success || stepIndex > index;
          const active = !success && stepIndex === index;
          const color = done ? SUCCESS_COLOR : active ? step.color : "#6d7f9e";
          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {index > 0 ? (
                <div style={{ width: 28, height: 2, background: done ? SUCCESS_COLOR : "#3a4a66", opacity: 0.9 }} />
              ) : null}
              <div
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: `1.5px solid ${color}`,
                  color,
                  background: done || active ? "#1A2438" : "transparent",
                  boxShadow: done || active ? `0 0 16px ${color}44` : undefined,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                }}
              >
                {done ? "✓ " : `${index + 1}  `}
                {step.key}
              </div>
            </div>
          );
        })}
      </div>

      <Txt
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 72,
          textAlign: "center",
          fontSize: 26,
          fontWeight: 500,
          color: success ? SUCCESS_COLOR : "#C5D3EE",
          opacity: fadeIn,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 15,
            letterSpacing: "0.22em",
            color: success ? SUCCESS_COLOR : "#6d7f9e",
            marginBottom: 10,
          }}
        >
          {caption.kicker}
        </span>
        {caption.text}
      </Txt>
    </AbsoluteFill>
  );
};

export const TCP_THREE_WAY_SUCCESS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
