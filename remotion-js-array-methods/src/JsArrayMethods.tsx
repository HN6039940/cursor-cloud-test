import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Emoji, MorphEmoji, type EmojiName } from "./emoji";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const INTRO_FRAMES = 90;
export const SCENE_FRAMES = 480;
export const OUTRO_FRAMES = 120;
export const METHOD_COUNT = 8;
export const CAM_MOVE = 48;

export const JS_ARRAY_METHODS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES + OUTRO_FRAMES,
};

const BG = "#F3F3F3";
const INK = "#111111";
const MUTED = "#5C5C5C";
const OK = "#1B7F3A";
const NG = "#C62828";
const UI_FONT = 'Inter, "Noto Sans", "Liberation Sans", system-ui, sans-serif';
const JP_FONT =
  '"WenQuanYi Micro Hei", "Noto Sans", Inter, "Liberation Sans", sans-serif';
const EMOJI = 88;
const METHOD_EMOJI = 72;
const ROW_MIN_H = 168;
const ROW_GAP = 64;
const ROW_PITCH = ROW_MIN_H + ROW_GAP;
const FOCUS_SCALE = 1.34;
const OVERVIEW_SCALE = 0.5;
const CAPTION_LIFT = 70;

type Phase = "pending" | "active" | "done";
type Cam = { scale: number; y: number };

const lin = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
): number => {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
};

const stagger = (
  frame: number,
  start: number,
  end: number,
  index: number,
  count: number,
): number => {
  const span = (end - start) / count;
  return lin(frame, [start + index * span, start + (index + 1) * span], [0, 1]);
};

const phaseOp = (phase: Phase, activeOp: number): number => {
  if (phase === "done") {
    return 1;
  }
  if (phase === "pending") {
    return 0;
  }
  return activeOp;
};

const mixCam = (a: Cam, b: Cam, t: number): Cam => {
  return {
    scale: a.scale + (b.scale - a.scale) * t,
    y: a.y + (b.y - a.y) * t,
  };
};

const cameraForRow = (index: number): Cam => {
  return {
    scale: FOCUS_SCALE,
    y: -(index - (METHOD_COUNT - 1) / 2) * ROW_PITCH + CAPTION_LIFT,
  };
};

const OVERVIEW_CAM: Cam = { scale: OVERVIEW_SCALE, y: 0 };

const Code: FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily: UI_FONT,
        fontSize: 44,
        fontWeight: 500,
        color: INK,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
        letterSpacing: -0.4,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const Arrow: FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <Code style={{ opacity, fontSize: 48, padding: "0 4px" }}>{"=>"}</Code>
  );
};

const Cluster: FC<{
  items: EmojiName[];
  size?: number;
  itemStyle?: (index: number) => CSSProperties;
  label?: (index: number) => ReactNode;
}> = ({ items, size = EMOJI, itemStyle, label }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
      {items.map((name, i) => (
        <div
          key={`${name}-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: size,
            ...itemStyle?.(i),
          }}
        >
          <Emoji name={name} size={size} />
          <div
            style={{
              height: 22,
              fontFamily: JP_FONT,
              fontSize: 16,
              fontWeight: 700,
              color: MUTED,
              lineHeight: "22px",
            }}
          >
            {label?.(i) ?? null}
          </div>
        </div>
      ))}
    </div>
  );
};

const Cells: FC<{ children: ReactNode }> = ({ children }) => {
  return <div style={{ display: "contents" }}>{children}</div>;
};

const Caption: FC<{
  kicker: string;
  lines: readonly { from: number; to: number; text: string }[];
  frame: number;
}> = ({ kicker, lines, frame }) => {
  let text = "";
  let op = 0;
  for (const line of lines) {
    const lineOp = lin(frame, [line.from, line.from + 10, line.to - 10, line.to], [
      0,
      1,
      1,
      0,
    ]);
    if (lineOp >= op) {
      op = lineOp;
      text = line.text;
    }
  }
  const kickerOp = lin(frame, [8, 24], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 56,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: UI_FONT,
          fontSize: 28,
          fontWeight: 600,
          color: MUTED,
          opacity: kickerOp,
          letterSpacing: 0.4,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: JP_FONT,
          fontSize: 40,
          fontWeight: 700,
          color: INK,
          opacity: op,
          textAlign: "center",
          lineHeight: 1.35,
          minHeight: 54,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const MapRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [96, 120], [0, 1]));
  const arrowOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const inputOp = phase === "pending" ? 0.3 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={["dog", "dog", "dog", "dog"]}
          label={(i) => {
            const pulse =
              phase === "active" ? stagger(frame, 80, 300, i, 4) : 0;
            if (phase !== "active" || pulse < 0.15) {
              return null;
            }
            return <span style={{ color: INK }}>変換</span>;
          }}
          itemStyle={(i) => {
            const pulse =
              phase === "active" ? stagger(frame, 80, 300, i, 4) : 0;
            const bump = pulse > 0 && pulse < 1 ? 0.12 : 0;
            return { transform: `scale(${1 + bump})` };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".map("}
        <Emoji name="dog" size={METHOD_EMOJI} />
        {" => "}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {")"}
      </Code>
      <Arrow opacity={arrowOp} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: resultOp,
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const p =
            phase === "done"
              ? 1
              : phase === "pending"
                ? 0
                : stagger(frame, 80, 300, i, 4);
          return (
            <MorphEmoji key={i} from="dog" to="puppy" progress={p} size={EMOJI} />
          );
        })}
      </div>
    </Cells>
  );
};

const FilterRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  const inputOp = phase === "pending" ? 0.3 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          label={(i) => {
            if (phase !== "active") {
              return null;
            }
            const drop = stagger(frame, 90, 280, i, 4);
            if (drop < 0.2) {
              return null;
            }
            const keep = items[i] === "puppy";
            return (
              <span style={{ color: keep ? OK : NG }}>
                {keep ? "残す" : "外す"}
              </span>
            );
          }}
          itemStyle={(i) => {
            const keep = items[i] === "puppy";
            const drop = phase === "active" ? stagger(frame, 90, 280, i, 4) : 0;
            return {
              opacity: keep ? 1 : 1 - 0.72 * drop,
              transform: `scale(${keep ? 1 + 0.08 * drop : 1 - 0.08 * drop})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".filter("}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ opacity: resultOp }}>
        <Emoji name="puppy" size={EMOJI} />
      </div>
    </Cells>
  );
};

const EveryRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [88, 280], [0, 2.999]) : 0;
  const cursor = Math.min(2, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.3 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          label={(i) => {
            if (phase !== "active" || scan <= i) {
              return null;
            }
            const ok = items[i] === "dog";
            return (
              <span style={{ color: ok ? OK : NG }}>{ok ? "犬" : "違う"}</span>
            );
          }}
          itemStyle={(i) => {
            const visited = phase === "active" && scan > i;
            const ok = items[i] === "dog";
            const on = phase === "active" && i === cursor && frame >= 88;
            return {
              opacity: visited && !ok ? 0.4 : 1,
              transform: `scale(${on ? 1.14 : 1})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".every("}
        <Emoji name="dog" size={METHOD_EMOJI} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, fontSize: 56, color: NG }}>false</Code>
    </Cells>
  );
};

const SomeRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [88, 240], [0, 1.999]) : 0;
  const cursor = Math.min(1, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.3 : 1;
  const found = phase === "active" && frame >= 240;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          label={(i) => {
            if (phase !== "active" || scan <= i) {
              return null;
            }
            const ok = items[i] === "puppy";
            return (
              <span style={{ color: ok ? OK : MUTED }}>
                {ok ? "あり" : "まだ"}
              </span>
            );
          }}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 88;
            const match = items[i] === "puppy";
            return {
              opacity: found && i > 1 ? 0.38 : 1,
              transform: `scale(${on || (found && i === 1 && match) ? 1.14 : 1})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".some("}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, fontSize: 56, color: OK }}>true</Code>
    </Cells>
  );
};

const FillRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [96, 120], [0, 1]));
  const arrowOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const inputOp = phase === "pending" ? 0.3 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={["dog", "dog", "dog", "dog"]}
          label={(i) => {
            if (phase !== "active") {
              return null;
            }
            return (
              <span style={{ color: i === 0 ? MUTED : INK }}>
                {i === 0 ? "そのまま" : String(i)}
              </span>
            );
          }}
          itemStyle={(i) => {
            const fillAt =
              phase === "active" && i >= 1
                ? stagger(frame, 90, 280, i - 1, 3)
                : 0;
            return { transform: `scale(${1 + 0.1 * fillAt})` };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".fill("}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {", 1)"}
      </Code>
      <Arrow opacity={arrowOp} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: resultOp,
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const fillAt =
            i === 0
              ? 0
              : phase === "done"
                ? 1
                : phase === "pending"
                  ? 0
                  : stagger(frame, 90, 280, i - 1, 3);
          return (
            <MorphEmoji key={i} from="dog" to="puppy" progress={fillAt} size={EMOJI} />
          );
        })}
      </div>
    </Cells>
  );
};

const FindIndexRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [88, 280], [0, 2.999]) : 0;
  const cursor = Math.min(2, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.3 : 1;
  const found = phase === "active" && frame >= 280;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          label={(i) => {
            if (phase !== "active") {
              return null;
            }
            const on = i === cursor && frame >= 88;
            return (
              <span style={{ color: found && i === 2 ? OK : on ? INK : MUTED }}>
                {i}
              </span>
            );
          }}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 88;
            const dimTail = found && i > 2;
            return {
              opacity: dimTail ? 0.38 : 1,
              transform: `scale(${on || (found && i === 2) ? 1.14 : 1})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp, fontSize: 36 }}>
        {".findIndex(el => el === "}
        <Emoji name="puppy" size={56} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, fontSize: 64 }}>2</Code>
    </Cells>
  );
};

const FindRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  const scan = phase === "active" ? lin(frame, [88, 250], [0, 1.999]) : 0;
  const cursor = Math.min(1, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.3 : 1;
  const after = phase === "active" && frame >= 250;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          label={(i) => {
            if (phase !== "active" || scan <= i) {
              return null;
            }
            const match = i === 1;
            return (
              <span style={{ color: match ? OK : MUTED }}>
                {match ? "これ" : "違う"}
              </span>
            );
          }}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 88;
            const match = i === 1;
            return {
              opacity: after ? (match ? 1 : 0.32) : 1,
              transform: `scale(${on || (after && match) ? 1.14 : 1})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".find("}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ opacity: resultOp }}>
        <Emoji name="puppy" size={EMOJI} />
      </div>
    </Cells>
  );
};

const ReduceRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [36, 64], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [300, 330], [0, 1]));
  const gather = phase === "active" ? lin(frame, [90, 280], [0, 1]) : 0;
  const ingredients: EmojiName[] = ["cucumber", "tomato", "pancakes", "cheese"];
  const names = ["キュウリ", "トマト", "パンケーキ", "チーズ"];
  const step = phase === "active" ? lin(frame, [90, 260], [0, 3.999]) : 0;
  const inputOp = phase === "pending" ? 0.3 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={ingredients}
          label={(i) => {
            if (phase !== "active" || step < i) {
              return null;
            }
            return <span style={{ color: INK }}>{names[i]}</span>;
          }}
          itemStyle={(i) => {
            const dir = i < 2 ? 1 : -1;
            const dist = i === 0 || i === 3 ? 22 : 10;
            const active = step > i;
            return {
              opacity: active || phase !== "active" ? 1 : 0.45,
              transform: `translateX(${dir * dist * gather}px) scale(${1 - 0.06 * gather})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp, fontSize: 34 }}>
        {".reduce((acc, cur) => acc + cur)"}
      </Code>
      <Arrow opacity={resultOp} />
      <div
        style={{
          opacity: resultOp,
          transform: `scale(${phase === "done" ? 1 : 0.72 + 0.28 * resultOp})`,
        }}
      >
        <Emoji name="burger" size={EMOJI} />
      </div>
    </Cells>
  );
};

const ROWS = [
  MapRow,
  FilterRow,
  EveryRow,
  SomeRow,
  FillRow,
  FindIndexRow,
  FindRow,
  ReduceRow,
] as const;

const METHOD_META = [
  {
    kicker: ".map",
    lines: [
      { from: 24, to: 170, text: "すべての要素を、同じルールで変換する" },
      { from: 175, to: 310, text: "犬を1匹ずつ、子犬に変えていく" },
      { from: 318, to: 470, text: "結果は子犬が4匹" },
    ],
  },
  {
    kicker: ".filter",
    lines: [
      { from: 24, to: 170, text: "条件に合う要素だけ残す" },
      { from: 175, to: 310, text: "子犬だけ残して、ほかは外す" },
      { from: 318, to: 470, text: "残ったのは子犬1匹" },
    ],
  },
  {
    kicker: ".every",
    lines: [
      { from: 24, to: 170, text: "全部が条件を満たすか、左から確かめる" },
      { from: 175, to: 310, text: "子犬が混ざっていないか見ていく" },
      { from: 318, to: 470, text: "子犬がいるので false" },
    ],
  },
  {
    kicker: ".some",
    lines: [
      { from: 24, to: 170, text: "ひとつでも条件を満たせば true" },
      { from: 175, to: 310, text: "子犬がいるか、左から探す" },
      { from: 318, to: 470, text: "見つかったので true" },
    ],
  },
  {
    kicker: ".fill",
    lines: [
      { from: 24, to: 170, text: "指定した位置から、同じ値で埋める" },
      { from: 175, to: 310, text: "index 1 から先を子犬にする" },
      { from: 318, to: 470, text: "先頭の犬はそのまま残る" },
    ],
  },
  {
    kicker: ".findIndex",
    lines: [
      { from: 24, to: 170, text: "最初に一致した要素の位置を返す" },
      { from: 175, to: 310, text: "子犬は何番目？ 0、1、2…" },
      { from: 318, to: 470, text: "2番目で一致したので 2" },
    ],
  },
  {
    kicker: ".find",
    lines: [
      { from: 24, to: 170, text: "最初に一致した要素そのものを返す" },
      { from: 175, to: 310, text: "子犬を見つけたら、それを返す" },
      { from: 318, to: 470, text: "結果は子犬" },
    ],
  },
  {
    kicker: ".reduce",
    lines: [
      { from: 24, to: 170, text: "要素を順に足して、ひとつにまとめる" },
      { from: 175, to: 310, text: "材料を重ねていくと…" },
      { from: 318, to: 470, text: "ハンバーガーになる" },
    ],
  },
] as const;

const getCamera = (frame: number): Cam => {
  const bodyStart = INTRO_FRAMES;
  const bodyEnd = INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES;
  if (frame < bodyStart) {
    return OVERVIEW_CAM;
  }
  if (frame >= bodyEnd) {
    const t = lin(frame, [bodyEnd, bodyEnd + CAM_MOVE], [0, 1]);
    return mixCam(cameraForRow(METHOD_COUNT - 1), OVERVIEW_CAM, t);
  }
  const body = frame - bodyStart;
  const index = Math.min(METHOD_COUNT - 1, Math.floor(body / SCENE_FRAMES));
  const local = body - index * SCENE_FRAMES;
  const from = index === 0 ? OVERVIEW_CAM : cameraForRow(index - 1);
  const to = cameraForRow(index);
  const t = lin(local, [0, CAM_MOVE], [0, 1]);
  return mixCam(from, to, t);
};

export const JsArrayMethods: FC = () => {
  const frame = useCurrentFrame();
  const intro = frame < INTRO_FRAMES;
  const bodyStart = INTRO_FRAMES;
  const bodyEnd = INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES;
  const outro = frame >= bodyEnd;
  const body = frame - bodyStart;
  const activeIndex = intro
    ? -1
    : outro
      ? METHOD_COUNT
      : Math.min(METHOD_COUNT - 1, Math.floor(body / SCENE_FRAMES));
  const sceneFrame = intro || outro ? 0 : body - activeIndex * SCENE_FRAMES;
  const cam = getCamera(frame);
  const sheetOp = intro ? lin(frame, [0, 18], [0, 1]) : 1;
  const introCap = intro
    ? lin(frame, [12, 28, INTRO_FRAMES - 16, INTRO_FRAMES], [0, 1, 1, 0])
    : 0;
  const outroCap = outro ? lin(frame, [CAM_MOVE, CAM_MOVE + 14], [0, 1]) : 0;
  const chromeOp = intro || outro ? 0 : lin(sceneFrame, [8, 22], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: UI_FONT,
        color: INK,
        opacity: sheetOp,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="sheet" style={{ gap: ROW_GAP }}>
          {ROWS.map((Row, i) => {
            const phase: Phase =
              outro || i < activeIndex
                ? "done"
                : i === activeIndex
                  ? "active"
                  : "pending";
            const neighbor =
              intro || outro ? 1 : i === activeIndex ? 1 : 0.16;
            return (
              <div
                className="sheet-row"
                key={i}
                style={{
                  minHeight: ROW_MIN_H,
                  padding: "8px 12px",
                  borderRadius: 18,
                  background:
                    phase === "active"
                      ? "rgba(255,255,255,0.72)"
                      : "transparent",
                  opacity: neighbor,
                }}
              >
                <Row
                  frame={outro ? SCENE_FRAMES : sceneFrame}
                  phase={phase}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          opacity: chromeOp,
          fontFamily: UI_FONT,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, color: MUTED }}>
          JavaScript Array Methods
        </div>
        <div style={{ fontFamily: UI_FONT, fontSize: 22, color: MUTED }}>
          {activeIndex + 1} / {METHOD_COUNT}
        </div>
      </div>
      {!intro && !outro && activeIndex >= 0 && activeIndex < METHOD_COUNT ? (
        <Caption
          kicker={METHOD_META[activeIndex].kicker}
          lines={METHOD_META[activeIndex].lines}
          frame={sceneFrame}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 64,
          textAlign: "center",
          fontFamily: JP_FONT,
          fontSize: 40,
          fontWeight: 700,
          opacity: introCap,
        }}
      >
        配列メソッドを、1つずつ見ていく
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 64,
          textAlign: "center",
          fontFamily: JP_FONT,
          fontSize: 40,
          fontWeight: 700,
          opacity: outroCap,
        }}
      >
        入力 → メソッド → 結果
      </div>
    </AbsoluteFill>
  );
};
