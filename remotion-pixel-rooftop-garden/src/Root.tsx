import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { PIXEL_ROOFTOP_GARDEN, PixelRooftopGarden } from "./PixelRooftopGarden";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="PixelRooftopGarden"
      component={PixelRooftopGarden}
      durationInFrames={PIXEL_ROOFTOP_GARDEN.durationInFrames}
      fps={PIXEL_ROOFTOP_GARDEN.fps}
      width={PIXEL_ROOFTOP_GARDEN.width}
      height={PIXEL_ROOFTOP_GARDEN.height}
    />
  );
};
