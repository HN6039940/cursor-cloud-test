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
const ESTABLISH_HOLD = 30;
const DATA_DUR = 42;
const FINAL_HOLD = 96;

const lifeStart = INTRO_END;
const lifeEnd = lifeStart + LIFE_DRAW;
const m1 = lifeEnd;
const m2 = m1 + STEP;
const m3 = m2 + STEP;
const establishAt = m3 + STEP;
const dataAt = establishAt + ESTABLISH_HOLD;
const m4 = dataAt + DATA_DUR;
const m5 = m4 + STEP;
const m6 = m5 + STEP;
const m7 = m6 + STEP;
const teardownAt = m7 + STEP;
export const DURATION = teardownAt + FINAL_HOLD;

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

  const establishOpacity = fade(frame, m1, 14);
  const teardownOpacity = fade(frame, m4, 14);
  const establishColor = established ? SUCCESS_COLOR : PATH_COLOR;
  const teardownColor = tornDown ? SUCCESS_COLOR : PATH_COLOR;
  const nodeGlow = tornDown || established ? SUCCESS_COLOR : undefined;

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
          opacity: intro,
        }}
      >
        TCP シーケンス図
      </Txt>

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
            opacity={dataT}
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
              opacity={groupedGreen ? 0.95 : t >= 1 ? 0.82 : 1}
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
        <Brace x={BRACE_X} y1={DATA_TOP} y2={DATA_BOTTOM} color={MUTED} opacity={dataT} />
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
        const labelOp = fade(frame, msg.start, 10);
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
        y={(MSG_YS[0] + MSG_YS[2]) / 2}
        color={establishColor}
        opacity={establishOpacity}
        check={establishFade}
      />
      <GroupLabel
        text="データのやり取り"
        y={(DATA_TOP + DATA_BOTTOM) / 2}
        color={MUTED}
        opacity={dataLabel}
        check={0}
      />
      <GroupLabel
        text="コネクション切断"
        y={(TEAR_YS[0] + TEAR_YS[3]) / 2}
        color={teardownColor}
        opacity={teardownOpacity}
        check={teardownFade}
      />
    </AbsoluteFill>
  );
};

export const TCP_SEQUENCE_DIAGRAM = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
