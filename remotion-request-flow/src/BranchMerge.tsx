import type { FC } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  CENTER,
  FPS,
  HEIGHT,
  nearestNode,
  PATH_A,
  PATH_B,
  TopologyStage,
  walkPolyline,
  WIDTH,
  type NodeId,
  type PacketView,
} from "./branchCacheShared";

const A_COLOR = "#7CE7FF";
const B_COLOR = "#FFB020";
const PATH_A_NODES = ["client", "lb", "appa", "db"] as const;
const PATH_B_NODES = ["client", "lb", "appb", "db"] as const;

const A_START = 60;
const A_DUR = 270;
const B_START = 150;
const B_DUR = 270;
const DURATION = 750;

const ease = Easing.inOut(Easing.cubic);

const packetAlong = (
  frame: number,
  start: number,
  duration: number,
  path: typeof PATH_A,
  color: string,
): PacketView | null => {
  if (frame < start) {
    return null;
  }
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [start, start + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { pos: walkPolyline(path, t), color, opacity: fade };
};

export const BranchMerge: FC = () => {
  const frame = useCurrentFrame();
  const aDone = frame >= A_START + A_DUR;
  const bDone = frame >= B_START + B_DUR;
  const packetA = packetAlong(frame, A_START, A_DUR, PATH_A, A_COLOR);
  const packetB = packetAlong(frame, B_START, B_DUR, PATH_B, B_COLOR);
  if (packetA && aDone && bDone) {
    packetA.pos = { x: CENTER.db.x, y: CENTER.db.y - 11 };
  }
  if (packetB && aDone && bDone) {
    packetB.pos = { x: CENTER.db.x, y: CENTER.db.y + 11 };
  }

  const active: Partial<Record<NodeId, string>> = {};
  if (packetA) {
    active[nearestNode(packetA.pos, PATH_A_NODES)] = A_COLOR;
  }
  if (packetB) {
    const id = nearestNode(packetB.pos, PATH_B_NODES);
    active[id] = id === "db" && active.db ? "#E8F4FF" : B_COLOR;
  }

  let caption = "同じトポロジから分岐する";
  if (aDone && bDone) {
    caption = "DB で合流";
  } else if (frame >= B_START) {
    caption = "App A / App B で並列処理";
  } else if (frame >= A_START) {
    caption = "LB で振り分け";
  }

  return (
    <TopologyStage
      labelProgress={interpolate(frame, [0, 36], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}
      active={active}
      packets={[packetA, packetB].filter((item): item is PacketView => item !== null)}
      title="リクエストの分岐と合流"
      caption={caption}
      titleOpacity={interpolate(frame, [0, 16], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}
    />
  );
};

export const BRANCH_MERGE = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
