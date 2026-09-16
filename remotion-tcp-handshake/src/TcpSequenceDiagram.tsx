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

const PATH_COLOR = "#9BB8DC";
const SYN_COLOR = "#7CE7FF";
const SYNACK_COLOR = "#FFB020";
const ACK_COLOR = "#9BE7FF";
const FIN_COLOR = "#D4B4FF";
const SUCCESS_COLOR = "#5EE9A0";
const CLIENT_ACCENT = "#59A6FF";
const SERVER_ACCENT = "#F0C14B";
const MUTED = "#6d7f9e";
const TEXT = "#EBF0FA";

const ease = Easing.inOut(Easing.cubic);

const LEFT_X = 540;
const RIGHT_X = 1260;
const BOX_W = 280;
const BOX_H = 86;
const BOX_Y = 96;
const LIFE_TOP = BOX_Y + BOX_H;
const LIFE_BOTTOM = 1032;

const BRACE_X = 1360;
const BRACE_LABEL_X = 1430;
const TIME_X = 108;

const MSG_YS = [270, 342, 414] as const;
const DATA_TOP = 458;
const DATA_BOTTOM = 622;
const TEAR_YS = [678, 750, 822, 894] as const;

const INTRO_END = 42;
const LIFE_DRAW = 36;
const DRAW = 26;
const HOLD = 22;
const STEP = DRAW + HOLD;

const lifeStart = INTRO_END;
const lifeEnd = lifeStart + LIFE_DRAW;

const CAM_IN = 40;
const CAM_TO_DATA = 34;
const CAM_TO_TEAR = 38;
const CAM_OUT = 42;
const GREEN_HOLD = 18;
const DIM_DUR = 16;
const DATA_HOLD = 32;
const FINAL_HOLD = 78;

const camEstStart = lifeEnd - 8;
const camEstEnd = camEstStart + CAM_IN;
const m1 = camEstEnd;
const m2 = m1 + STEP;
const m3 = m2 + STEP;
const establishAt = m3 + STEP;
const dimEstStart = establishAt + GREEN_HOLD;
const camDataStart = dimEstStart + 8;
const camDataEnd = camDataStart + CAM_TO_DATA;
const dataAt = camDataStart + 6;
const camTearStart = camDataEnd + DATA_HOLD;
const camTearEnd = camTearStart + CAM_TO_TEAR;
const m4 = camTearEnd;
const m5 = m4 + STEP;
const m6 = m5 + STEP;
const m7 = m6 + STEP;
const teardownAt = m7 + STEP;
const camOutStart = teardownAt + GREEN_HOLD;
const camOutEnd = camOutStart + CAM_OUT;
export const DURATION = camOutEnd + FINAL_HOLD;

type Pt = { x: number; y: number };
type CameraView = { scale: number; x: number; y: number };

const FOCUS_X = 1000;
const EST_Y = (MSG_YS[0] + MSG_YS[2]) / 2;
const DATA_Y = (DATA_TOP + DATA_BOTTOM) / 2;
const TEAR_Y = (TEAR_YS[0] + TEAR_YS[3]) / 2;
const CAM_TEAR_Y = TEAR_Y + 28;
const PEAK_EST = 1.52;
const PEAK_DATA = 1.18;
const PEAK_TEAR = 1.55;
const DIM = 0.34;
const IDENTITY_CAM: CameraView = { scale: 1, x: 0, y: 0 };

type Dir = "ltr" | "rtl";

type Message = {
  n: number;
  label: string;
  dir: Dir;
  y: number;
  start: number;
  color: string;
  group: "establish" | "teardown";
};

const MESSAGES: Message[] = [
  { n: 1, label: "SYN", dir: "ltr", y: MSG_YS[0], start: m1, color: SYN_COLOR, group: "establish" },
  { n: 2, label: "ACK,SYN", dir: "rtl", y: MSG_YS[1], start: m2, color: SYNACK_COLOR, group: "establish" },
  { n: 3, label: "ACK", dir: "ltr", y: MSG_YS[2], start: m3, color: ACK_COLOR, group: "establish" },
  { n: 4, label: "FIN", dir: "ltr", y: TEAR_YS[0], start: m4, color: FIN_COLOR, group: "teardown" },
  { n: 5, label: "ACK", dir: "rtl", y: TEAR_YS[1], start: m5, color: ACK_COLOR, group: "teardown" },
  { n: 6, label: "FIN", dir: "rtl", y: TEAR_YS[2], start: m6, color: FIN_COLOR, group: "teardown" },
  { n: 7, label: "ACK", dir: "ltr", y: TEAR_YS[3], start: m7, color: ACK_COLOR, group: "teardown" },
];

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

const fade = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const drawT = (frame: number, start: number) => {
  if (frame < start) {
    return 0;
  }
  return interpolate(frame, [start, start + DRAW], [0, 1], {
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

const FOCUS_EST = cameraFocus(1, { x: FOCUS_X, y: EST_Y }, PEAK_EST);
const FOCUS_DATA = cameraFocus(1, { x: FOCUS_X, y: DATA_Y }, PEAK_DATA);
const FOCUS_TEAR = cameraFocus(1, { x: FOCUS_X, y: CAM_TEAR_Y }, PEAK_TEAR);

const cameraAt = (frame: number): CameraView => {
  if (frame < camEstStart) {
    return IDENTITY_CAM;
  }
  if (frame < camEstEnd) {
    return lerpCam(IDENTITY_CAM, FOCUS_EST, linearT(frame, camEstStart, camEstEnd));
  }
  if (frame < camDataStart) {
    return FOCUS_EST;
  }
  if (frame < camDataEnd) {
    return lerpCam(FOCUS_EST, FOCUS_DATA, linearT(frame, camDataStart, camDataEnd));
  }
  if (frame < camTearStart) {
    return FOCUS_DATA;
  }
  if (frame < camTearEnd) {
    return lerpCam(FOCUS_DATA, FOCUS_TEAR, linearT(frame, camTearStart, camTearEnd));
  }
  if (frame < camOutStart) {
    return FOCUS_TEAR;
  }
  if (frame < camOutEnd) {
    return lerpCam(FOCUS_TEAR, IDENTITY_CAM, linearT(frame, camOutStart, camOutEnd));
  }
  return IDENTITY_CAM;
};

const Brace: FC<{
  x: number;
  y1: number;
  y2: number;
  color: string;
  opacity: number;
}> = ({ x, y1, y2, color, opacity }) => {
  const mid = (y1 + y2) / 2;
  const w = 20;
  const d = [
    `M ${x} ${y1}`,
    `C ${x + w * 0.55} ${y1}, ${x + w * 0.55} ${y1 + 18}, ${x + w * 0.55} ${y1 + 28}`,
    `L ${x + w * 0.55} ${mid - 16}`,
    `C ${x + w * 0.55} ${mid - 4}, ${x + w} ${mid}, ${x + w + 6} ${mid}`,
    `C ${x + w} ${mid}, ${x + w * 0.55} ${mid + 4}, ${x + w * 0.55} ${mid + 16}`,
    `L ${x + w * 0.55} ${y2 - 28}`,
    `C ${x + w * 0.55} ${y2 - 18}, ${x + w * 0.55} ${y2}, ${x} ${y2}`,
  ].join(" ");
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    />
  );
};

const NodeBox: FC<{
  x: number;
  label: string;
  file: string;
  accent: string;
  glow: string | undefined;
  opacity: number;
}> = ({ x, label, file, accent, glow, opacity }) => {
  const bar = glow ?? accent;
  return (
    <div
      style={{
        position: "absolute",
        left: x - BOX_W / 2,
        top: BOX_Y,
        width: BOX_W,
        height: BOX_H,
        borderRadius: 22,
        background: "linear-gradient(180deg, #1A2438 0%, #151C2C 100%)",
        border: glow ? `2px solid ${glow}` : "1.5px solid rgba(255,255,255,0.1)",
        boxShadow: glow
          ? `0 0 0 4px ${glow}33, 0 0 22px ${glow}66, 0 12px 28px rgba(0,0,0,0.28)`
          : "0 12px 28px rgba(0,0,0,0.28)",
        opacity,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", height: 5, background: bar, flexShrink: 0 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flex: 1,
          padding: "0 16px",
        }}
      >
        <Img src={staticFile(file)} style={{ width: 32, height: 32, flexShrink: 0 }} />
        <Txt
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Txt>
      </div>
    </div>
  );
};

const CircledNumber: FC<{
  n: number;
  color: string;
  opacity: number;
  x: number;
  y: number;
}> = ({ n, color, opacity, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 32,
      height: 32,
      marginLeft: -16,
      marginTop: -16,
      borderRadius: 16,
      border: `2px solid ${color}`,
      color,
      background: "rgba(18, 23, 38, 0.96)",
      boxShadow: `0 0 12px ${color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_FAMILY,
      fontSize: 18,
      fontWeight: 700,
      opacity,
      pointerEvents: "none",
    }}
  >
    {n}
  </div>
);

const GroupLabel: FC<{
  text: string;
  y: number;
  color: string;
  opacity: number;
  check: number;
}> = ({ text, y, color, opacity, check }) => (
  <div
    style={{
      position: "absolute",
      left: BRACE_LABEL_X,
      top: y,
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity,
      pointerEvents: "none",
    }}
  >
    <Txt
      style={{
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </Txt>
    {check > 0 ? (
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          background: "#16382C",
          border: `1.5px solid ${SUCCESS_COLOR}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: check,
        }}
      >
        <Img src={staticFile("icons/check.svg")} style={{ width: 14, height: 14 }} />
      </div>
    ) : null}
  </div>
);

export const TcpSequenceDiagram: FC = () => {
  const frame = useCurrentFrame();
  const intro = fade(frame, 0, 16);
  const lifeT = interpolate(frame, [lifeStart, lifeEnd], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const established = frame >= establishAt;
  const tornDown = frame >= teardownAt;
  const establishFade = fade(frame, establishAt, 14);
  const teardownFade = fade(frame, teardownAt, 14);
  const dataT = interpolate(frame, [dataAt, dataAt + 20], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dataLabel = fade(frame, dataAt + 8, 12);

  const lifeLen = LIFE_BOTTOM - LIFE_TOP;
  const lifeDrawn = lifeLen * lifeT;
  const connectorLen = RIGHT_X - LEFT_X - BOX_W;
  const connectorT = interpolate(frame, [18, 40], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const establishAppear = fade(frame, m1, 14);
  const teardownAppear = fade(frame, m4, 14);
  const establishDim = interpolate(frame, [dimEstStart, dimEstStart + DIM_DUR], [1, DIM], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dataDim = interpolate(frame, [m4 - 6, m4 + 12], [1, DIM], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const establishOpacity = establishAppear * establishDim;
  const dataOpacity = dataT * dataDim;
  const dataLabelOp = dataLabel * dataDim;
  const teardownOpacity = teardownAppear;
  const establishColor = established ? SUCCESS_COLOR : PATH_COLOR;
  const teardownColor = tornDown ? SUCCESS_COLOR : PATH_COLOR;
  const nodeGlow = tornDown ? SUCCESS_COLOR : established && frame < camTearStart ? SUCCESS_COLOR : undefined;
  const cam = cameraAt(frame);
  const titleOp =
    intro *
    interpolate(cam.scale, [1, 1.12, 1.35], [1, 0.42, 0.1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const bandDim = (group: "establish" | "teardown") =>
    group === "establish" ? establishDim : 1;

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

      <Txt
        style={{
          position: "absolute",
          top: 28,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.08em",
          opacity: titleOp,
          zIndex: 2,
        }}
      >
        TCP シーケンス図
      </Txt>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "0 0",
        }}
      >
      <div
        style={{
          position: "absolute",
          left: TIME_X,
          top: LIFE_TOP + 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: intro,
        }}
      >
        <Txt
          style={{
            writingMode: "vertical-rl",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.28em",
            color: MUTED,
            height: 168,
          }}
        >
          時間の流れ
        </Txt>
        <svg width="24" height={LIFE_BOTTOM - LIFE_TOP - 196} style={{ overflow: "visible" }}>
          <defs>
            <marker id="time-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={MUTED} />
            </marker>
          </defs>
          <line
            x1="12"
            y1="0"
            x2="12"
            y2={LIFE_BOTTOM - LIFE_TOP - 210}
            stroke={MUTED}
            strokeWidth="2.25"
            markerEnd="url(#time-arrow)"
          />
        </svg>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          {MESSAGES.map((msg) => (
            <marker
              key={`mk-${msg.n}`}
              id={`seq-arrow-${msg.n}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path
                d="M 1 1 L 9 5 L 1 9 Z"
                fill={
                  msg.group === "establish" && established
                    ? SUCCESS_COLOR
                    : msg.group === "teardown" && tornDown
                      ? SUCCESS_COLOR
                      : msg.color
                }
              />
            </marker>
          ))}
        </defs>

        <line
          x1={LEFT_X + BOX_W / 2}
          y1={BOX_Y + BOX_H * 0.58}
          x2={LEFT_X + BOX_W / 2 + connectorLen * connectorT}
          y2={BOX_Y + BOX_H * 0.58}
          stroke={PATH_COLOR}
          strokeWidth="2"
          opacity={0.45 * intro}
        />

        <line
          x1={LEFT_X}
          y1={LIFE_TOP}
          x2={LEFT_X}
          y2={LIFE_TOP + lifeDrawn}
          stroke={tornDown ? SUCCESS_COLOR : PATH_COLOR}
          strokeWidth="2.5"
          opacity={0.7}
        />
        <line
          x1={RIGHT_X}
          y1={LIFE_TOP}
          x2={RIGHT_X}
          y2={LIFE_TOP + lifeDrawn}
          stroke={tornDown ? SUCCESS_COLOR : PATH_COLOR}
          strokeWidth="2.5"
          opacity={0.7}
        />

        {frame >= dataAt ? (
          <rect
            x={LEFT_X + 18}
            y={DATA_TOP}
            width={RIGHT_X - LEFT_X - 36}
            height={DATA_BOTTOM - DATA_TOP}
            fill="rgba(155, 184, 220, 0.05)"
            stroke={MUTED}
            strokeWidth="2"
            strokeDasharray="10 8"
            rx="6"
            opacity={dataOpacity}
          />
        ) : null}

        {MESSAGES.map((msg) => {
          const t = drawT(frame, msg.start);
          if (t <= 0) {
            return null;
          }
          const groupedGreen =
            (msg.group === "establish" && established) || (msg.group === "teardown" && tornDown);
          const color = groupedGreen ? SUCCESS_COLOR : t >= 1 ? PATH_COLOR : msg.color;
          const x1 = msg.dir === "ltr" ? LEFT_X + 8 : RIGHT_X - 8;
          const x2 = msg.dir === "ltr" ? RIGHT_X - 8 : LEFT_X + 8;
          const len = Math.abs(x2 - x1);
          const dim = bandDim(msg.group);
          const baseOp = groupedGreen ? 0.95 : t >= 1 ? 0.82 : 1;
          return (
            <line
              key={`arr-${msg.n}`}
              x1={x1}
              y1={msg.y}
              x2={x2}
              y2={msg.y}
              stroke={color}
              strokeWidth={groupedGreen ? 3.5 : t >= 1 ? 2.75 : 3.5}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - t)}
              markerEnd={t > 0.9 ? `url(#seq-arrow-${msg.n})` : undefined}
              opacity={baseOp * dim}
            />
          );
        })}

        <Brace
          x={BRACE_X}
          y1={MSG_YS[0] - 18}
          y2={MSG_YS[2] + 18}
          color={establishColor}
          opacity={establishOpacity}
        />
        <Brace x={BRACE_X} y1={DATA_TOP} y2={DATA_BOTTOM} color={MUTED} opacity={dataOpacity} />
        <Brace
          x={BRACE_X}
          y1={TEAR_YS[0] - 18}
          y2={TEAR_YS[3] + 18}
          color={teardownColor}
          opacity={teardownOpacity}
        />
      </svg>

      <NodeBox
        x={LEFT_X}
        label="クライアント"
        file="icons/client.svg"
        accent={CLIENT_ACCENT}
        glow={nodeGlow}
        opacity={intro}
      />
      <NodeBox
        x={RIGHT_X}
        label="サーバー"
        file="icons/server.svg"
        accent={SERVER_ACCENT}
        glow={nodeGlow}
        opacity={intro}
      />

      {MESSAGES.map((msg) => {
        const t = drawT(frame, msg.start);
        const labelOp = fade(frame, msg.start, 10) * bandDim(msg.group);
        if (labelOp <= 0) {
          return null;
        }
        const groupedGreen =
          (msg.group === "establish" && established) || (msg.group === "teardown" && tornDown);
        const color = groupedGreen ? SUCCESS_COLOR : t >= 1 ? TEXT : msg.color;
        const numX = LEFT_X + 72;
        const labelX = LEFT_X + 96;
        return (
          <div key={`lab-${msg.n}`}>
            <CircledNumber n={msg.n} color={color} opacity={labelOp} x={numX} y={msg.y - 26} />
            <Txt
              style={{
                position: "absolute",
                left: labelX,
                top: msg.y - 42,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color,
                opacity: labelOp,
                whiteSpace: "nowrap",
                background: "rgba(18, 23, 38, 0.92)",
                padding: "0 8px",
              }}
            >
              {msg.label}
            </Txt>
          </div>
        );
      })}

      <GroupLabel
        text="コネクション確立"
        y={EST_Y}
        color={establishColor}
        opacity={establishOpacity}
        check={establishFade * establishDim}
      />
      <GroupLabel
        text="データのやり取り"
        y={DATA_Y}
        color={MUTED}
        opacity={dataLabelOp}
        check={0}
      />
      <GroupLabel
        text="コネクション切断"
        y={TEAR_Y}
        color={teardownColor}
        opacity={teardownOpacity}
        check={teardownFade}
      />
      </div>
    </AbsoluteFill>
  );
};

export const TCP_SEQUENCE_DIAGRAM = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
