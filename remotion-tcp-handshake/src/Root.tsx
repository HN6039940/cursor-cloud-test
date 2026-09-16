import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { TCP_SEQUENCE_DIAGRAM, TcpSequenceDiagram } from "./TcpSequenceDiagram";
import { TCP_THREE_WAY_SUCCESS, TcpThreeWaySuccess } from "./TcpThreeWaySuccess";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="TcpThreeWaySuccess"
        component={TcpThreeWaySuccess}
        durationInFrames={TCP_THREE_WAY_SUCCESS.durationInFrames}
        fps={TCP_THREE_WAY_SUCCESS.fps}
        width={TCP_THREE_WAY_SUCCESS.width}
        height={TCP_THREE_WAY_SUCCESS.height}
      />
      <Composition
        id="TcpSequenceDiagram"
        component={TcpSequenceDiagram}
        durationInFrames={TCP_SEQUENCE_DIAGRAM.durationInFrames}
        fps={TCP_SEQUENCE_DIAGRAM.fps}
        width={TCP_SEQUENCE_DIAGRAM.width}
        height={TCP_SEQUENCE_DIAGRAM.height}
      />
    </>
  );
};
