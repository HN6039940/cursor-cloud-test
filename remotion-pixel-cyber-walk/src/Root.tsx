import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { PIXEL_CYBER_WALK, PixelCyberWalk } from "./PixelCyberWalk";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="PixelCyberWalk"
      component={PixelCyberWalk}
      durationInFrames={PIXEL_CYBER_WALK.durationInFrames}
      fps={PIXEL_CYBER_WALK.fps}
      width={PIXEL_CYBER_WALK.width}
      height={PIXEL_CYBER_WALK.height}
    />
  );
};
