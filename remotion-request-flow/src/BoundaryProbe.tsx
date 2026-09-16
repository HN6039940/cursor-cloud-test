import type { CSSProperties, FC, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const SVG_W = 1200;
const SVG_H = 400;
const FIT = WIDTH / SVG_W;
const OVERVIEW_H = SVG_H * FIT;
const OVERVIEW_TOP = (HEIGHT - OVERVIEW_H) / 2;

const NODES = [
  { label: "Client", x: 80, y: 157, w: 158, h: 86, color: "#59A6FF" },
  { label: "LB", x: 401.5, y: 157, w: 158, h: 86, color: "#4DD18C" },
  { label: "App", x: 723, y: 157, w: 158, h: 86, color: "#F0C14B" },
  { label: "DB", x: 962, y: 157, w: 158, h: 86, color: "#C084FC" },
] as const;

const CAPTIONS = [
  "クライアントがリクエストを送る",
  "ロードバランサが振り分ける",
  "アプリケーションが処理する",
  "データベースへ到達する",
] as const;

const SPEED = 1.2;
const dur = (frames: number) => Math.round(frames / SPEED);
const INTRO = dur(72);
const HOLD_AT = [dur(54), dur(42), dur(42), dur(90)] as const;
const TRAVEL = [dur(84), dur(84), dur(84)] as const;
const END_HOLD = dur(168);

const timeline = (() => {
  let t = INTRO;
  const holds: Array<{ node: number; start: number; end: number }> = [];
  const travels: Array<{ from: number; to: number; start: number; end: number }> = [];
  for (let i = 0; i < 3; i++) {
    holds.push({ node: i, start: t, end: t + HOLD_AT[i] });
    t += HOLD_AT[i];
    travels.push({ from: i, to: i + 1, start: t, end: t + TRAVEL[i] });
    t += TRAVEL[i];
  }
  holds.push({ node: 3, start: t, end: t + HOLD_AT[3] });
  t += HOLD_AT[3] + END_HOLD;
  return { holds, travels, durationInFrames: t };
})();

const toScreen = (x: number, y: number) => ({
  x: x * FIT,
  y: OVERVIEW_TOP + y * FIT,
});

const nodeCenter = (index: number) => {
  const node = NODES[index];
  return toScreen(node.x + node.w / 2, node.y + node.h / 2);
};

const easeInOut = Easing.inOut(Easing.cubic);

const packetState = (frame: number) => {
  for (const travel of timeline.travels) {
    if (frame >= travel.start && frame < travel.end) {
      const localT = interpolate(frame, [travel.start, travel.end], [0, 1], {
        easing: easeInOut,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const a = nodeCenter(travel.from);
      const b = nodeCenter(travel.to);
      return {
        x: interpolate(localT, [0, 1], [a.x, b.x]),
        y: interpolate(localT, [0, 1], [a.y, b.y]),
        active: localT < 0.45 ? travel.from : travel.to,
        visible: true,
      };
    }
  }
  const hold =
    timeline.holds.find((item) => frame >= item.start && frame < item.end) ??
    timeline.holds[timeline.holds.length - 1];
  const center = nodeCenter(hold.node);
  return {
    x: center.x,
    y: center.y,
    active: hold.node,
    visible: frame >= INTRO,
  };
};

export const BoundaryProbe: FC = () => {
  const frame = useCurrentFrame();
  const packet = packetState(frame);

  const overviewOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const packetOpacity = interpolate(frame, [INTRO - 6, INTRO + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const caption =
    frame < INTRO ? "Client → LB → App → DB" : CAPTIONS[packet.active];

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY }}>
      <Img
        src={staticFile("parts-only-flow.svg")}
        style={{
          position: "absolute",
          left: 0,
          top: OVERVIEW_TOP,
          width: WIDTH,
          height: OVERVIEW_H,
          opacity: overviewOpacity,
        }}
      />

      {NODES.map((node, index) => {
        const origin = toScreen(node.x, node.y);
        const isActive = packet.visible && packet.active === index;
        const labelOpacity = interpolate(
          frame,
          [8 + index * 6, 20 + index * 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const box: CSSProperties = {
          position: "absolute",
          left: origin.x,
          top: origin.y,
          width: node.w * FIT,
          height: node.h * FIT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 24,
          border: isActive ? `3px solid ${node.color}` : "3px solid transparent",
          boxShadow: isActive
            ? `0 0 0 6px ${node.color}33, 0 0 34px ${node.color}99`
            : "none",
        };
        return (
          <div key={node.label} style={box}>
            <Txt
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 42,
                fontWeight: 700,
                color: "#EBF0FA",
                opacity: labelOpacity,
                letterSpacing: "0.04em",
              }}
            >
              {node.label}
            </Txt>
          </div>
        );
      })}

      {packet.visible ? (
        <div
          style={{
            position: "absolute",
            left: packet.x,
            top: packet.y,
            width: 22,
            height: 22,
            marginLeft: -11,
            marginTop: -11,
            borderRadius: "50%",
            background: "#7CE7FF",
            boxShadow: "0 0 0 4px rgba(124,231,255,0.2), 0 0 28px rgba(124,231,255,0.9)",
            opacity: packetOpacity,
          }}
        />
      ) : null}

      <Txt
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#F4F7FF",
          opacity: titleOpacity,
        }}
      >
        リクエストがサーバに届く流れ
      </Txt>

      <Txt
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 88,
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

export const BOUNDARY_PROBE = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: timeline.durationInFrames,
} as const;
