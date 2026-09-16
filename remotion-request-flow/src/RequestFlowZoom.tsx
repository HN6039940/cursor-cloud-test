import type { FC } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  A_COLOR,
  CARD_H,
  CARD_W,
  CENTER,
  FPS,
  FONT_FAMILY,
  HEIGHT,
  IconPathStage,
  NODE,
  SUCCESS_COLOR,
  Txt,
  WIDTH,
  cameraFocus,
  ease,
  packetAlong,
  polylineLength,
  type NodeFx,
  type NodeId,
  type Pt,
} from "./iconPathShared";

const SPEED = 1.2;
const dur = (frames: number) => Math.round(frames / SPEED);

const INTRO = dur(200);
const ZOOM_IN = { start: INTRO, end: INTRO + dur(150) };
const HOLD_ZOOM = { start: ZOOM_IN.end, end: ZOOM_IN.end + dur(48) };
const CROSS_IN = { start: HOLD_ZOOM.end, end: HOLD_ZOOM.end + dur(60) };
const HOLD_DETAIL = { start: CROSS_IN.end, end: CROSS_IN.end + dur(180) };
const CROSS_OUT = { start: HOLD_DETAIL.end, end: HOLD_DETAIL.end + dur(48) };
const ZOOM_OUT = { start: CROSS_OUT.end, end: CROSS_OUT.end + dur(110) };
const PEAK_SCALE = 3.6;
const PACKET = A_COLOR;

const INNER_W = 220;
const INNER_H = 228;
const INNER_GAP = 72;
const INNER_TOP = 430;
const INNER_ROW_W = INNER_W * 3 + INNER_GAP * 2;
const INNER_LEFT = (WIDTH - INNER_ROW_W) / 2;
const FRAME = { x: 220, y: 250, w: 1480, h: 560 };

const INNER_NODES = [
  {
    id: "health",
    label: "Health Check",
    hint: "fail → remove",
    file: "icons/health.svg",
    accent: "#59A6FF",
    x: INNER_LEFT,
  },
  {
    id: "router",
    label: "Router",
    hint: "round-robin",
    file: "icons/router.svg",
    accent: "#4DD18C",
    x: INNER_LEFT + INNER_W + INNER_GAP,
  },
  {
    id: "pool",
    label: "Target Pool",
    hint: "App A / B / C",
    file: "icons/pool.svg",
    accent: "#F0C14B",
    x: INNER_LEFT + (INNER_W + INNER_GAP) * 2,
  },
] as const;

const innerRight = (index: number): Pt => ({
  x: INNER_NODES[index].x + INNER_W,
  y: INNER_TOP + INNER_H / 2,
});
const innerLeft = (index: number): Pt => ({
  x: INNER_NODES[index].x,
  y: INNER_TOP + INNER_H / 2,
});

const INNER_PATH: Pt[] = [innerRight(0), innerLeft(1), innerRight(1), innerLeft(2)];
const INNER_PATH_LEN = polylineLength(INNER_PATH);
const INNER_PACKET_PATH: Pt[] = [
  { x: INNER_NODES[0].x + INNER_W / 2, y: INNER_TOP + INNER_H / 2 },
  innerRight(0),
  innerLeft(1),
  { x: INNER_NODES[1].x + INNER_W / 2, y: INNER_TOP + INNER_H / 2 },
  innerRight(1),
  innerLeft(2),
  { x: INNER_NODES[2].x + INNER_W / 2, y: INNER_TOP + INNER_H / 2 },
];

const INNER_PACKET_START = CROSS_IN.end + dur(12);
const INNER_PACKET_DUR = dur(150);

const easeInOut = Easing.inOut(Easing.cubic);

const toD = (pts: Pt[]) => pts.map((pt, index) => `${index === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");

const LbInterior: FC<{ opacity: number; frame: number }> = ({ opacity, frame }) => {
  const packet = packetAlong(frame, INNER_PACKET_START, INNER_PACKET_DUR, INNER_PACKET_PATH, PACKET);
  const trail = interpolate(frame, [INNER_PACKET_START, INNER_PACKET_START + INNER_PACKET_DUR], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeIndex =
    packet == null
      ? -1
      : packet.pos.x < INNER_NODES[1].x - 8
        ? 0
        : packet.pos.x < INNER_NODES[2].x - 8
          ? 1
          : 2;

  return (
    <AbsoluteFill style={{ opacity, fontFamily: FONT_FAMILY, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: FRAME.x,
          top: FRAME.y,
          width: FRAME.w,
          height: FRAME.h,
          borderRadius: 28,
          border: "2px solid #59A6FF",
          background: "linear-gradient(180deg, #182236 0%, #121A2B 100%)",
          boxShadow: "0 0 0 8px rgba(89,166,255,0.12), 0 24px 60px rgba(0,0,0,0.35)",
        }}
      />
      <Txt
        style={{
          position: "absolute",
          top: FRAME.y + 28,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 28,
          fontWeight: 700,
          color: "#59A6FF",
          letterSpacing: "0.16em",
        }}
      >
        LB の中身
      </Txt>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <path
          d={toD(INNER_PATH)}
          fill="none"
          stroke="#9BB8DC"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        <path
          d={toD(INNER_PATH)}
          fill="none"
          stroke={SUCCESS_COLOR}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={INNER_PATH_LEN}
          strokeDashoffset={INNER_PATH_LEN * (1 - trail)}
          opacity={0.85}
        />
      </svg>

      {INNER_NODES.map((node, index) => {
        const glow = activeIndex === index || (packet == null && frame >= INNER_PACKET_START + INNER_PACKET_DUR && index === 2);
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: INNER_TOP,
              width: INNER_W,
              height: INNER_H,
              borderRadius: 20,
              background: "linear-gradient(180deg, #1A2438 0%, #151C2C 100%)",
              border: glow ? `2px solid ${PACKET}` : "1.5px solid rgba(255,255,255,0.08)",
              boxShadow: glow
                ? `0 0 0 5px ${PACKET}33, 0 0 28px ${PACKET}88`
                : "0 16px 36px rgba(0,0,0,0.28)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", height: 6, background: node.accent }} />
            <Img src={staticFile(node.file)} style={{ width: 64, height: 64, marginTop: 28 }} />
            <Txt
              style={{
                marginTop: 14,
                fontFamily: FONT_FAMILY,
                fontSize: 22,
                fontWeight: 700,
                color: "#EBF0FA",
                letterSpacing: "0.03em",
              }}
            >
              {node.label}
            </Txt>
            <Txt
              style={{
                marginTop: 6,
                fontFamily: FONT_FAMILY,
                fontSize: 16,
                fontWeight: 500,
                color: "#8EA0C2",
              }}
            >
              {node.hint}
            </Txt>
          </div>
        );
      })}

      {packet ? (
        <div
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
      ) : null}
    </AbsoluteFill>
  );
};

export const RequestFlowZoom: FC = () => {
  const frame = useCurrentFrame();

  const zoomInT = interpolate(frame, [ZOOM_IN.start, ZOOM_IN.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const zoomOutT = interpolate(frame, [ZOOM_OUT.start, ZOOM_OUT.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const zoomT = frame >= ZOOM_OUT.start ? zoomOutT : frame >= ZOOM_IN.start ? zoomInT : 0;
  const camera = cameraFocus(zoomT, CENTER.lb, PEAK_SCALE);

  const titleOpacity = interpolate(
    frame,
    [0, 16, ZOOM_IN.start - 12, ZOOM_IN.start + 18, ZOOM_OUT.start + 20, ZOOM_OUT.end],
    [0, 1, 1, 0, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const ringOpacity = interpolate(
    frame,
    [ZOOM_IN.start + 12, HOLD_ZOOM.start, HOLD_ZOOM.end, CROSS_IN.end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const detailOpacity = interpolate(
    frame,
    [CROSS_IN.start, CROSS_IN.end, HOLD_DETAIL.end, CROSS_OUT.end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const overviewOpacity = interpolate(frame, [CROSS_IN.start, CROSS_IN.end, CROSS_OUT.start, CROSS_OUT.end], [1, 0, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodeFx: Partial<Record<NodeId, NodeFx>> = {};
  if (frame >= ZOOM_IN.start && frame < CROSS_IN.end) {
    nodeFx.lb = { glow: "#59A6FF" };
  }

  let caption = "全体像 — Client → LB → App → Cache → DB";
  if (frame >= ZOOM_OUT.start) {
    caption = "全体像へ戻る";
  } else if (frame >= CROSS_IN.start) {
    caption = "LB の中身 — Health Check → Router → Target Pool";
  } else if (frame >= ZOOM_IN.start) {
    caption = "LB へ直線ズーム";
  }

  return (
    <AbsoluteFill style={{ background: "#121726" }}>
      <IconPathStage
        title="リクエストの流れ"
        caption={caption}
        packets={[]}
        nodeFx={nodeFx}
        camera={camera}
        stageOpacity={overviewOpacity}
        titleOpacity={titleOpacity}
        captionOpacity={interpolate(frame, [8, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        cameraChildren={
          <div
            style={{
              position: "absolute",
              left: NODE.lb.x - 10,
              top: NODE.lb.y - 10,
              width: CARD_W + 20,
              height: CARD_H + 20,
              borderRadius: 26,
              border: "3px solid #59A6FF",
              boxShadow: "0 0 0 6px rgba(89,166,255,0.16), 0 0 36px rgba(89,166,255,0.45)",
              opacity: ringOpacity,
              pointerEvents: "none",
            }}
          />
        }
      />
      <LbInterior opacity={detailOpacity} frame={frame} />
    </AbsoluteFill>
  );
};

export const RequestFlowZoomDetail = RequestFlowZoom;

export const REQUEST_FLOW_ZOOM = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: ZOOM_OUT.end,
} as const;

export const REQUEST_FLOW_ZOOM_DETAIL = REQUEST_FLOW_ZOOM;
