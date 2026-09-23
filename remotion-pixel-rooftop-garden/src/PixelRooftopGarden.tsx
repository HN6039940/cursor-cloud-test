import type { CSSProperties, FC } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/**
 * Palette and 960×540 canvas stay on SPEC.md.
 * Pan ratios stay exaggerated so the roof outruns the city.
 * Plant layers sway on a piecewise-linear triangle (no sine, no easing).
 *
 * Ratios (exact fractions, not a shared step):
 *   sky 0.02 (1/50) / city 0.12 (3/25) / garden-base 0.5 (1/2)
 *   plants-far 0.45 (9/20) / plants-mid 0.55 (11/20) / plants-near 0.7 (7/10)
 *   roof 1 / petals 1.25 (5/4)
 */
export const PIXEL_ROOFTOP_GARDEN = {
  fps: 24,
  width: 960,
  height: 540,
  /** 15s. Hold, linear pan, hold. */
  durationInFrames: 360,
} as const;

/** Frames 0–48 still, 48–312 linear pan, 312–359 still. */
export const PAN_START = 48;
export const PAN_END = 312;
/** Roof travel (ratio 1). Other layers are this distance × their ratio. */
export const CAMERA_TRAVEL = 400;

/** preview-static centers the 1280-wide skyline in the 960 frame. */
const CITY_ORIGIN = 160;
const CITY_WIDTH = 1280;

/**
 * Railing bay at source x=96 (width 48). Phase matches x % 48 === 0,
 * so the strip that enters on the right continues the 48px post rhythm
 * (next post lands on source x = 976). No second pier.
 */
const ROOF_BAY_X = 96;
const ROOF_BAY_W = 48;
const ROOF_BAYS = Math.ceil(CAMERA_TRAVEL / ROOF_BAY_W) + 1;

/** Gentle independent fall. 1px every 4 frames — not tied to the camera. */
const PETAL_Y_NUM = 1;
const PETAL_Y_DEN = 4;
/** Extra horizontal breeze on the petals, piecewise linear, ±16px. */
const PETAL_WIND_AMP = 16;
const PETAL_WIND_PERIOD = 240;
const PETAL_WIND_PHASE = 80;

/**
 * Whole-layer wind. Pivot Y is the opaque foot line of that PNG.
 * Periods and phases differ so the three bands do not peak together.
 */
export const SWAY = {
  far: { amp: 0.6, period: 192, phase: 0, pivotY: 420 },
  mid: { amp: 1.2, period: 144, phase: 48, pivotY: 427 },
  near: { amp: 2.2, period: 120, phase: 30, pivotY: 420 },
} as const;

const SKY = "#B8E4FF";

const pixelated: CSSProperties = {
  imageRendering: "pixelated",
  display: "block",
  flexShrink: 0,
  maxWidth: "none",
};

const mod = (value: number, size: number) => {
  const remainder = Math.round(value) % size;
  return remainder < 0 ? remainder + size : remainder;
};

/** Linear camera distance in px. Clamped so the head and tail stay still. */
export const cameraTravel = (frame: number) =>
  interpolate(frame, [PAN_START, PAN_END], [0, CAMERA_TRAVEL], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

/** Integer px. num/den keeps 0.02 from collapsing into another layer's step. */
export const layerShift = (frame: number, num: number, den: number) =>
  Math.round((cameraTravel(frame) * num) / den);

/** Piecewise-linear triangle in [-1, 1]. Peaks reverse direction with no ease. */
export const swayUnit = (frame: number, period: number, phase: number) => {
  const wrapped = (((frame + phase) % period) + period) % period;
  const half = period / 2;
  if (wrapped <= half) {
    return -1 + (wrapped / half) * 2;
  }
  return 1 - ((wrapped - half) / half) * 2;
};

const swayDegrees = (
  frame: number,
  layer: { amp: number; period: number; phase: number },
) => swayUnit(frame, layer.period, layer.phase) * layer.amp;

const PlacedImg: FC<{
  file: string;
  left: number;
  top?: number;
  width: number;
}> = ({ file, left, top = 0, width }) => {
  const { height } = PIXEL_ROOFTOP_GARDEN;
  return (
    <Img
      src={staticFile(file)}
      width={width}
      height={height}
      style={{
        ...pixelated,
        position: "absolute",
        left,
        top,
        width,
        height,
      }}
    />
  );
};

/**
 * Native-size plate plus the same plate starting at its right edge.
 * Used for sky (a few px of clean gradient) and garden (48px floor grid
 * continues; the next planters are the real left edge of the painting).
 */
const ExtendedPlate: FC<{ file: string; offset: number; width: number }> = ({
  file,
  offset,
  width,
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <PlacedImg file={file} left={-offset} width={width} />
    <PlacedImg file={file} left={width - offset} width={width} />
  </AbsoluteFill>
);

/** Same plate as ExtendedPlate, rotated about the planter feet. Deck and roof stay at 0°. */
const SwayPlate: FC<{
  file: string;
  offset: number;
  degrees: number;
  pivotY: number;
}> = ({ file, offset, degrees, pivotY }) => {
  const { width, height } = PIXEL_ROOFTOP_GARDEN;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transformOrigin: `50% ${pivotY}px`,
          transform: `rotate(${degrees}deg)`,
        }}
      >
        <PlacedImg file={file} left={-offset} width={width} />
        <PlacedImg file={file} left={width - offset} width={width} />
      </div>
    </AbsoluteFill>
  );
};

/** Roof continuation: repeat one clean railing bay. The pier stays on the original plate. */
const RoofBays: FC<{ offset: number }> = ({ offset }) => {
  const { height } = PIXEL_ROOFTOP_GARDEN;
  const origin = PIXEL_ROOFTOP_GARDEN.width - offset;
  return (
    <>
      {Array.from({ length: ROOF_BAYS }, (_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: origin + index * ROOF_BAY_W,
            top: 0,
            width: ROOF_BAY_W,
            height,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("pixel/roof-near.png")}
            width={PIXEL_ROOFTOP_GARDEN.width}
            height={height}
            style={{
              ...pixelated,
              position: "absolute",
              left: -ROOF_BAY_X,
              top: 0,
              width: PIXEL_ROOFTOP_GARDEN.width,
              height,
            }}
          />
        </div>
      ))}
    </>
  );
};

const Petals: FC<{ offsetX: number; offsetY: number }> = ({
  offsetX,
  offsetY,
}) => {
  const { width, height } = PIXEL_ROOFTOP_GARDEN;
  const left = -mod(offsetX, width);
  const top = mod(offsetY, height) - height;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          display: "flex",
          flexDirection: "column",
          width: width * 2,
        }}
      >
        {Array.from({ length: 2 }, (_, row) => (
          <div key={row} style={{ display: "flex", flexShrink: 0, height }}>
            {Array.from({ length: 2 }, (_, col) => (
              <Img
                key={col}
                src={staticFile("pixel/fx-petals.png")}
                width={width}
                height={height}
                style={{ ...pixelated, width, height }}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const PixelRooftopGarden: FC = () => {
  const frame = useCurrentFrame();
  const { width } = PIXEL_ROOFTOP_GARDEN;
  const sky = layerShift(frame, 1, 50);
  const city = layerShift(frame, 3, 25);
  const gardenBase = layerShift(frame, 1, 2);
  const plantsFar = layerShift(frame, 9, 20);
  const plantsMid = layerShift(frame, 11, 20);
  const plantsNear = layerShift(frame, 7, 10);
  const roof = layerShift(frame, 1, 1);
  const petalsX =
    layerShift(frame, 5, 4) +
    Math.round(
      swayUnit(frame, PETAL_WIND_PERIOD, PETAL_WIND_PHASE) * PETAL_WIND_AMP,
    );
  const petalsY = Math.round((frame * PETAL_Y_NUM) / PETAL_Y_DEN);

  return (
    <AbsoluteFill style={{ backgroundColor: SKY, overflow: "hidden" }}>
      <ExtendedPlate file="pixel/sky.png" offset={sky} width={width} />
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <PlacedImg
          file="pixel/city-far.png"
          left={-(CITY_ORIGIN + city)}
          width={CITY_WIDTH}
        />
      </AbsoluteFill>
      <ExtendedPlate
        file="pixel/garden-base.png"
        offset={gardenBase}
        width={width}
      />
      <SwayPlate
        file="pixel/plants-far.png"
        offset={plantsFar}
        degrees={swayDegrees(frame, SWAY.far)}
        pivotY={SWAY.far.pivotY}
      />
      <SwayPlate
        file="pixel/plants-mid.png"
        offset={plantsMid}
        degrees={swayDegrees(frame, SWAY.mid)}
        pivotY={SWAY.mid.pivotY}
      />
      <SwayPlate
        file="pixel/plants-near.png"
        offset={plantsNear}
        degrees={swayDegrees(frame, SWAY.near)}
        pivotY={SWAY.near.pivotY}
      />
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <RoofBays offset={roof} />
        <PlacedImg file="pixel/roof-near.png" left={-roof} width={width} />
      </AbsoluteFill>
      <Petals offsetX={petalsX} offsetY={petalsY} />
    </AbsoluteFill>
  );
};
