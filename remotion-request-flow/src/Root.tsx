import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { RequestFlow } from "./RequestFlow";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="RequestFlow"
      component={RequestFlow}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
