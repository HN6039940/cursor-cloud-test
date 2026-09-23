import type { CSSProperties, FC } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

/**
 * Fixed by SPEC.md — do not retune palette, canvas, sprite size, or parallax ratios.
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
/** Preview still places walk-02 here (feet on the alley floor under the neon rail). */
const CHARACTER_LEFT = (PIXEL_CYBER_WALK.width - SPRITE_W * SCALE) / 2;
const CHARACTER_TOP = 208;

/** Ground speed 8 px/frame. Other layers are exact SPEC ratios of that. */
const GROUND_PX_PER_FRAME = 8;

const pixelated: CSSProperties = {
  imageRendering: "pixelated",
  display: "block",
};

const mod = (value: number, size: number) => {
  const rounded = Math.round(value);
  const remainder = rounded % size;
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
        }}
      >
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} style={{ display: "flex", height }}>
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
  const groundX = frame * GROUND_PX_PER_FRAME;
  const walkIndex = Math.floor(frame / 3) % 6;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <TiledLayer
        file="pixel/bg-far.png"
        tileWidth={960}
        offsetX={(frame * 6) / 5}
      />
      <TiledLayer
        file="pixel/bg-mid.png"
        tileWidth={1280}
        offsetX={(frame * 18) / 5}
      />
      <TiledLayer
        file="pixel/bg-ground.png"
        tileWidth={960}
        offsetX={groundX}
      />
      <Img
        src={staticFile(`pixel/walk-0${walkIndex + 1}.png`)}
        width={SPRITE_W * SCALE}
        height={SPRITE_H * SCALE}
        style={{
          ...pixelated,
          position: "absolute",
          left: CHARACTER_LEFT,
          top: CHARACTER_TOP,
          width: SPRITE_W * SCALE,
          height: SPRITE_H * SCALE,
        }}
      />
      <TiledLayer
        file="pixel/fx-rain.png"
        tileWidth={960}
        offsetX={(frame * 32) / 5}
        offsetY={frame * 3}
      />
    </AbsoluteFill>
  );
};
