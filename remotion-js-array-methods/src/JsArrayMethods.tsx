import type { CSSProperties, FC, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { Emoji, MorphEmoji, type EmojiName } from "./emoji";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const INTRO_FRAMES = 60;
export const SCENE_FRAMES = 150;
export const OUTRO_FRAMES = 45;
export const METHOD_COUNT = 8;

export const JS_ARRAY_METHODS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES + OUTRO_FRAMES,
};

const BG = "#EFEFEF";
const INK = "#111111";
const MUTED = "#6B6B6B";
const TRUE = "#1B7F3A";
const FALSE = "#C62828";
const HIGHLIGHT = "#2563EB";
const UI_FONT = 'Inter, "Noto Sans", "Liberation Sans", system-ui, sans-serif';
const CODE_FONT =
  '"Liberation Mono", "DejaVu Sans Mono", ui-monospace, monospace';

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

const sceneOpacity = (frame: number): number => {
  return lin(frame, [0, 10, SCENE_FRAMES - 10, SCENE_FRAMES], [0, 1, 1, 0]);
};

const Code: FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily: CODE_FONT,
        fontSize: 42,
        fontWeight: 700,
        color: INK,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const Slot: FC<{
  children: ReactNode;
  highlight?: number;
  dim?: number;
  label?: ReactNode;
}> = ({ children, highlight = 0, dim = 1, label }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: 100,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `rgba(37, 99, 235, ${0.16 * highlight})`,
          boxShadow:
            highlight > 0.25
              ? `inset 0 0 0 3px rgba(37, 99, 235, ${highlight})`
              : "none",
          opacity: 0.22 + 0.78 * dim,
          transform: `scale(${0.9 + 0.1 * dim})`,
        }}
      >
        {children}
      </div>
      <div
        style={{
          height: 28,
          fontFamily: CODE_FONT,
          fontSize: 22,
          fontWeight: 700,
          color: MUTED,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Arrow: FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <Code style={{ opacity, fontSize: 48, padding: "0 12px" }}>{"=>"}</Code>
  );
};

const FrameChrome: FC<{
  index: number;
  name: string;
  hint: string;
  children: ReactNode;
  opacity: number;
}> = ({ index, name, hint, children, opacity }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: UI_FONT,
        color: INK,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: MUTED }}>
          JavaScript Array Methods
        </div>
        <div style={{ fontFamily: CODE_FONT, fontSize: 28, color: MUTED }}>
          {index + 1} / {METHOD_COUNT}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -1 }}>
          {name}
        </div>
        <div style={{ marginTop: 8, fontSize: 28, color: MUTED }}>{hint}</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 390,
          left: 48,
          right: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {Array.from({ length: METHOD_COUNT }, (_, i) => {
          const on = i === index;
          return (
            <div
              key={i}
              style={{
                width: on ? 36 : 12,
                height: 12,
                borderRadius: 6,
                background: on ? INK : "#C9C9C9",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
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

const MapScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  return (
    <FrameChrome
      index={0}
      name="map"
      hint="transform every item"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <Slot key={i}>
            <MorphEmoji
              from="dog"
              to="puppy"
              progress={stagger(frame, 48, 108, i, 4)}
              size={76}
            />
          </Slot>
        ))}
      </div>
      <Code style={{ opacity: methodOp }}>
        .map(
        <Emoji name="dog" size={44} />
        {" => "}
        <Emoji name="puppy" size={44} />)
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ display: "flex", gap: 8, opacity: resultOp }}>
        {[0, 1, 2, 3].map((i) => (
          <Slot key={i}>
            <Emoji name="puppy" size={76} />
          </Slot>
        ))}
      </div>
    </FrameChrome>
  );
};

const FilterScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  return (
    <FrameChrome
      index={1}
      name="filter"
      hint="keep matching items"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((name, i) => {
          const keep = name === "puppy";
          const drop = stagger(frame, 48, 108, i, 4);
          return (
            <Slot key={i} dim={keep ? 1 : 1 - drop} highlight={keep ? drop : 0}>
              <Emoji name={name} size={76} />
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp }}>
        .filter(
        <Emoji name="puppy" size={44} />)
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ opacity: resultOp }}>
        <Slot>
          <Emoji name="puppy" size={76} />
        </Slot>
      </div>
    </FrameChrome>
  );
};

const EveryScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = lin(frame, [48, 108], [0, 2.999]);
  const cursor = Math.min(2, Math.floor(scan));
  return (
    <FrameChrome
      index={2}
      name="every"
      hint="true only if all match"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((name, i) => {
          const visited = scan > i;
          const ok = name === "dog";
          return (
            <Slot
              key={i}
              highlight={i === cursor && frame >= 48 ? 1 : 0}
              dim={visited && !ok ? 0.35 : 1}
              label={
                visited ? (
                  <span style={{ color: ok ? TRUE : FALSE }}>
                    {ok ? "✓" : "✗"}
                  </span>
                ) : null
              }
            >
              <Emoji name={name} size={76} />
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp }}>
        .every(
        <Emoji name="dog" size={44} />)
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, color: FALSE, fontSize: 64 }}>
        false
      </Code>
    </FrameChrome>
  );
};

const SomeScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const items: EmojiName[] = ["dog", "puppy", "puppy", "dog"];
  const scan = lin(frame, [48, 90], [0, 1.999]);
  const cursor = Math.min(1, Math.floor(scan));
  return (
    <FrameChrome
      index={3}
      name="some"
      hint="true if any item matches"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((name, i) => {
          const visited = scan > i;
          const ok = name === "puppy";
          return (
            <Slot
              key={i}
              highlight={i === cursor && frame >= 48 ? 1 : 0}
              dim={i > 1 && frame >= 90 ? 0.4 : 1}
              label={
                visited ? (
                  <span style={{ color: ok ? TRUE : FALSE }}>
                    {ok ? "✓" : "✗"}
                  </span>
                ) : null
              }
            >
              <Emoji name={name} size={76} />
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp }}>
        .some(
        <Emoji name="puppy" size={44} />)
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, color: TRUE, fontSize: 64 }}>true</Code>
    </FrameChrome>
  );
};

const FillScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  return (
    <FrameChrome
      index={4}
      name="fill"
      hint="write a value from index 1"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => {
          const fillAt = i === 0 ? 0 : stagger(frame, 48, 108, i - 1, 3);
          return (
            <Slot key={i} highlight={i >= 1 ? fillAt : 0} label={String(i)}>
              {i === 0 ? (
                <Emoji name="dog" size={76} />
              ) : (
                <MorphEmoji from="dog" to="puppy" progress={fillAt} size={76} />
              )}
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp }}>
        .fill(
        <Emoji name="puppy" size={44} />, 1)
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ display: "flex", gap: 8, opacity: resultOp }}>
        {(["dog", "puppy", "puppy", "puppy"] as EmojiName[]).map((name, i) => (
          <Slot key={i}>
            <Emoji name={name} size={76} />
          </Slot>
        ))}
      </div>
    </FrameChrome>
  );
};

const FindIndexScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const items: EmojiName[] = ["dog", "dog", "puppy", "dog"];
  const scan = lin(frame, [48, 108], [0, 2.999]);
  const cursor = Math.min(2, Math.floor(scan));
  return (
    <FrameChrome
      index={5}
      name="findIndex"
      hint="index of the first match"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((name, i) => {
          const visited = scan > i;
          const match = name === "puppy";
          return (
            <Slot
              key={i}
              highlight={i === cursor && frame >= 48 ? 1 : 0}
              dim={i > 2 && frame >= 108 ? 0.4 : 1}
              label={
                <span style={{ color: visited && match ? HIGHLIGHT : MUTED }}>
                  {i}
                </span>
              }
            >
              <Emoji name={name} size={76} />
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp, fontSize: 34 }}>
        {".findIndex(el => el === "}
        <Emoji name="puppy" size={40} />
        {")"}
      </Code>
      <Arrow opacity={resultOp} />
      <Code style={{ opacity: resultOp, color: HIGHLIGHT, fontSize: 72 }}>
        2
      </Code>
    </FrameChrome>
  );
};

const FindScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const items: EmojiName[] = ["dog", "puppy", "dog", "dog"];
  const scan = lin(frame, [48, 96], [0, 1.999]);
  const cursor = Math.min(1, Math.floor(scan));
  return (
    <FrameChrome
      index={6}
      name="find"
      hint="return the first matching item"
      opacity={sceneOpacity(frame)}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((name, i) => {
          const match = i === 1;
          const after = frame >= 96;
          return (
            <Slot
              key={i}
              highlight={i === cursor && frame >= 48 ? 1 : 0}
              dim={after ? (match ? 1 : 0.28) : 1}
            >
              <Emoji name={name} size={76} />
            </Slot>
          );
        })}
      </div>
      <Code style={{ opacity: methodOp }}>
        .find(
        <Emoji name="puppy" size={44} />)
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ opacity: resultOp }}>
        <Slot>
          <Emoji name="puppy" size={76} />
        </Slot>
      </div>
    </FrameChrome>
  );
};

const ReduceScene: FC = () => {
  const frame = useCurrentFrame();
  const methodOp = lin(frame, [18, 36], [0, 1]);
  const resultOp = lin(frame, [108, 126], [0, 1]);
  const gather = lin(frame, [48, 108], [0, 1]);
  const ingredients: EmojiName[] = [
    "cucumber",
    "tomato",
    "pancakes",
    "cheese",
  ];
  const offsets = [-150, -50, 50, 150];
  return (
    <FrameChrome
      index={7}
      name="reduce"
      hint="fold items into one value"
      opacity={sceneOpacity(frame)}
    >
      <div
        style={{
          position: "relative",
          width: 420,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ingredients.map((name, i) => (
          <div
            key={name}
            style={{
              position: "absolute",
              transform: `translateX(${offsets[i] * (1 - gather)}px) scale(${1 - 0.25 * gather})`,
              opacity: 1 - 0.85 * gather,
            }}
          >
            <Emoji name={name} size={76} />
          </div>
        ))}
        <div style={{ opacity: gather, transform: `scale(${0.6 + 0.4 * gather})` }}>
          <Emoji name="burger" size={88} />
        </div>
      </div>
      <Code style={{ opacity: methodOp, fontSize: 32 }}>
        {".reduce((acc, cur) => acc + cur)"}
      </Code>
      <Arrow opacity={resultOp} />
      <div style={{ opacity: resultOp }}>
        <Slot>
          <Emoji name="burger" size={76} />
        </Slot>
      </div>
    </FrameChrome>
  );
};

const Intro: FC = () => {
  const frame = useCurrentFrame();
  const op = lin(frame, [0, 12, INTRO_FRAMES - 8, INTRO_FRAMES], [0, 1, 1, 0]);
  const names = [
    "map",
    "filter",
    "every",
    "some",
    "fill",
    "findIndex",
    "find",
    "reduce",
  ];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: UI_FONT,
        color: INK,
        opacity: op,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, color: MUTED }}>
        JavaScript
      </div>
      <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
        Array Methods
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 24,
          fontFamily: CODE_FONT,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {names.map((name, i) => (
          <span
            key={name}
            style={{ opacity: lin(frame, [10 + i * 4, 22 + i * 4], [0, 1]) }}
          >
            .{name}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Outro: FC = () => {
  const frame = useCurrentFrame();
  const op = lin(frame, [0, 10, OUTRO_FRAMES - 6, OUTRO_FRAMES], [0, 1, 1, 0]);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: UI_FONT,
        color: INK,
        opacity: op,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 800 }}>input → method → result</div>
      <div style={{ fontSize: 28, color: MUTED }}>Array.prototype 8 methods</div>
    </AbsoluteFill>
  );
};

const SCENES = [
  MapScene,
  FilterScene,
  EveryScene,
  SomeScene,
  FillScene,
  FindIndexScene,
  FindScene,
  ReduceScene,
] as const;

const SCENE_NAMES = [
  "map",
  "filter",
  "every",
  "some",
  "fill",
  "findIndex",
  "find",
  "reduce",
] as const;

export const JsArrayMethods: FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence durationInFrames={INTRO_FRAMES} name="Intro">
        <Intro />
      </Sequence>
      {SCENES.map((Scene, i) => (
        <Sequence
          key={SCENE_NAMES[i]}
          from={INTRO_FRAMES + i * SCENE_FRAMES}
          durationInFrames={SCENE_FRAMES}
          name={SCENE_NAMES[i]}
        >
          <Scene />
        </Sequence>
      ))}
      <Sequence
        from={INTRO_FRAMES + METHOD_COUNT * SCENE_FRAMES}
        durationInFrames={OUTRO_FRAMES}
        name="Outro"
      >
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
