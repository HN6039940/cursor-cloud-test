import type { FC } from "react";
import { useCurrentFrame } from "remotion";
import {
  A_COLOR,
  A_DUR,
  A_START,
  B_COLOR,
  B_DUR,
  B_START,
  CENTER,
  ICON_PATH_META,
  IconPathStage,
  MERGE_X,
  PATH_A,
  PATH_A_ARRIVAL,
  PATH_A_NODES,
  PATH_B,
  PATH_B_ARRIVAL,
  PATH_B_NODES,
  SUCCESS_COLOR,
  applyArrivalSuccess,
  nearestNode,
  packetAlong,
  packetT,
  type NodeFx,
  type NodeId,
  type OverlayPath,
} from "./iconPathShared";

export const IconPathBranch: FC = () => {
  const frame = useCurrentFrame();
  const tA = packetT(frame, A_START, A_DUR);
  const tB = packetT(frame, B_START, B_DUR);
  const aDone = frame >= A_START + A_DUR;
  const bDone = frame >= B_START + B_DUR;
  const bothDone = aDone && bDone;

  const packetA = packetAlong(frame, A_START, A_DUR, PATH_A, A_COLOR);
  const packetB = packetAlong(frame, B_START, B_DUR, PATH_B, B_COLOR);
  if (packetA && bothDone) {
    packetA.pos = { x: CENTER.db.x - 16, y: CENTER.db.y - 16 };
  }
  if (packetB && bothDone) {
    packetB.pos = { x: CENTER.db.x - 16, y: CENTER.db.y + 16 };
  }

  const nodeFx: Partial<Record<NodeId, NodeFx>> = {};

  if (frame >= A_START) {
    applyArrivalSuccess(nodeFx, PATH_A_NODES, PATH_A_ARRIVAL, tA, aDone);
  }
  if (frame >= B_START) {
    applyArrivalSuccess(nodeFx, PATH_B_NODES, PATH_B_ARRIVAL, tB, bDone);
  }

  if (!bothDone) {
    if (packetA) {
      const id = nearestNode(packetA.pos, PATH_A_NODES);
      nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
    }
    if (packetB) {
      const id = nearestNode(packetB.pos, PATH_B_NODES);
      const collide = id === "db" && nodeFx.db?.glow === A_COLOR;
      nodeFx[id] = { ...nodeFx[id], glow: collide ? "#E8F4FF" : B_COLOR };
    }
  }

  const trailOpacity = bothDone ? 0.88 : 0.7;
  const overlays: OverlayPath[] = [
    {
      pts: PATH_A,
      progress: frame >= A_START ? tA : 0,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: trailOpacity,
    },
    {
      pts: PATH_B,
      progress: frame >= B_START ? tB : 0,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: trailOpacity,
    },
  ];

  let caption = "アイコンカードと Remotion パス";
  if (bothDone) {
    caption = "成功して DB に到達";
  } else if (packetA && packetA.pos.x >= MERGE_X - 8 && packetB && packetB.pos.x >= MERGE_X - 8) {
    caption = "1 本のトランクに合流";
  } else if (frame >= B_START) {
    caption = "App A / App B へ分岐";
  } else if (frame >= A_START) {
    caption = "LB で振り分け";
  }

  return (
    <IconPathStage
      title="リクエストの流れ（成功）"
      caption={caption}
      packets={[packetA, packetB].filter((item): item is NonNullable<typeof item> => item !== null)}
      nodeFx={nodeFx}
      overlays={overlays}
    />
  );
};

export const RequestFlowSuccess = IconPathBranch;
export const ICON_PATH_BRANCH = ICON_PATH_META;
export const REQUEST_FLOW_SUCCESS = ICON_PATH_META;
