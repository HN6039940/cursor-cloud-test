import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Emoji, MorphEmoji, type EmojiName } from "./emoji";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const INTRO_FRAMES = 30;
export const SCENE_FRAMES = 150;
export const OUTRO_FRAMES = 75;
export const METHOD_COUNT = 8;

export const JS_ARRAY_METHODS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES + OUTRO_FRAMES,
};

const BG = "#F3F3F3";
const INK = "#111111";
const UI_FONT = 'Inter, "Noto Sans", "Liberation Sans", system-ui, sans-serif';
const EMOJI = 70;
const METHOD_EMOJI = 70;

type Phase = "pending" | "active" | "done";

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

const Code: FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily: UI_FONT,
        fontSize: 48,
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
}> = ({ items, size = EMOJI, itemStyle }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {items.map((name, i) => (
        <div key={`${name}-${i}`} style={itemStyle?.(i)}>
          <Emoji name={name} size={size} />
        </div>
      ))}
    </div>
  );
};

const Cells: FC<{ children: ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => {
  return <div style={{ display: "contents", opacity }}>{children}</div>;
};

const MapRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [36, 50], [0, 1]));
  const arrowOp = phaseOp(phase, lin(frame, [100, 116], [0, 1]));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={["dog", "dog", "dog", "dog"]}
          itemStyle={(i) => {
            const pulse =
              phase === "active" ? stagger(frame, 36, 100, i, 4) : 0;
            return {
              transform: `scale(${1 + 0.14 * Math.sin(pulse * Math.PI)})`,
            };
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
          gap: 2,
          opacity: resultOp,
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const p =
            phase === "done"
              ? 1
              : phase === "pending"
                ? 0
                : stagger(frame, 44, 108, i, 4);
          return <MorphEmoji key={i} from="dog" to="puppy" progress={p} size={EMOJI} />;
        })}
      </div>
    </Cells>
  );
};

const FilterRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          itemStyle={(i) => {
            const keep = items[i] === "puppy";
            const drop = phase === "active" ? stagger(frame, 40, 104, i, 4) : 0;
            return {
              opacity: keep ? 1 : 1 - 0.72 * drop,
              transform: `scale(${keep ? 1 + 0.1 * drop : 1 - 0.08 * drop})`,
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
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [36, 100], [0, 2.999]) : 0;
  const cursor = Math.min(2, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          itemStyle={(i) => {
            const visited = phase === "active" && scan > i;
            const ok = items[i] === "dog";
            const on = phase === "active" && i === cursor && frame >= 36;
            return {
              opacity: visited && !ok ? 0.38 : 1,
              transform: `scale(${on ? 1.16 : 1})`,
              filter: visited && !ok ? "saturate(0.7)" : "none",
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
      <Code style={{ opacity: resultOp, fontSize: 52 }}>false</Code>
    </Cells>
  );
};

const SomeRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [36, 88], [0, 1.999]) : 0;
  const cursor = Math.min(1, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 36;
            const after = phase === "active" && frame >= 88;
            const match = items[i] === "puppy";
            return {
              opacity: after && i > 1 ? 0.4 : 1,
              transform: `scale(${on || (after && i === 1 && match) ? 1.16 : 1})`,
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
      <Code style={{ opacity: resultOp, fontSize: 52 }}>true</Code>
    </Cells>
  );
};

const FillRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [36, 50], [0, 1]));
  const arrowOp = phaseOp(phase, lin(frame, [100, 116], [0, 1]));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={["dog", "dog", "dog", "dog"]}
          itemStyle={(i) => {
            const fillAt =
              phase === "active" && i >= 1
                ? stagger(frame, 40, 100, i - 1, 3)
                : 0;
            return {
              transform: `scale(${1 + 0.12 * fillAt})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp }}>
        {".fill("}
        <Emoji name="puppy" size={METHOD_EMOJI} />
        {", 1)"}
      </Code>
      <Arrow opacity={arrowOp} />
      <div style={{ display: "flex", alignItems: "center", gap: 2, opacity: resultOp }}>
        {[0, 1, 2, 3].map((i) => {
          const fillAt =
            i === 0
              ? 0
              : phase === "done"
                ? 1
                : phase === "pending"
                  ? 0
                  : stagger(frame, 44, 108, i - 1, 3);
          return (
            <MorphEmoji key={i} from="dog" to="puppy" progress={fillAt} size={EMOJI} />
          );
        })}
      </div>
    </Cells>
  );
};

const FindIndexRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = phase === "active" ? lin(frame, [36, 100], [0, 2.999]) : 0;
  const cursor = Math.min(2, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 36;
            const found = phase === "active" && frame >= 100 && i === 2;
            const dimTail = phase === "active" && frame >= 100 && i > 2;
            return {
              opacity: dimTail ? 0.38 : 1,
              transform: `scale(${on || found ? 1.16 : 1})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp, fontSize: 40 }}>
        {".findIndex(el => el === "}
        <Emoji name="puppy" size={52} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, fontSize: 52 }}>2</Code>
    </Cells>
  );
};

const FindRow: FC<{ frame: number; phase: Phase }> = ({ frame, phase }) => {
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  const scan = phase === "active" ? lin(frame, [36, 92], [0, 1.999]) : 0;
  const cursor = Math.min(1, Math.floor(scan));
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={items}
          itemStyle={(i) => {
            const on = phase === "active" && i === cursor && frame >= 36;
            const after = phase === "active" && frame >= 92;
            const match = i === 1;
            return {
              opacity: after ? (match ? 1 : 0.32) : 1,
              transform: `scale(${on || (after && match) ? 1.16 : 1})`,
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
  const methodOp = phaseOp(phase, lin(frame, [10, 26], [0, 1]));
  const resultOp = phaseOp(phase, lin(frame, [108, 124], [0, 1]));
  const gather = phase === "active" ? lin(frame, [40, 100], [0, 1]) : 0;
  const ingredients: EmojiName[] = ["cucumber", "tomato", "pancakes", "cheese"];
  const squeeze = Math.sin(gather * Math.PI);
  const inputOp = phase === "pending" ? 0.28 : 1;
  return (
    <Cells>
      <div style={{ opacity: inputOp }}>
        <Cluster
          items={ingredients}
          itemStyle={(i) => {
            const dir = i < 2 ? 1 : -1;
            const dist = i === 0 || i === 3 ? 18 : 8;
            return {
              transform: `translateX(${dir * dist * squeeze}px) scale(${1 - 0.08 * squeeze})`,
            };
          }}
        />
      </div>
      <Code style={{ opacity: methodOp, fontSize: 40 }}>
        {".reduce((acc, cur) => acc + cur)"}
      </Code>
      <Arrow opacity={resultOp} />
      <div
        style={{
          opacity: resultOp,
          transform: `scale(${phase === "done" ? 1 : 0.7 + 0.3 * resultOp})`,
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
  const sheetOp = intro ? lin(frame, [0, 16], [0, 1]) : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: UI_FONT,
        color: INK,
        opacity: sheetOp,
      }}
    >
      <div className="sheet">
        {ROWS.map((Row, i) => {
          const phase: Phase =
            outro || i < activeIndex
              ? "done"
              : i === activeIndex
                ? "active"
                : "pending";
          return (
            <div className="sheet-row" key={i}>
              <Row frame={sceneFrame} phase={phase} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
