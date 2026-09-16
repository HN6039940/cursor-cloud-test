import type { FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  A_COLOR,
  A_DUR,
  CARD_W,
  CENTER,
  FAIL_COLOR,
  FPS,
  HEIGHT,
  IconPathStage,
  NODE,
  PATH_A,
  PATH_A_ARRIVAL,
  PATH_A_NODES,
  PATH_RETRY_FAIL,
  PATH_RETRY_FAIL_ARRIVAL,
  PATH_RETRY_FAIL_NODES,
  RETRY_FAIL_DUR,
  SUCCESS_COLOR,
  WIDTH,
  badgeFromT,
  nearestNode,
  packetAlong,
  packetT,
  type NodeFx,
  type NodeId,
  type OverlayPath,
  type StageNote,
} from "./iconPathShared";

const FAIL_START = 175;
const FAIL_DUR = RETRY_FAIL_DUR;
const FAIL_ARRIVE = FAIL_START + FAIL_DUR;
const FAIL_FADE = 22;
const FAIL_HOLD = 48;
const RETRY_BEAT = 40;
const RETRY_START = FAIL_ARRIVE + FAIL_HOLD + RETRY_BEAT;
const RETRY_DUR = A_DUR;
const RETRY_DONE = RETRY_START + RETRY_DUR;
const END_HOLD = 72;
const DURATION = RETRY_DONE + END_HOLD;

const SUCCESS_ON_FAIL: NodeId[] = ["client", "lb"];

export const RequestFlowRetry: FC = () => {
  const frame = useCurrentFrame();
  const tFail = packetT(frame, FAIL_START, FAIL_DUR);
  const tRetry = packetT(frame, RETRY_START, RETRY_DUR);
  const failArrive = frame >= FAIL_ARRIVE;
  const retrying = frame >= RETRY_START;
  const retryDone = frame >= RETRY_DONE;

  const packetFail = packetAlong(frame, FAIL_START, FAIL_DUR, PATH_RETRY_FAIL, A_COLOR, {
    fadeOutStart: FAIL_ARRIVE,
    fadeOutDur: FAIL_FADE,
  });
  const packetRetry = packetAlong(frame, RETRY_START, RETRY_DUR, PATH_A, A_COLOR);
  if (packetRetry && retryDone) {
    packetRetry.pos = { x: CENTER.db.x, y: CENTER.db.y };
  }

  const nodeFx: Partial<Record<NodeId, NodeFx>> = {
    appb: { dim: 0.38 },
  };
  const markSuccess = (id: NodeId, opacity: number) => {
    const prev = nodeFx[id];
    nodeFx[id] = {
      glow: SUCCESS_COLOR,
      badge: "check",
      badgeOpacity: Math.max(prev?.badgeOpacity ?? 0, opacity),
      dim: prev?.dim,
    };
  };

  if (frame >= FAIL_START && !retrying) {
    for (const id of SUCCESS_ON_FAIL) {
      if (tFail >= PATH_RETRY_FAIL_ARRIVAL[id]) {
        markSuccess(id, badgeFromT(tFail, PATH_RETRY_FAIL_ARRIVAL[id], failArrive));
      }
    }
    if (tFail >= PATH_RETRY_FAIL_ARRIVAL.appa) {
      nodeFx.appa = {
        glow: FAIL_COLOR,
        badge: "x",
        badgeOpacity: badgeFromT(tFail, PATH_RETRY_FAIL_ARRIVAL.appa, failArrive),
      };
    }
  }

  if (retrying) {
    for (const id of PATH_A_NODES) {
      if (tRetry >= PATH_A_ARRIVAL[id]) {
        markSuccess(id, badgeFromT(tRetry, PATH_A_ARRIVAL[id], retryDone));
      }
    }
  }

  if (packetFail && !failArrive) {
    const id = nearestNode(packetFail.pos, PATH_RETRY_FAIL_NODES);
    if (id !== "appa" || !nodeFx.appa?.badge) {
      nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
    }
  }
  if (packetRetry && !retryDone) {
    const id = nearestNode(packetRetry.pos, PATH_A_NODES);
    nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
  }

  const failTrail = interpolate(frame, [RETRY_START - 12, RETRY_START + 18], [0.7, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const overlays: OverlayPath[] = [
    {
      pts: PATH_RETRY_FAIL,
      progress: frame >= FAIL_START ? tFail : 0,
      color: FAIL_COLOR,
      width: 5,
      opacity: failTrail,
    },
    {
      pts: PATH_A,
      progress: retrying ? tRetry : 0,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: retryDone ? 0.88 : 0.78,
    },
  ];

  const resendOpacity = interpolate(frame, [RETRY_START - 8, RETRY_START + 10, RETRY_DONE - 20, RETRY_DONE], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const notes: StageNote[] =
    resendOpacity > 0.02
      ? [
          {
            x: NODE.client.x + CARD_W / 2,
            y: NODE.client.y - 58,
            text: "再送",
            color: A_COLOR,
            opacity: resendOpacity,
          },
        ]
      : [];

  let caption = "同じトポロジで送る";
  if (retryDone) {
    caption = "再送に成功して DB に到達";
  } else if (retrying) {
    caption = "同じ経路で再送する";
  } else if (failArrive) {
    caption = "失敗したので再送する";
  } else if (frame >= FAIL_START && tFail >= PATH_RETRY_FAIL_ARRIVAL.appa) {
    caption = "App A で失敗";
  } else if (frame >= FAIL_START) {
    caption = "1 回目のリクエスト";
  }

  return (
    <IconPathStage
      title="リクエストの流れ（再送）"
      caption={caption}
      packets={[packetFail, packetRetry].filter((item): item is NonNullable<typeof item> => item !== null)}
      nodeFx={nodeFx}
      overlays={overlays}
      notes={notes}
    />
  );
};

export const REQUEST_FLOW_RETRY = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
