import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { TCP_THREE_WAY_SUCCESS, TcpThreeWaySuccess } from "./TcpThreeWaySuccess";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="TcpThreeWaySuccess"
      component={TcpThreeWaySuccess}
      durationInFrames={TCP_THREE_WAY_SUCCESS.durationInFrames}
      fps={TCP_THREE_WAY_SUCCESS.fps}
      width={TCP_THREE_WAY_SUCCESS.width}
      height={TCP_THREE_WAY_SUCCESS.height}
    />
  );
};
