import type { FC } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  FPS,
  HEIGHT,
  nearestNode,
  PATH_HIT,
  PATH_MISS,
  TopologyStage,
  walkPolyline,
  WIDTH,
  type NodeId,
  type PacketView,
} from "./branchCacheShared";

const PACKET = "#7CE7FF";
const MISS_CACHE = "#F07178";
const HIT_CACHE = "#3DDC97";
const MISS_NODES = ["client", "lb", "appa", "cache", "db"] as const;
const HIT_NODES = ["client", "lb", "appa", "cache"] as const;

const MISS_START = 55;
const MISS_DUR = 280;
const MISS_HOLD = 50;
const RESET_START = MISS_START + MISS_DUR + MISS_HOLD;
const RESET_DUR = 70;
const HIT_START = RESET_START + RESET_DUR;
const HIT_DUR = 250;
const HIT_HOLD = 90;
const DURATION = HIT_START + HIT_DUR + HIT_HOLD;

const ease = Easing.inOut(Easing.cubic);

const travel = (
  frame: number,
  start: number,
  duration: number,
  path: typeof PATH_MISS,
): PacketView | null => {
  if (frame < start || frame > start + duration + 36) {
    return null;
  }
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeIn = interpolate(frame, [start, start + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [start + duration + 8, start + duration + 28], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { pos: walkPolyline(path, t), color: PACKET, opacity: fadeIn * fadeOut };
};

export const CacheHitMiss: FC = () => {
  const frame = useCurrentFrame();
  const inMiss = frame >= MISS_START && frame < RESET_START;
  const inReset = frame >= RESET_START && frame < HIT_START;
  const inHit = frame >= HIT_START;

  const packet = inHit
    ? travel(frame, HIT_START, HIT_DUR, PATH_HIT)
    : inMiss
      ? travel(frame, MISS_START, MISS_DUR, PATH_MISS)
      : null;

  const active: Partial<Record<NodeId, string>> = {};
  if (packet && !inReset) {
    const hop = nearestNode(packet.pos, inHit ? HIT_NODES : MISS_NODES);
    if (hop === "cache") {
      active.cache = inHit ? HIT_CACHE : MISS_CACHE;
    } else if (hop === "db") {
      if (!inHit) {
        active.db = "#A78BFA";
      }
    } else {
      active[hop] = PACKET;
    }
  }

  let caption = "キャッシュのヒットとミス";
  if (inHit) {
    caption =
      frame >= HIT_START + HIT_DUR * 0.62
        ? "キャッシュヒット → DB に行かない"
        : "同じ経路で Cache まで進む";
  } else if (inReset) {
    caption = "一度リセットして、ヒットの経路を見る";
  } else if (inMiss) {
    caption =
      frame >= MISS_START + MISS_DUR * 0.55
        ? "キャッシュミス → DB へ"
        : "Cache を確認する";
  }

  const dim = inReset
    ? interpolate(frame, [RESET_START, RESET_START + 12, HIT_START - 10, HIT_START], [1, 0.35, 0.35, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <div style={{ opacity: dim }}>
      <TopologyStage
        labelProgress={interpolate(frame, [0, 34], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        active={active}
        packets={packet ? [packet] : []}
        title="キャッシュのヒットとミス"
        caption={caption}
        titleOpacity={interpolate(frame, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
    </div>
  );
};

export const CACHE_HIT_MISS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
