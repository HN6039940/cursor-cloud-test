import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { EC2_PLACEMENT_GROUPS, Ec2PlacementGroups } from "./Ec2PlacementGroups";
import { ENI_OVERVIEW, EniOverview } from "./EniOverview";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="Ec2PlacementGroups"
        component={Ec2PlacementGroups}
        durationInFrames={EC2_PLACEMENT_GROUPS.durationInFrames}
        fps={EC2_PLACEMENT_GROUPS.fps}
        width={EC2_PLACEMENT_GROUPS.width}
        height={EC2_PLACEMENT_GROUPS.height}
      />
      <Composition
        id="EniOverview"
        component={EniOverview}
        durationInFrames={ENI_OVERVIEW.durationInFrames}
        fps={ENI_OVERVIEW.fps}
        width={ENI_OVERVIEW.width}
        height={ENI_OVERVIEW.height}
      />
    </>
  );
};
