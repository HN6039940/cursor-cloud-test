import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  BG,
  CLUSTER_ACCENT,
  DANGER_COLOR,
  FONT_FAMILY,
  FPS,
  HEIGHT,
  IDENTITY_CAM,
  IconBadge,
  IconImg,
  MUTED,
  PARTITION_ACCENT,
  PacketDot,
  ScreenCaption,
  SPREAD_ACCENT,
  SUCCESS_COLOR,
  TEXT,
  TEXT_SOFT,
  Txt,
  Vignette,
  WIDTH,
  cameraFocus,
  lerpCam,
  loopT,
  smoothT,
  toD,
  walkPolyline,
  type CameraView,
  type Pt,
} from "./theme";

const CARD_W = 540;
const CARD_H = 640;
const GAP = 48;
const ROW_W = CARD_W * 3 + GAP * 2;
const ROW_LEFT = (WIDTH - ROW_W) / 2;
const CARD_Y = 168;

const BOARD_X = 80;
const BOARD_W = 1760;
const BOARD_H = 700;
const CMP_Y = 1120;

type TypeId = "cluster" | "partition" | "spread";

const TYPES: Record<TypeId, { x: number; y: number; accent: string; icon: string; en: string; jp: string }> = {
  cluster: {
    x: ROW_LEFT,
    y: CARD_Y,
    accent: CLUSTER_ACCENT,
    icon: "icons/zap.svg",
    en: "Cluster",
    jp: "近くに集める",
  },
  partition: {
    x: ROW_LEFT + CARD_W + GAP,
    y: CARD_Y,
    accent: PARTITION_ACCENT,
    icon: "icons/layers.svg",
    en: "Partition",
    jp: "ラックごとに分ける",
  },
  spread: {
    x: ROW_LEFT + (CARD_W + GAP) * 2,
    y: CARD_Y,
    accent: SPREAD_ACCENT,
    icon: "icons/spread.svg",
    en: "Spread",
    jp: "別々の機械へ",
  },
};

const centerOf = (id: TypeId): Pt => ({
  x: TYPES[id].x + CARD_W / 2,
  y: TYPES[id].y + CARD_H / 2 + 20,
});

const CMP_CENTER: Pt = { x: BOARD_X + BOARD_W / 2, y: CMP_Y + BOARD_H / 2 };

const PEAK_TYPE = 1.16;
const PEAK_BOARD = 1.03;

const INTRO = 100;
const ZOOM = 84;
const P_DIAGRAM = 90;
const P_MOTION = 150;
const P_TERM = 120;
const P_DWELL = 180;
const TYPE_HOLD = P_DIAGRAM + P_MOTION + P_TERM + P_DWELL;
const REST = 36;
const CMP_HOLD = TYPE_HOLD;
const OUTRO = 96;

const clusterZoom = INTRO;
const clusterHold = clusterZoom + ZOOM;
const partitionZoom = clusterHold + TYPE_HOLD;
const partitionHold = partitionZoom + ZOOM;
const spreadZoom = partitionHold + TYPE_HOLD;
const spreadHold = spreadZoom + ZOOM;
const overviewZoom = spreadHold + TYPE_HOLD;
const overviewHold = overviewZoom + ZOOM;
const cmpZoom = overviewHold + REST;
const cmpHold = cmpZoom + ZOOM;
const outroZoom = cmpHold + CMP_HOLD;
export const DURATION = outroZoom + ZOOM + OUTRO;

const FOCUS_CLUSTER = cameraFocus(centerOf("cluster"), PEAK_TYPE);
const FOCUS_PARTITION = cameraFocus(centerOf("partition"), PEAK_TYPE);
const FOCUS_SPREAD = cameraFocus(centerOf("spread"), PEAK_TYPE);
const FOCUS_CMP = cameraFocus(CMP_CENTER, PEAK_BOARD);

const cameraAt = (frame: number): CameraView => {
  if (frame < clusterZoom) {
    return IDENTITY_CAM;
  }
  if (frame < clusterHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_CLUSTER, smoothT(frame, clusterZoom, clusterHold));
  }
  if (frame < partitionZoom) {
    return FOCUS_CLUSTER;
  }
  if (frame < partitionHold) {
    return lerpCam(FOCUS_CLUSTER, FOCUS_PARTITION, smoothT(frame, partitionZoom, partitionHold));
  }
  if (frame < spreadZoom) {
    return FOCUS_PARTITION;
  }
  if (frame < spreadHold) {
    return lerpCam(FOCUS_PARTITION, FOCUS_SPREAD, smoothT(frame, spreadZoom, spreadHold));
  }
  if (frame < overviewZoom) {
    return FOCUS_SPREAD;
  }
  if (frame < overviewHold) {
    return lerpCam(FOCUS_SPREAD, IDENTITY_CAM, smoothT(frame, overviewZoom, overviewHold));
  }
  if (frame < cmpZoom) {
    return IDENTITY_CAM;
  }
  if (frame < cmpHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_CMP, smoothT(frame, cmpZoom, cmpHold));
  }
  if (frame < outroZoom) {
    return FOCUS_CMP;
  }
  if (frame < outroZoom + ZOOM) {
    return lerpCam(FOCUS_CMP, IDENTITY_CAM, smoothT(frame, outroZoom, outroZoom + ZOOM));
  }
  return IDENTITY_CAM;
};

const moving = (frame: number) =>
  (frame >= clusterZoom && frame < clusterHold) ||
  (frame >= partitionZoom && frame < partitionHold) ||
  (frame >= spreadZoom && frame < spreadHold) ||
  (frame >= overviewZoom && frame < overviewHold) ||
  (frame >= cmpZoom && frame < cmpHold) ||
  (frame >= outroZoom && frame < outroZoom + ZOOM);

const focusedType = (frame: number): TypeId | null => {
  if (frame >= clusterHold && frame < partitionZoom) {
    return "cluster";
  }
  if (frame >= partitionHold && frame < spreadZoom) {
    return "partition";
  }
  if (frame >= spreadHold && frame < overviewZoom) {
    return "spread";
  }
  return null;
};

const beatLocal = (frame: number, hold: number) => frame - hold;

const beatPhase = (frame: number, hold: number): "diagram" | "motion" | "term" | "dwell" => {
  const t = beatLocal(frame, hold);
  if (t < P_DIAGRAM) {
    return "diagram";
  }
  if (t < P_DIAGRAM + P_MOTION) {
    return "motion";
  }
  if (t < P_DIAGRAM + P_MOTION + P_TERM) {
    return "term";
  }
  return "dwell";
};

const captionFor = (frame: number): { kicker: string; line: string } => {
  if (frame < clusterHold) {
    return { kicker: "Placement Groups", line: "Cluster / Partition / Spread" };
  }
  const clusterPhase = beatPhase(frame, clusterHold);
  if (frame < partitionZoom) {
    if (clusterPhase === "diagram") {
      return { kicker: "Cluster", line: "Region のなかの 1 AZ" };
    }
    if (clusterPhase === "motion") {
      return { kicker: "Cluster", line: "通信が隣のインスタンスへ走る" };
    }
    return { kicker: "Cluster", line: "近くに集める。速い。一緒に落ちる。" };
  }
  const partitionPhase = beatPhase(frame, partitionHold);
  if (frame < spreadZoom) {
    if (partitionPhase === "diagram") {
      return { kicker: "Partition", line: "Region を AZ とラックに分ける" };
    }
    if (partitionPhase === "motion") {
      return { kicker: "Partition", line: "同じラックの中で通信が回る" };
    }
    return { kicker: "Partition", line: "ラックごとに分ける。片方の障害は他に広がらない。" };
  }
  const spreadPhase = beatPhase(frame, spreadHold);
  if (frame < overviewZoom) {
    if (spreadPhase === "diagram") {
      return { kicker: "Spread", line: "Region の複数 AZ へ散らす" };
    }
    if (spreadPhase === "motion") {
      return { kicker: "Spread", line: "離れた機械のあいだを通信が渡る" };
    }
    return { kicker: "Spread", line: "別々の機械へ。1台落ちても他は生きる。" };
  }
  if (frame < cmpHold) {
    return { kicker: "3 類型", line: "Cluster / Partition / Spread" };
  }
  const cmpPhase = beatPhase(frame, cmpHold);
  if (cmpPhase === "diagram") {
    return { kicker: "比べる", line: "3 つの置き方を並べる" };
  }
  if (cmpPhase === "motion") {
    return { kicker: "比べる", line: "障害の広がりが違う" };
  }
  return { kicker: "比べる", line: "速さ / ラックの隔離 / 機械の隔離" };
};

const InstanceChip: FC<{
  x?: number;
  y?: number;
  glow?: boolean;
  accent?: string;
  size?: number;
  opacity?: number;
  absolute?: boolean;
}> = ({
  x = 0,
  y = 0,
  glow = false,
  accent = CLUSTER_ACCENT,
  size = 44,
  opacity = 1,
  absolute = true,
}) => (
  <div
    style={{
      position: absolute ? "absolute" : "relative",
      left: absolute ? x : undefined,
      top: absolute ? y : undefined,
      width: size,
      height: size,
      borderRadius: 10,
      background: "linear-gradient(180deg, #1E2A40 0%, #151C2C 100%)",
      border: glow ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
      boxShadow: glow ? `0 0 14px ${accent}88` : "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      flexShrink: 0,
    }}
  >
    <IconImg file="icons/server.svg" size={Math.round(size * 0.5)} />
  </div>
);

const AzFrame: FC<{
  label: string;
  width: number;
  height: number;
  accent: string;
  children?: ReactNode;
  empty?: boolean;
}> = ({ label, width, height, accent, children, empty = false }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      borderRadius: 14,
      border: empty ? `1.5px dashed ${MUTED}66` : `1.5px dashed ${accent}99`,
      background: empty ? "rgba(255,255,255,0.02)" : `${accent}10`,
      boxSizing: "border-box",
      padding: 8,
    }}
  >
    <Txt
      style={{
        position: "absolute",
        top: -10,
        left: 10,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: empty ? MUTED : accent,
        background: "#151C2C",
        padding: "0 7px",
      }}
    >
      {label}
    </Txt>
    {children}
  </div>
);

const RegionFrame: FC<{ width: number; height: number; children?: ReactNode }> = ({ width, height, children }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      borderRadius: 16,
      border: "1.5px solid rgba(155,184,220,0.38)",
      background: "rgba(12, 18, 32, 0.55)",
      boxSizing: "border-box",
      padding: "14px 10px 10px",
    }}
  >
    <Txt
      style={{
        position: "absolute",
        top: -10,
        left: 12,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: MUTED,
        background: "#151C2C",
        padding: "0 8px",
      }}
    >
      Region
    </Txt>
    {children}
  </div>
);

const FlowPath: FC<{ pts: Pt[]; color: string; opacity: number }> = ({ pts, color, opacity }) => (
  <path
    d={toD(pts)}
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
  />
);

const chipCenter = (col: number, row: number): Pt => ({
  x: 24 + col * 52 + 20,
  y: 40 + row * 52 + 20,
});

const CLUSTER_LOOP: Pt[] = [
  chipCenter(0, 0),
  chipCenter(1, 0),
  chipCenter(2, 0),
  chipCenter(2, 1),
  chipCenter(1, 1),
  chipCenter(0, 1),
  chipCenter(0, 0),
];
const CLUSTER_CROSS: Pt[] = [chipCenter(0, 0), chipCenter(2, 1)];

const ClusterBody: FC<{ frame: number }> = ({ frame }) => {
  const phase = beatPhase(frame, clusterHold);
  const fail = smoothT(frame, clusterHold + P_DIAGRAM + P_MOTION - 50, clusterHold + P_DIAGRAM + P_MOTION + 10);
  const live = 1 - fail;
  const trafficOn = phase !== "diagram";
  const t1 = loopT(frame, clusterHold + P_DIAGRAM, 56);
  const t2 = loopT(frame, clusterHold + P_DIAGRAM + 12, 70);
  const p1 = walkPolyline(CLUSTER_LOOP, t1);
  const p2 = walkPolyline(CLUSTER_CROSS, t2);
  const accent = fail > 0.45 ? DANGER_COLOR : CLUSTER_ACCENT;
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <RegionFrame width={484} height={318}>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <AzFrame label="AZ-a" width={292} height={276} accent={accent}>
            <div
              style={{
                marginTop: 16,
                marginLeft: 8,
                width: 260,
                height: 236,
                borderRadius: 12,
                background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
                border: `1px solid ${accent}55`,
                position: "relative",
              }}
            >
              <Txt
                style={{
                  position: "absolute",
                  top: 8,
                  left: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: "0.12em",
                }}
              >
                RACK
              </Txt>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                return (
                  <InstanceChip
                    key={i}
                    x={24 + col * 52}
                    y={40 + row * 52}
                    glow={live > 0.5}
                    accent={accent}
                    size={40}
                    opacity={1}
                  />
                );
              })}
              <svg width={260} height={236} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <FlowPath pts={CLUSTER_LOOP} color={accent} opacity={0.35 * live * (trafficOn ? 1 : 0.2)} />
                <FlowPath pts={CLUSTER_CROSS} color={accent} opacity={0.25 * live * (trafficOn ? 1 : 0.2)} />
              </svg>
              {trafficOn ? <PacketDot x={p1.x} y={p1.y} color={accent} opacity={live} /> : null}
              {trafficOn ? <PacketDot x={p2.x} y={p2.y} color={accent} opacity={live * 0.9} size={12} /> : null}
            </div>
          </AzFrame>
          <AzFrame label="AZ-b" width={154} height={276} accent={MUTED} empty>
            <Txt
              style={{
                marginTop: 88,
                textAlign: "center",
                fontSize: 15,
                fontWeight: 700,
                color: MUTED,
              }}
            >
              使わない
            </Txt>
          </AzFrame>
        </div>
      </RegionFrame>
      <Txt
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: fail > 0.45 ? DANGER_COLOR : TEXT_SOFT,
          opacity: phase === "diagram" ? 0 : 1,
        }}
      >
        {fail > 0.45 ? "ラックが落ちると、全部止まる" : "通信はすぐ隣へ届く"}
      </Txt>
    </div>
  );
};

const partChip = (col: number, row: number): Pt => ({
  x: 18 + col * 52 + 18,
  y: 34 + row * 52 + 18,
});

const PART_LOOP: Pt[] = [partChip(0, 0), partChip(1, 0), partChip(1, 1), partChip(0, 1), partChip(0, 0)];

const PartitionRack: FC<{
  id: string;
  width: number;
  dead: number;
  trafficOn: boolean;
  frame: number;
  delay: number;
}> = ({ id, width, dead, trafficOn, frame, delay }) => {
  const accent = dead > 0.45 ? DANGER_COLOR : PARTITION_ACCENT;
  const t = loopT(frame, partitionHold + P_DIAGRAM + delay, 64);
  const pkt = walkPolyline(PART_LOOP, t);
  return (
    <div
      style={{
        width,
        height: 236,
        borderRadius: 12,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: `1px solid ${accent}66`,
        position: "relative",
        opacity: 1 - dead * 0.25,
      }}
    >
      <Txt
        style={{
          textAlign: "center",
          marginTop: 6,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: dead > 0.45 ? DANGER_COLOR : MUTED,
        }}
      >
        {id}
      </Txt>
      <InstanceChip x={18} y={34} accent={accent} glow={dead < 0.45} size={36} />
      <InstanceChip x={70} y={34} accent={accent} glow={dead < 0.45} size={36} />
      <InstanceChip x={18} y={86} accent={accent} size={36} />
      <InstanceChip x={70} y={86} accent={accent} size={36} />
      <svg width={width} height={236} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <FlowPath pts={PART_LOOP} color={accent} opacity={0.35 * (1 - dead) * (trafficOn ? 1 : 0.2)} />
      </svg>
      {trafficOn ? <PacketDot x={pkt.x} y={pkt.y} color={accent} opacity={1 - dead} size={11} /> : null}
      {id === "B" ? (
        <div style={{ position: "absolute", right: 6, bottom: 8, opacity: dead }}>
          <IconImg file="icons/x.svg" size={18} />
        </div>
      ) : null}
    </div>
  );
};

const PartitionBody: FC<{ frame: number }> = ({ frame }) => {
  const phase = beatPhase(frame, partitionHold);
  const fail = smoothT(frame, partitionHold + P_DIAGRAM + P_MOTION - 50, partitionHold + P_DIAGRAM + P_MOTION + 10);
  const trafficOn = phase !== "diagram";
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <RegionFrame width={484} height={318}>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <AzFrame label="AZ-a" width={292} height={276} accent={PARTITION_ACCENT}>
            <div style={{ display: "flex", gap: 8, marginTop: 16, marginLeft: 4 }}>
              <PartitionRack id="A" width={128} dead={0} trafficOn={trafficOn} frame={frame} delay={0} />
              <PartitionRack id="B" width={128} dead={fail} trafficOn={trafficOn} frame={frame} delay={12} />
            </div>
          </AzFrame>
          <AzFrame label="AZ-b" width={154} height={276} accent={PARTITION_ACCENT}>
            <div style={{ marginTop: 16, marginLeft: 6 }}>
              <PartitionRack id="C" width={128} dead={0} trafficOn={trafficOn} frame={frame} delay={24} />
            </div>
          </AzFrame>
        </div>
      </RegionFrame>
      <Txt
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: fail > 0.45 ? TEXT_SOFT : TEXT_SOFT,
          opacity: phase === "diagram" ? 0 : 1,
        }}
      >
        {fail > 0.45 ? "B だけ止まる。A と C は動き続ける" : "通信は同じラックの中で回る"}
      </Txt>
    </div>
  );
};

const SPREAD_PTS: Pt[] = [
  { x: 132, y: 84 },
  { x: 132, y: 156 },
  { x: 132, y: 228 },
  { x: 369, y: 84 },
  { x: 369, y: 156 },
];
const SPREAD_HOP_A: Pt[] = [SPREAD_PTS[0], SPREAD_PTS[1], SPREAD_PTS[2]];
const SPREAD_HOP_B: Pt[] = [SPREAD_PTS[0], SPREAD_PTS[3], SPREAD_PTS[4]];

const SpreadBody: FC<{ frame: number }> = ({ frame }) => {
  const phase = beatPhase(frame, spreadHold);
  const fail = smoothT(frame, spreadHold + P_DIAGRAM + P_MOTION - 50, spreadHold + P_DIAGRAM + P_MOTION + 10);
  const trafficOn = phase !== "diagram";
  const tA = loopT(frame, spreadHold + P_DIAGRAM, 90);
  const tB = loopT(frame, spreadHold + P_DIAGRAM + 18, 110);
  const pA = walkPolyline(SPREAD_HOP_A, tA);
  const pB = walkPolyline(SPREAD_HOP_B, tB);
  const rack2Dead = fail;
  const machine = (i: number, dead: number) => {
    const accent = dead > 0.45 ? DANGER_COLOR : SPREAD_ACCENT;
    return (
      <div
        key={i}
        style={{
          marginTop: i === 0 ? 22 : 8,
          marginLeft: 8,
          width: 196,
          height: 64,
          borderRadius: 10,
          background: "#101828",
          border: `1px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          gap: 12,
          opacity: 1 - dead * 0.35,
        }}
      >
        <Txt style={{ fontSize: 13, color: MUTED, width: 64, fontWeight: 700 }}>機械 {i + 1}</Txt>
        <InstanceChip accent={accent} glow={dead < 0.45} size={36} absolute={false} />
        {dead > 0.4 ? <IconImg file="icons/x.svg" size={18} /> : null}
      </div>
    );
  };
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <RegionFrame width={484} height={318}>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <AzFrame label="AZ-a" width={227} height={276} accent={SPREAD_ACCENT}>
            {[0, 1, 2].map((i) => machine(i, i === 1 ? rack2Dead : 0))}
          </AzFrame>
          <AzFrame label="AZ-b" width={227} height={276} accent={SPREAD_ACCENT}>
            {[0, 1].map((i) => machine(i, 0))}
          </AzFrame>
        </div>
        <svg
          width={484}
          height={318}
          style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}
        >
          <FlowPath
            pts={SPREAD_HOP_A}
            color={SPREAD_ACCENT}
            opacity={0.28 * (1 - rack2Dead * 0.5) * (trafficOn ? 1 : 0.2)}
          />
          <FlowPath pts={SPREAD_HOP_B} color={SPREAD_ACCENT} opacity={0.28 * (trafficOn ? 1 : 0.2)} />
        </svg>
        {trafficOn ? (
          <PacketDot x={pA.x} y={pA.y} color={SPREAD_ACCENT} opacity={1 - rack2Dead * 0.7} size={12} />
        ) : null}
        {trafficOn ? <PacketDot x={pB.x} y={pB.y} color={SPREAD_ACCENT} opacity={1} size={12} /> : null}
      </RegionFrame>
      <Txt
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: TEXT_SOFT,
          opacity: phase === "diagram" ? 0 : 1,
        }}
      >
        {fail > 0.45 ? "1 台落ちても、ほかは届き続ける" : "通信は離れた機械のあいだを渡る"}
      </Txt>
    </div>
  );
};

const TypeCard: FC<{
  id: TypeId;
  focused: boolean;
  dim: number;
  appear: number;
  frame: number;
}> = ({ id, focused, dim, appear, frame }) => {
  const type = TYPES[id];
  return (
    <div
      style={{
        position: "absolute",
        left: type.x,
        top: type.y + (1 - appear) * 10,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 22,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: focused ? `2px solid ${type.accent}` : "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: focused
          ? `0 0 0 5px ${type.accent}33, 0 0 28px ${type.accent}55, 0 18px 40px rgba(0,0,0,0.32)`
          : "0 18px 40px rgba(0,0,0,0.28)",
        opacity: appear * dim,
        overflow: "hidden",
        padding: "0 28px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "calc(100% + 56px)",
          marginLeft: -28,
          height: 6,
          background: type.accent,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, marginBottom: 14 }}>
        <IconBadge file={type.icon} accent={focused ? type.accent : undefined} />
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.12em", color: MUTED, fontWeight: 600 }}>{type.jp}</Txt>
          <Txt style={{ fontSize: 30, fontWeight: 700, color: TEXT, letterSpacing: "0.03em" }}>{type.en}</Txt>
        </div>
      </div>
      {id === "cluster" ? <ClusterBody frame={frame} /> : null}
      {id === "partition" ? <PartitionBody frame={frame} /> : null}
      {id === "spread" ? <SpreadBody frame={frame} /> : null}
    </div>
  );
};

const ComparisonBoard: FC<{ frame: number }> = ({ frame }) => {
  const show = smoothT(frame, cmpHold, cmpHold + 36);
  const phase = beatPhase(frame, cmpHold);
  const fail = smoothT(frame, cmpHold + P_DIAGRAM, cmpHold + P_DIAGRAM + 50);
  const cols = [
    { title: "Cluster", accent: CLUSTER_ACCENT, line: "一緒に落ちる", hint: "速さ" },
    { title: "Partition", accent: PARTITION_ACCENT, line: "一部だけ落ちる", hint: "ラックの隔離" },
    { title: "Spread", accent: SPREAD_ACCENT, line: "1 台だけ落ちる", hint: "機械の隔離" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: BOARD_X,
        top: CMP_Y,
        width: BOARD_W,
        height: BOARD_H,
        borderRadius: 24,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        opacity: Math.max(0.4, show),
        padding: "32px 36px",
        boxSizing: "border-box",
      }}
    >
      <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600, marginBottom: 8 }}>
        障害の広がり
      </Txt>
      <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 28 }}>目で追う 3 つの違い</Txt>
      <div style={{ display: "flex", gap: 20 }}>
        {cols.map((col, index) => (
          <div
            key={col.title}
            style={{
              flex: 1,
              height: 480,
              borderRadius: 20,
              background: "linear-gradient(180deg, #182236 0%, #121A2B 100%)",
              border: `1.5px solid ${col.accent}55`,
              padding: 24,
              boxSizing: "border-box",
              opacity: smoothT(frame, cmpHold + 20 + index * 28, cmpHold + 70 + index * 28),
            }}
          >
            <IconBadge
              file={index === 0 ? "icons/zap.svg" : index === 1 ? "icons/layers.svg" : "icons/spread.svg"}
              size={52}
              accent={col.accent}
            />
            <Txt style={{ marginTop: 16, fontSize: 14, letterSpacing: "0.14em", color: col.accent, fontWeight: 700 }}>
              {col.hint}
            </Txt>
            <Txt style={{ marginTop: 8, fontSize: 28, fontWeight: 700, color: TEXT }}>{col.title}</Txt>
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {[0, 1, 2].map((i) => {
                const wouldFail = index === 0 || (index === 1 && i === 1) || (index === 2 && i === 0);
                const dead = wouldFail && phase !== "diagram" && fail > 0.45;
                return (
                  <div
                    key={i}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      background: "#101828",
                      border: `1.5px solid ${dead ? DANGER_COLOR : SUCCESS_COLOR}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: dead ? `0 0 12px ${DANGER_COLOR}44` : `0 0 12px ${SUCCESS_COLOR}33`,
                    }}
                  >
                    <IconImg file={dead ? "icons/x.svg" : "icons/server.svg"} size={28} />
                  </div>
                );
              })}
            </div>
            <Txt style={{ marginTop: 28, fontSize: 22, fontWeight: 700, color: TEXT_SOFT }}>{col.line}</Txt>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Ec2PlacementGroups: FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const focused = focusedType(frame);
  const zoomed = cam.scale > 1.02;
  const titleOpacity =
    interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (zoomed ? 0 : 1);
  const cardsAppear = smoothT(frame, 8, 56);
  const caption = captionFor(frame);
  const captionOpacity =
    interpolate(frame, [0, 16, DURATION - 20, DURATION], [0, 1, 1, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * (moving(frame) ? 0.55 : 1);

  const dimFor = (id: TypeId) => {
    if (!focused) {
      return 1;
    }
    return focused === id ? 1 : 0.42;
  };

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT_FAMILY, overflow: "hidden" }}>
      <Vignette />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <TypeCard id="cluster" focused={focused === "cluster"} dim={dimFor("cluster")} appear={cardsAppear} frame={frame} />
        <TypeCard
          id="partition"
          focused={focused === "partition"}
          dim={dimFor("partition")}
          appear={cardsAppear}
          frame={frame}
        />
        <TypeCard id="spread" focused={focused === "spread"} dim={dimFor("spread")} appear={cardsAppear} frame={frame} />
        <ComparisonBoard frame={frame} />
      </div>

      <Txt
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 42,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: "0.06em",
          opacity: titleOpacity,
        }}
      >
        EC2 Placement Groups
      </Txt>
      <Txt
        style={{
          position: "absolute",
          top: 96,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 18,
          fontWeight: 500,
          color: MUTED,
          letterSpacing: "0.16em",
          opacity: titleOpacity,
        }}
      >
        Cluster · Partition · Spread
      </Txt>

      <ScreenCaption kicker={caption.kicker} line={caption.line} opacity={captionOpacity} />
    </AbsoluteFill>
  );
};

export const EC2_PLACEMENT_GROUPS = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
