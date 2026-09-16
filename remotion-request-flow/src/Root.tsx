import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { BOUNDARY_PROBE, BoundaryProbe } from "./BoundaryProbe";
import { RequestFlow } from "./RequestFlow";
import { REQUEST_FLOW_ZOOM, RequestFlowZoom } from "./RequestFlowZoom";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="RequestFlow"
        component={RequestFlow}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RequestFlowZoom"
        component={RequestFlowZoom}
        durationInFrames={REQUEST_FLOW_ZOOM.durationInFrames}
        fps={REQUEST_FLOW_ZOOM.fps}
        width={REQUEST_FLOW_ZOOM.width}
        height={REQUEST_FLOW_ZOOM.height}
      />
      <Composition
        id="BoundaryProbe"
        component={BoundaryProbe}
        durationInFrames={BOUNDARY_PROBE.durationInFrames}
        fps={BOUNDARY_PROBE.fps}
        width={BOUNDARY_PROBE.width}
        height={BOUNDARY_PROBE.height}
      />
    </>
  );
};
