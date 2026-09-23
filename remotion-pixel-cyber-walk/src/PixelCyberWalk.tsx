import type { CSSProperties, FC } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

/**
 * Fixed by SPEC.md — palette, canvas, sprite size, and parallax ratios stay put.
 * Canvas 960×540. Walk ≈ 8 fps via Math.floor(frame / 3) % 6 at 24 fps.
 * Parallax: far 0.15×, mid 0.45×, ground 1×, character 0, rain 0.8× + vertical fall.
 */
export const PIXEL_CYBER_WALK = {
  fps: 24,
  width: 960,
  height: 540,
  /** 15s. 360 / 18 = 20 walk cycles. Ground travels 3×960 px. */
  durationInFrames: 360,
} as const;

const BG = "#0B0B12";
const SPRITE_W = 32;
const SPRITE_H = 48;
const SCALE = 4;

/**
 * Walk cels share torso registration (opaque columns 3–22 on rows 6–18).
 * Pin that center. Do not re-center on the swinging feet or the body slides.
 */
const TORSO_CENTER_SRC = 12.5;
const CHARACTER_CENTER_X = 466;
const CHARACTER_TOP = 208;

/**
 * One ground speed. Each layer scrolls by its own ratio of that distance.
 * Far is 0.15× (3/20), not a fraction of the mid step.
 * Do not drop ground toward 0 — a frozen street reads as a moonwalk.
 */
const GROUND_PX_PER_FRAME = 8;
/** Vertical rain fall. Left as reviewed (デザ: rain speed is fine). */
const RAIN_Y_PX_PER_FRAME = 3;

const pixelated: CSSProperties = {
  imageRendering: "pixelated",
  display: "block",
  flexShrink: 0,
};

/** Integer px. ratio is num/den so 0.15 cannot collapse into the mid step. */
const scrollPx = (frame: number, ratioNum: number, ratioDen: number) =>
  Math.round((frame * GROUND_PX_PER_FRAME * ratioNum) / ratioDen);

const mod = (value: number, size: number) => {
  const remainder = Math.round(value) % size;
  return remainder < 0 ? remainder + size : remainder;
};

const TiledLayer: FC<{
  file: string;
  tileWidth: number;
  offsetX: number;
  offsetY?: number;
}> = ({ file, tileWidth, offsetX, offsetY = 0 }) => {
  const { height } = PIXEL_CYBER_WALK;
  const rows = offsetY === 0 ? 1 : 2;
  const left = -mod(offsetX, tileWidth);
  const top = offsetY === 0 ? 0 : mod(offsetY, height) - height;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          display: "flex",
          flexDirection: "column",
          width: tileWidth * 2,
        }}
      >
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} style={{ display: "flex", flexShrink: 0, height }}>
            {Array.from({ length: 2 }, (_, col) => (
              <Img
                key={col}
                src={staticFile(file)}
                width={tileWidth}
                height={height}
                style={{
                  ...pixelated,
                  width: tileWidth,
                  height,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const PixelCyberWalk: FC = () => {
  const frame = useCurrentFrame();
  const walkIndex = Math.floor(frame / 3) % 6;
  const characterLeft = Math.round(
    CHARACTER_CENTER_X - TORSO_CENTER_SRC * SCALE,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <TiledLayer
        file="pixel/bg-far.png"
        tileWidth={960}
        offsetX={scrollPx(frame, 3, 20)}
      />
      <TiledLayer
        file="pixel/bg-mid.png"
        tileWidth={1280}
        offsetX={scrollPx(frame, 9, 20)}
      />
      <TiledLayer
        file="pixel/bg-ground.png"
        tileWidth={960}
        offsetX={scrollPx(frame, 1, 1)}
      />
      <Img
        src={staticFile(`pixel/walk-0${walkIndex + 1}.png`)}
        width={SPRITE_W * SCALE}
        height={SPRITE_H * SCALE}
        style={{
          ...pixelated,
          position: "absolute",
          left: characterLeft,
          top: CHARACTER_TOP,
          width: SPRITE_W * SCALE,
          height: SPRITE_H * SCALE,
        }}
      />
      <TiledLayer
        file="pixel/fx-rain.png"
        tileWidth={960}
        offsetX={scrollPx(frame, 4, 5)}
        offsetY={frame * RAIN_Y_PX_PER_FRAME}
      />
    </AbsoluteFill>
  );
};
