import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { VIZ_STACK_ROLES, VizStackRoles } from "./VizStackRoles";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="VizStackRoles"
      component={VizStackRoles}
      durationInFrames={VIZ_STACK_ROLES.durationInFrames}
      fps={VIZ_STACK_ROLES.fps}
      width={VIZ_STACK_ROLES.width}
      height={VIZ_STACK_ROLES.height}
    />
  );
};
