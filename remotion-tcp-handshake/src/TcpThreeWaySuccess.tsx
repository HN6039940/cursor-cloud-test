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

const CARD_W = 220;
const CARD_H = 214;
const PATH_COLOR = "#9BB8DC";
const SYN_COLOR = "#7CE7FF";
const SYNACK_COLOR = "#FFB020";
const ACK_COLOR = "#9BE7FF";
const SUCCESS_COLOR = "#5EE9A0";
const CLIENT_ACCENT = "#59A6FF";
const SERVER_ACCENT = "#F0C14B";
const PEAK_SCALE = 2;

type Pt = { x: number; y: number };
type NodeId = "client" | "server";
type CameraView = { scale: number; x: number; y: number };

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
const FORWARD_Y = CY - 36;
const REVERSE_Y = CY + 36;

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

const MID_FORWARD: Pt = {
  x: (PATH_FORWARD[0].x + PATH_FORWARD[1].x) / 2,
  y: FORWARD_Y,
};
const MID_REVERSE: Pt = {
  x: (PATH_REVERSE[0].x + PATH_REVERSE[1].x) / 2,
  y: REVERSE_Y,
};

const IDENTITY_CAM: CameraView = { scale: 1, x: 0, y: 0 };

const INTRO_END = 96;
const ZOOM_DUR = 42;
const TRAVEL_DUR = 96;
const LAND_HOLD = 48;
const OUTRO_DUR = 72;
const SUCCESS_HOLD = 180;

const synZoom = INTRO_END;
const synTravel = synZoom + ZOOM_DUR;
const synLand = synTravel + TRAVEL_DUR;
const synEnd = synLand + LAND_HOLD;

const synackZoom = synEnd;
const synackTravel = synackZoom + ZOOM_DUR;
const synackLand = synackTravel + TRAVEL_DUR;
const synackEnd = synackLand + LAND_HOLD;

const ackZoom = synackEnd;
const ackTravel = ackZoom + ZOOM_DUR;
const ackLand = ackTravel + TRAVEL_DUR;
const ackEnd = ackLand + LAND_HOLD;

const outroStart = ackEnd;
const successAt = outroStart + OUTRO_DUR;
export const DURATION = successAt + SUCCESS_HOLD;

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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const cameraFocus = (zoomT: number, target: Pt, peakScale: number): CameraView => {
  const t = clamp01(zoomT);
  const scale = 1 + (peakScale - 1) * t;
  const screenX = target.x + (WIDTH / 2 - target.x) * t;
  const screenY = target.y + (HEIGHT / 2 - target.y) * t;
  return {
    scale,
    x: screenX - target.x * scale,
    y: screenY - target.y * scale,
  };
};

const FOCUS_FORWARD = cameraFocus(1, MID_FORWARD, PEAK_SCALE);
const FOCUS_REVERSE = cameraFocus(1, MID_REVERSE, PEAK_SCALE);

const lerpCam = (from: CameraView, to: CameraView, t: number): CameraView => {
  const u = clamp01(t);
  return {
    scale: from.scale + (to.scale - from.scale) * u,
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  };
};

const linearT = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const cameraAt = (frame: number): CameraView => {
  if (frame < synZoom) {
    return IDENTITY_CAM;
  }
  if (frame < synTravel) {
    return lerpCam(IDENTITY_CAM, FOCUS_FORWARD, linearT(frame, synZoom, synTravel));
  }
  if (frame < synackZoom) {
    return FOCUS_FORWARD;
  }
  if (frame < synackTravel) {
    return lerpCam(FOCUS_FORWARD, FOCUS_REVERSE, linearT(frame, synackZoom, synackTravel));
  }
  if (frame < ackZoom) {
    return FOCUS_REVERSE;
  }
  if (frame < ackTravel) {
    return lerpCam(FOCUS_REVERSE, FOCUS_FORWARD, linearT(frame, ackZoom, ackTravel));
  }
  if (frame < outroStart) {
    return FOCUS_FORWARD;
  }
  if (frame < successAt) {
    return lerpCam(FOCUS_FORWARD, IDENTITY_CAM, linearT(frame, outroStart, successAt));
  }
  return IDENTITY_CAM;
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
  const t = clamp01(progress);
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

type PathCaption = {
  flag: string;
  direction: string;
  seq: string;
  color: string;
  at: Pt;
  offsetY: number;
  opacity: number;
};

const PathReadout: FC<{ caption: PathCaption }> = ({ caption }) => {
  if (caption.opacity <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: caption.at.x,
        top: caption.at.y + caption.offsetY,
        transform: "translate(-50%, -50%)",
        opacity: caption.opacity,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "10px 22px",
        borderRadius: 999,
        background: "rgba(18, 23, 38, 0.92)",
        border: `1.5px solid ${caption.color}`,
        boxShadow: `0 0 22px ${caption.color}55`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: caption.color,
        }}
      >
        {caption.flag}
      </span>
      <span style={{ width: 1, height: 18, background: caption.color, opacity: 0.45 }} />
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#EBF0FA",
        }}
      >
        {caption.direction}
      </span>
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: caption.color,
          opacity: 0.9,
        }}
      >
        {caption.seq}
      </span>
    </div>
  );
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

const captionFor = (frame: number) => {
  if (frame >= successAt) {
    return { kicker: "ESTABLISHED", text: "3ウェイハンドシェイク完了" };
  }
  if (frame >= ackZoom) {
    return { kicker: "STEP 3  PATH  ACK", text: "Client → Server の経路で ACK を送る" };
  }
  if (frame >= synackZoom) {
    return { kicker: "STEP 2  PATH  SYN+ACK", text: "Server → Client の経路で SYN+ACK を返す" };
  }
  if (frame >= synZoom) {
    return { kicker: "STEP 1  PATH  SYN", text: "Client → Server の経路で SYN を送る" };
  }
  return { kicker: "TCP 3WAY", text: "経路に沿って SYN → SYN-ACK → ACK" };
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
  const zoomed =
    frame >= synTravel && frame < outroStart
      ? 1
      : frame >= synZoom && frame < synTravel
        ? linearT(frame, synZoom, synTravel)
        : frame >= outroStart && frame < successAt
          ? 1 - linearT(frame, outroStart, successAt)
          : 0;
  const hudDim = interpolate(zoomed, [0, 1], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathDraw = interpolate(frame, [44, 76], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tSyn = packetT(frame, synTravel, TRAVEL_DUR);
  const tSynAck = packetT(frame, synackTravel, TRAVEL_DUR);
  const tAck = packetT(frame, ackTravel, TRAVEL_DUR);
  const success = frame >= successAt;
  const successFade = interpolate(frame, [successAt, successAt + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cam = cameraAt(frame);
  const onForwardBeat = frame >= synTravel && frame < synackZoom;
  const onReverseBeat = frame >= synackTravel && frame < ackZoom;
  const onAckBeat = frame >= ackTravel && frame < outroStart;

  const synVisible = frame >= synTravel && frame < synackZoom;
  const synackVisible = frame >= synackTravel && frame < ackZoom;
  const ackVisible = frame >= ackTravel && frame < outroStart;

  const packets: { pos: Pt; color: string; opacity: number }[] = [];
  if (synVisible) {
    packets.push({
      pos: walkPolyline(PATH_FORWARD, frame >= synLand ? 1 : tSyn),
      color: SYN_COLOR,
      opacity: interpolate(frame, [synTravel, synTravel + 6, synEnd - 10, synEnd], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    });
  }
  if (synackVisible) {
    packets.push({
      pos: walkPolyline(PATH_REVERSE, frame >= synackLand ? 1 : tSynAck),
      color: SYNACK_COLOR,
      opacity: interpolate(
        frame,
        [synackTravel, synackTravel + 6, synackEnd - 10, synackEnd],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    });
  }
  if (ackVisible) {
    packets.push({
      pos: walkPolyline(PATH_FORWARD, frame >= ackLand ? 1 : tAck),
      color: ACK_COLOR,
      opacity: interpolate(frame, [ackTravel, ackTravel + 6, ackEnd - 10, ackEnd], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    });
  }

  const readouts: PathCaption[] = [];
  if (frame >= synTravel && frame < synackZoom) {
    readouts.push({
      flag: "SYN",
      direction: "Client → Server",
      seq: "seq=x",
      color: SYN_COLOR,
      at: MID_FORWARD,
      offsetY: -56,
      opacity: interpolate(frame, [synTravel, synTravel + 8, synEnd - 12, synEnd], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    });
  }
  if (frame >= synackTravel && frame < ackZoom) {
    readouts.push({
      flag: "SYN + ACK",
      direction: "Server → Client",
      seq: "seq=y  ack=x+1",
      color: SYNACK_COLOR,
      at: MID_REVERSE,
      offsetY: 56,
      opacity: interpolate(
        frame,
        [synackTravel, synackTravel + 8, synackEnd - 12, synackEnd],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    });
  }
  if (frame >= ackTravel && frame < outroStart) {
    readouts.push({
      flag: "ACK",
      direction: "Client → Server",
      seq: "ack=y+1",
      color: ACK_COLOR,
      at: MID_FORWARD,
      offsetY: -56,
      opacity: interpolate(frame, [ackTravel, ackTravel + 8, ackEnd - 12, ackEnd], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    });
  }

  const activeGlow: Partial<Record<NodeId, string>> = {};
  if (!success) {
    if (onForwardBeat) {
      activeGlow.client = tSyn < 0.22 ? SYN_COLOR : undefined;
      activeGlow.server = tSyn > 0.78 || frame >= synLand ? SYN_COLOR : undefined;
    } else if (onReverseBeat) {
      activeGlow.server = tSynAck < 0.22 ? SYNACK_COLOR : undefined;
      activeGlow.client = tSynAck > 0.78 || frame >= synackLand ? SYNACK_COLOR : undefined;
    } else if (onAckBeat) {
      activeGlow.client = tAck < 0.22 ? ACK_COLOR : undefined;
      activeGlow.server = tAck > 0.78 || frame >= ackLand ? ACK_COLOR : undefined;
    }
  }

  const caption = captionFor(frame);
  const stepIndex = success ? 3 : frame >= ackZoom ? 2 : frame >= synackZoom ? 1 : frame >= synZoom ? 0 : -1;
  const steps = [
    { key: "SYN", color: SYN_COLOR },
    { key: "SYN-ACK", color: SYNACK_COLOR },
    { key: "ACK", color: ACK_COLOR },
  ];

  const synTrail = frame >= synLand ? 1 : frame >= synTravel ? tSyn : 0;
  const synackTrail = frame >= synackLand ? 1 : frame >= synackTravel ? tSynAck : 0;
  const ackTrail = frame >= ackTravel ? tAck : 0;
  const idlePathOpacity = success ? 0.18 : zoomed > 0.4 ? 0.2 : 0.5;
  const dimInactive = zoomed > 0.4 ? 0.22 : 0.7;
  const activePathOpacity = success ? 0.95 : 0.92;

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY, overflow: "hidden" }}>
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "0 0",
        }}
      >
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
            <marker id="arrow-success-fwd" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 1 1 L 9 5 L 1 9 Z" fill={SUCCESS_COLOR} />
            </marker>
            <marker id="arrow-success-rev" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 1 1 L 9 5 L 1 9 Z" fill={SUCCESS_COLOR} />
            </marker>
          </defs>
          <Connector pts={PATH_FORWARD} progress={pathDraw} width={4} opacity={idlePathOpacity} markerId="arrow-fwd" />
          <Connector pts={PATH_REVERSE} progress={pathDraw} width={4} opacity={idlePathOpacity} markerId="arrow-rev" />
          <Connector
            pts={PATH_FORWARD}
            progress={synTrail}
            color={success ? SUCCESS_COLOR : SYN_COLOR}
            width={success ? 7 : onReverseBeat ? 4.5 : 8}
            opacity={success ? activePathOpacity : onReverseBeat ? dimInactive : activePathOpacity}
            markerId={success ? "arrow-success-fwd" : "arrow-syn"}
          />
          <Connector
            pts={PATH_REVERSE}
            progress={synackTrail}
            color={success ? SUCCESS_COLOR : SYNACK_COLOR}
            width={success ? 7 : onForwardBeat || onAckBeat ? 4.5 : 8}
            opacity={success ? activePathOpacity : onForwardBeat || onAckBeat ? dimInactive : activePathOpacity}
            markerId={success ? "arrow-success-rev" : "arrow-synack"}
          />
          {frame >= ackTravel ? (
            <Connector
              pts={PATH_FORWARD}
              progress={ackTrail}
              color={success ? SUCCESS_COLOR : ACK_COLOR}
              width={success ? 7 : 8}
              opacity={success ? activePathOpacity : onAckBeat ? activePathOpacity : dimInactive}
              markerId={success ? "arrow-success-fwd" : "arrow-ack"}
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

        {packets.map((packet, index) => (
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
              boxShadow: `0 0 0 5px ${packet.color}33, 0 0 26px ${packet.color}`,
            }}
          />
        ))}

        {readouts.map((item) => (
          <PathReadout key={item.flag} caption={item} />
        ))}
      </div>

      <Txt
        style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.04em",
          opacity: fadeIn * hudDim,
          transform: `translateY(${titleY}px)`,
        }}
      >
        TCP 3ウェイハンドシェイク
      </Txt>
      <Txt
        style={{
          position: "absolute",
          top: 118,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: success ? SUCCESS_COLOR : "#8ea0c2",
          opacity: fadeIn * hudDim,
        }}
      >
        SYN → SYN-ACK → ACK
      </Txt>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 148,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          opacity: fadeIn,
        }}
      >
        {steps.map((step, index) => {
          const done = success || stepIndex > index;
          const active = !success && stepIndex === index;
          const color = success ? SUCCESS_COLOR : active || done ? step.color : "#6d7f9e";
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
          bottom: 56,
          textAlign: "center",
          fontSize: 24,
          fontWeight: 500,
          color: success ? SUCCESS_COLOR : "#C5D3EE",
          opacity: fadeIn,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 14,
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
