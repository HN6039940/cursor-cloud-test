import type { CSSProperties, FC } from "react";
import { Img, staticFile } from "remotion";

export type EmojiName =
  | "dog"
  | "puppy"
  | "cucumber"
  | "tomato"
  | "pancakes"
  | "cheese"
  | "burger";

const FILES: Record<EmojiName, string> = {
  dog: "emoji/1f415.svg",
  puppy: "emoji/1f436.svg",
  cucumber: "emoji/1f952.svg",
  tomato: "emoji/1f345.svg",
  pancakes: "emoji/1f95e.svg",
  cheese: "emoji/1f9c0.svg",
  burger: "emoji/1f354.svg",
};

export const Emoji: FC<{
  name: EmojiName;
  size?: number;
  style?: CSSProperties;
}> = ({ name, size = 72, style }) => {
  return (
    <Img
      src={staticFile(FILES[name])}
      style={{
        width: size,
        height: size,
        display: "block",
        objectFit: "contain",
        ...style,
      }}
    />
  );
};

export const MorphEmoji: FC<{
  from: EmojiName;
  to: EmojiName;
  progress: number;
  size?: number;
}> = ({ from, to, progress, size = 72 }) => {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - p }}>
        <Emoji name={from} size={size} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: p }}>
        <Emoji name={to} size={size} />
      </div>
    </div>
  );
};
