import type { FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  A_COLOR,
  A_DUR,
  A_START,
  B_COLOR,
  B_LOST_DUR,
  B_START,
  CENTER,
  FAIL_COLOR,
  ICON_PATH_META,
  IconPathStage,
  PATH_A,
  PATH_A_ARRIVAL,
  PATH_A_NODES,
  PATH_B_LOST,
  PATH_B_LOST_ARRIVAL,
  PATH_B_LOST_BRANCH_T,
  PATH_FAIL_BRANCH,
  SUCCESS_COLOR,
  badgeFromT,
  nearestNode,
  packetAlong,
  packetT,
  type NodeFx,
  type NodeId,
  type OverlayPath,
} from "./iconPathShared";

const B_FADE = 22;
const SUCCESS_ON_B: NodeId[] = ["client", "lb"];

export const RequestFlowFailLost: FC = () => {
  const frame = useCurrentFrame();
  const tA = packetT(frame, A_START, A_DUR);
  const tB = packetT(frame, B_START, B_LOST_DUR);
  const aDone = frame >= A_START + A_DUR;
  const bArrive = B_START + B_LOST_DUR;
  const bLost = frame >= bArrive;

  const packetA = packetAlong(frame, A_START, A_DUR, PATH_A, A_COLOR);
  const packetB = packetAlong(frame, B_START, B_LOST_DUR, PATH_B_LOST, B_COLOR, {
    fadeOutStart: bArrive,
    fadeOutDur: B_FADE,
  });
  if (packetA && aDone) {
    packetA.pos = { x: CENTER.db.x - 10, y: CENTER.db.y };
  }

  const nodeFx: Partial<Record<NodeId, NodeFx>> = {};
  const markSuccess = (id: NodeId, opacity: number) => {
    const prev = nodeFx[id];
    nodeFx[id] = {
      glow: SUCCESS_COLOR,
      badge: "check",
      badgeOpacity: Math.max(prev?.badgeOpacity ?? 0, opacity),
    };
  };

  if (frame >= A_START) {
    for (const id of PATH_A_NODES) {
      if (tA >= PATH_A_ARRIVAL[id]) {
        markSuccess(id, badgeFromT(tA, PATH_A_ARRIVAL[id], aDone));
      }
    }
  }
  if (frame >= B_START) {
    for (const id of SUCCESS_ON_B) {
      if (tB >= PATH_B_LOST_ARRIVAL[id]) {
        markSuccess(id, badgeFromT(tB, PATH_B_LOST_ARRIVAL[id], bLost));
      }
    }
    if (tB >= PATH_B_LOST_ARRIVAL.appb) {
      const dim = bLost
        ? interpolate(frame, [bArrive, bArrive + 28], [1, 0.7], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 1;
      nodeFx.appb = {
        glow: FAIL_COLOR,
        badge: "x",
        badgeOpacity: badgeFromT(tB, PATH_B_LOST_ARRIVAL.appb, bLost),
        dim,
      };
    }
  }

  if (packetA && !aDone) {
    const id = nearestNode(packetA.pos, PATH_A_NODES);
    nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
  }
  if (packetB && !bLost) {
    const id = nearestNode(packetB.pos, ["client", "lb", "appb"]);
    if (id !== "appb" || !nodeFx.appb?.badge) {
      nodeFx[id] = { ...nodeFx[id], glow: B_COLOR };
    }
  }

  const failProgress =
    frame < B_START || tB <= PATH_B_LOST_BRANCH_T
      ? 0
      : (tB - PATH_B_LOST_BRANCH_T) / Math.max(0.001, 1 - PATH_B_LOST_BRANCH_T);

  const overlays: OverlayPath[] = [
    {
      pts: PATH_A,
      progress: frame >= A_START ? tA : 0,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: aDone ? 0.88 : 0.7,
    },
    {
      pts: PATH_FAIL_BRANCH,
      progress: failProgress,
      color: bLost ? FAIL_COLOR : B_COLOR,
      width: 5,
      opacity: bLost ? 0.58 : 0.78,
    },
  ];

  let caption = "同じトポロジから分岐する";
  if (aDone && bLost) {
    caption = "App A は成功、App B のパケットはロスト";
  } else if (bLost) {
    caption = "App B で失敗し、パケットが消える";
  } else if (frame >= B_START) {
    caption = "App A / App B へ分岐";
  } else if (frame >= A_START) {
    caption = "LB で振り分け";
  }

  return (
    <IconPathStage
      title="リクエストの流れ（ロスト）"
      caption={caption}
      packets={[packetA, packetB].filter((item): item is NonNullable<typeof item> => item !== null)}
      nodeFx={nodeFx}
      overlays={overlays}
    />
  );
};

export const REQUEST_FLOW_FAIL_LOST = ICON_PATH_META;
