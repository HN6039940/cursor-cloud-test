import type { FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  A_COLOR,
  CENTER,
  FPS,
  HEIGHT,
  IconPathStage,
  PATH_A,
  PATH_HIT,
  PATH_HIT_ARRIVAL,
  PATH_HIT_CACHE_T,
  PATH_HIT_NODES,
  PATH_MISS,
  PATH_MISS_ARRIVAL,
  PATH_MISS_NODES,
  FAIL_COLOR,
  SUCCESS_COLOR,
  WIDTH,
  applyArrivalSuccess,
  nearestNode,
  packetAlong,
  packetT,
  type NodeFx,
  type NodeId,
  type OverlayPath,
} from "./iconPathShared";

const MISS_START = 175;
const MISS_DUR = 280;
const MISS_HOLD = 50;
const RESET_START = MISS_START + MISS_DUR + MISS_HOLD;
const RESET_DUR = 70;
const HIT_START = RESET_START + RESET_DUR;
const HIT_DUR = 250;
const HIT_HOLD = 90;
const DURATION = HIT_START + HIT_DUR + HIT_HOLD;
const MISS_SUCCESS_NODES: NodeId[] = PATH_MISS_NODES.filter((id) => id !== "cache");

export const CacheHitMiss: FC = () => {
  const frame = useCurrentFrame();
  const inMiss = frame >= MISS_START && frame < RESET_START;
  const inReset = frame >= RESET_START && frame < HIT_START;
  const inHit = frame >= HIT_START;
  const missDone = frame >= MISS_START + MISS_DUR;
  const hitDone = frame >= HIT_START + HIT_DUR;

  const tMiss = packetT(frame, MISS_START, MISS_DUR);
  const tHit = packetT(frame, HIT_START, HIT_DUR);

  const packetMiss = inMiss
    ? packetAlong(frame, MISS_START, MISS_DUR, PATH_MISS, A_COLOR)
    : null;
  const packetHit = inHit ? packetAlong(frame, HIT_START, HIT_DUR, PATH_HIT, A_COLOR) : null;
  if (packetMiss && missDone) {
    packetMiss.pos = { x: CENTER.db.x, y: CENTER.db.y };
  }
  if (packetHit && hitDone) {
    packetHit.pos = { x: CENTER.appa.x, y: CENTER.appa.y };
  }
  if (packetMiss) {
    packetMiss.scale = 1.25;
  }
  if (packetHit) {
    packetHit.scale = 1.25;
  }

  const nodeFx: Partial<Record<NodeId, NodeFx>> = {
    appb: { dim: 0.38 },
  };

  if (inMiss || (inReset && frame < RESET_START + 24)) {
    applyArrivalSuccess(nodeFx, MISS_SUCCESS_NODES, PATH_MISS_ARRIVAL, tMiss, missDone, {
      status: "success",
    });
    if (tMiss >= PATH_MISS_ARRIVAL.cache) {
      nodeFx.cache = { status: "fail", glow: FAIL_COLOR, dim: nodeFx.cache?.dim };
    }
  }

  if (inHit) {
    nodeFx.db = { dim: 0.32 };
    applyArrivalSuccess(nodeFx, PATH_HIT_NODES, PATH_HIT_ARRIVAL, tHit, hitDone, {
      status: "success",
    });
  }

  const packet = packetHit ?? packetMiss;
  if (packet && inMiss && !missDone) {
    const id = nearestNode(packet.pos, PATH_MISS_NODES);
    if (id === "cache") {
      nodeFx.cache = { ...nodeFx.cache, status: "fail", glow: FAIL_COLOR };
    } else {
      nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
    }
  }
  if (packet && inHit && !hitDone) {
    const id = nearestNode(packet.pos, PATH_HIT_NODES);
    nodeFx[id] = { ...nodeFx[id], glow: A_COLOR };
  }

  const hitReturn =
    inHit && tHit > PATH_HIT_CACHE_T
      ? (tHit - PATH_HIT_CACHE_T) / Math.max(0.001, 1 - PATH_HIT_CACHE_T)
      : 0;

  const overlays: OverlayPath[] = [];
  if (inMiss || inReset) {
    overlays.push({
      pts: PATH_A,
      progress: tMiss,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: inReset ? 0.2 : missDone ? 0.88 : 0.7,
    });
  }
  if (inHit) {
    overlays.push({
      pts: PATH_HIT,
      progress: tHit,
      color: SUCCESS_COLOR,
      width: 5,
      opacity: hitDone ? 0.88 : 0.78,
    });
  }

  let caption = "キャッシュのヒットとミス";
  if (inHit) {
    caption = hitReturn > 0.08 ? "キャッシュヒット → DB に行かない" : "同じ経路で Cache まで進む";
  } else if (inReset) {
    caption = "一度リセットして、ヒットの経路を見る";
  } else if (inMiss) {
    caption = missDone || tMiss >= PATH_MISS_ARRIVAL.cache ? "キャッシュミス → DB へ" : "Cache を確認する";
  }

  const dim = inReset
    ? interpolate(frame, [RESET_START, RESET_START + 12, HIT_START - 10, HIT_START], [1, 0.35, 0.35, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <IconPathStage
      title="キャッシュのヒットとミス"
      caption={caption}
      packets={[packetMiss, packetHit].filter((item): item is NonNullable<typeof item> => item !== null)}
      nodeFx={nodeFx}
      overlays={overlays}
      stageOpacity={dim}
    />
  );
};

export const RequestFlowCacheHitMiss = CacheHitMiss;

export const CACHE_HIT_MISS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;

export const REQUEST_FLOW_CACHE_HIT_MISS = CACHE_HIT_MISS;
