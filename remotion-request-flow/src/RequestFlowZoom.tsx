import type { FC } from "react";
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

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const SVG_W = 1200;
const SVG_H = 400;
const FIT = WIDTH / SVG_W;
const OVERVIEW_H = SVG_H * FIT;
const OVERVIEW_TOP = (HEIGHT - OVERVIEW_H) / 2;

const LB = { x: 401.5, y: 157, w: 158, h: 86 };
const LB_CENTER = {
  x: (LB.x + LB.w / 2) * FIT,
  y: OVERVIEW_TOP + (LB.y + LB.h / 2) * FIT,
};
const SCREEN_CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };

const SPEED = 1.2;
const dur = (frames: number) => Math.round(frames / SPEED);

const INTRO = dur(90);
const ZOOM_IN = { start: INTRO, end: INTRO + dur(150) };
const HOLD_ZOOM = { start: ZOOM_IN.end, end: ZOOM_IN.end + dur(60) };
const CROSS_IN = { start: HOLD_ZOOM.end, end: HOLD_ZOOM.end + dur(75) };
const HOLD_DETAIL = { start: CROSS_IN.end, end: CROSS_IN.end + dur(165) };
const CROSS_OUT = { start: HOLD_DETAIL.end, end: HOLD_DETAIL.end + dur(60) };
const ZOOM_OUT = { start: CROSS_OUT.end, end: CROSS_OUT.end + dur(120) };
const PEAK_SCALE = 4.15;

const easeInOut = Easing.inOut(Easing.cubic);

const cameraAt = (zoomT: number) => {
  const scale = interpolate(zoomT, [0, 1], [1, PEAK_SCALE]);
  const lbScreenX = interpolate(zoomT, [0, 1], [LB_CENTER.x, SCREEN_CENTER.x]);
  const lbScreenY = interpolate(zoomT, [0, 1], [LB_CENTER.y, SCREEN_CENTER.y]);
  return {
    scale,
    x: lbScreenX - LB_CENTER.x * scale,
    y: lbScreenY - LB_CENTER.y * scale,
  };
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
  const zoomT = frame >= ZOOM_OUT.start ? zoomOutT : zoomInT;
  const camera = cameraAt(zoomT);

  const overviewEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(
    frame,
    [0, 16, ZOOM_IN.start - 12, ZOOM_IN.start + 18],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const ringOpacity = interpolate(
    frame,
    [ZOOM_IN.start + 20, HOLD_ZOOM.start, HOLD_ZOOM.end, CROSS_IN.end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const detailOpacity = interpolate(
    frame,
    [CROSS_IN.start, CROSS_IN.end, HOLD_DETAIL.end, CROSS_OUT.end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  let caption = "全体像 — Client → LB → App → DB";
  if (frame >= ZOOM_OUT.start) {
    caption = "全体像へ戻る";
  } else if (frame >= CROSS_IN.start) {
    caption = "LB の中身 — Health Check → Router → Target Pool";
  } else if (frame >= ZOOM_IN.start) {
    caption = "LB へズーム";
  }

  const captionOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY }}>
      <AbsoluteFill
        style={{
          opacity: overviewEnter,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <Img
          src={staticFile("overview-request-flow.svg")}
          style={{
            position: "absolute",
            left: 0,
            top: OVERVIEW_TOP,
            width: WIDTH,
            height: OVERVIEW_H,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: LB.x * FIT - 10,
            top: OVERVIEW_TOP + LB.y * FIT - 10,
            width: LB.w * FIT + 20,
            height: LB.h * FIT + 20,
            borderRadius: 22,
            border: "3px solid #59A6FF",
            boxShadow: "0 0 0 6px rgba(89,166,255,0.16), 0 0 36px rgba(89,166,255,0.45)",
            opacity: ringOpacity,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          opacity: detailOpacity,
          background: "#121726",
        }}
      >
        <Img
          src={staticFile("lb-detail.svg")}
          style={{ width: WIDTH, height: HEIGHT }}
        />
      </AbsoluteFill>

      <h1
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          margin: 0,
          textAlign: "center",
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#f4f7ff",
          opacity: titleOpacity,
        }}
      >
        リクエストがサーバに届く流れ
      </h1>

      <p
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 64,
          margin: 0,
          textAlign: "center",
          fontSize: 26,
          fontWeight: 500,
          color: "#c5d3ee",
          opacity: captionOpacity,
        }}
      >
        {caption}
      </p>
    </AbsoluteFill>
  );
};

export const REQUEST_FLOW_ZOOM = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: ZOOM_OUT.end,
} as const;
