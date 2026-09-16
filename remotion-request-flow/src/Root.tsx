import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { BOUNDARY_PROBE, BoundaryProbe } from "./BoundaryProbe";
import { BRANCH_MERGE, BranchMerge } from "./BranchMerge";
import { CACHE_HIT_MISS, CacheHitMiss } from "./CacheHitMiss";
import { ICON_NODES, IconNodes } from "./IconNodes";
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
      <Composition
        id="BranchMerge"
        component={BranchMerge}
        durationInFrames={BRANCH_MERGE.durationInFrames}
        fps={BRANCH_MERGE.fps}
        width={BRANCH_MERGE.width}
        height={BRANCH_MERGE.height}
      />
      <Composition
        id="CacheHitMiss"
        component={CacheHitMiss}
        durationInFrames={CACHE_HIT_MISS.durationInFrames}
        fps={CACHE_HIT_MISS.fps}
        width={CACHE_HIT_MISS.width}
        height={CACHE_HIT_MISS.height}
      />
      <Composition
        id="IconNodes"
        component={IconNodes}
        durationInFrames={ICON_NODES.durationInFrames}
        fps={ICON_NODES.fps}
        width={ICON_NODES.width}
        height={ICON_NODES.height}
      />
    </>
  );
};
