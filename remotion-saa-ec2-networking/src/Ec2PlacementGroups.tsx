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
  ScreenCaption,
  SPREAD_ACCENT,
  SUCCESS_COLOR,
  TEXT,
  TEXT_SOFT,
  Tag,
  Txt,
  Vignette,
  WARN_COLOR,
  WIDTH,
  cameraFocus,
  lerpCam,
  linearT,
  type CameraView,
  type Pt,
} from "./theme";

const CARD_W = 540;
const CARD_H = 640;
const GAP = 48;
const ROW_W = CARD_W * 3 + GAP * 2;
const ROW_LEFT = (WIDTH - ROW_W) / 2;
const CARD_Y = 168;

const BOARD_X = 70;
const BOARD_W = 1780;
const BOARD_H = 740;
const CMP_Y = 1180;
const EXAM_Y = 2060;

type TypeId = "cluster" | "partition" | "spread";

const TYPES: Record<TypeId, { x: number; y: number; accent: string; icon: string; en: string; jp: string }> = {
  cluster: {
    x: ROW_LEFT,
    y: CARD_Y,
    accent: CLUSTER_ACCENT,
    icon: "icons/zap.svg",
    en: "Cluster",
    jp: "性能・近傍配置",
  },
  partition: {
    x: ROW_LEFT + CARD_W + GAP,
    y: CARD_Y,
    accent: PARTITION_ACCENT,
    icon: "icons/layers.svg",
    en: "Partition",
    jp: "ラック隔離",
  },
  spread: {
    x: ROW_LEFT + (CARD_W + GAP) * 2,
    y: CARD_Y,
    accent: SPREAD_ACCENT,
    icon: "icons/spread.svg",
    en: "Spread",
    jp: "ハード隔離",
  },
};

const centerOf = (id: TypeId): Pt => ({
  x: TYPES[id].x + CARD_W / 2,
  y: TYPES[id].y + CARD_H / 2,
});

const CMP_CENTER: Pt = { x: BOARD_X + BOARD_W / 2, y: CMP_Y + BOARD_H / 2 };
const EXAM_CENTER: Pt = { x: BOARD_X + BOARD_W / 2, y: EXAM_Y + BOARD_H / 2 };

const PEAK_TYPE = 1.52;
const PEAK_BOARD = 1.05;

const INTRO = 90;
const ZOOM = 30;
const TYPE_HOLD = 510;
const OVERVIEW_HOLD = 48;
const CMP_HOLD = 570;
const EXAM_HOLD = 630;
const OUTRO = 150;

const clusterZoom = INTRO;
const clusterHold = clusterZoom + ZOOM;
const partitionZoom = clusterHold + TYPE_HOLD;
const partitionHold = partitionZoom + ZOOM;
const spreadZoom = partitionHold + TYPE_HOLD;
const spreadHold = spreadZoom + ZOOM;
const overviewZoom = spreadHold + TYPE_HOLD;
const overviewHold = overviewZoom + ZOOM;
const cmpZoom = overviewHold + OVERVIEW_HOLD;
const cmpHold = cmpZoom + ZOOM;
const examZoom = cmpHold + CMP_HOLD;
const examHold = examZoom + ZOOM;
const outroZoom = examHold + EXAM_HOLD;
export const DURATION = outroZoom + ZOOM + OUTRO;

const FOCUS_CLUSTER = cameraFocus(centerOf("cluster"), PEAK_TYPE);
const FOCUS_PARTITION = cameraFocus(centerOf("partition"), PEAK_TYPE);
const FOCUS_SPREAD = cameraFocus(centerOf("spread"), PEAK_TYPE);
const FOCUS_CMP = cameraFocus(CMP_CENTER, PEAK_BOARD);
const FOCUS_EXAM = cameraFocus(EXAM_CENTER, PEAK_BOARD);

const cameraAt = (frame: number): CameraView => {
  if (frame < clusterZoom) {
    return IDENTITY_CAM;
  }
  if (frame < clusterHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_CLUSTER, linearT(frame, clusterZoom, clusterHold));
  }
  if (frame < partitionZoom) {
    return FOCUS_CLUSTER;
  }
  if (frame < partitionHold) {
    return lerpCam(FOCUS_CLUSTER, FOCUS_PARTITION, linearT(frame, partitionZoom, partitionHold));
  }
  if (frame < spreadZoom) {
    return FOCUS_PARTITION;
  }
  if (frame < spreadHold) {
    return lerpCam(FOCUS_PARTITION, FOCUS_SPREAD, linearT(frame, spreadZoom, spreadHold));
  }
  if (frame < overviewZoom) {
    return FOCUS_SPREAD;
  }
  if (frame < overviewHold) {
    return lerpCam(FOCUS_SPREAD, IDENTITY_CAM, linearT(frame, overviewZoom, overviewHold));
  }
  if (frame < cmpZoom) {
    return IDENTITY_CAM;
  }
  if (frame < cmpHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_CMP, linearT(frame, cmpZoom, cmpHold));
  }
  if (frame < examZoom) {
    return FOCUS_CMP;
  }
  if (frame < examHold) {
    return lerpCam(FOCUS_CMP, FOCUS_EXAM, linearT(frame, examZoom, examHold));
  }
  if (frame < outroZoom) {
    return FOCUS_EXAM;
  }
  if (frame < outroZoom + ZOOM) {
    return lerpCam(FOCUS_EXAM, IDENTITY_CAM, linearT(frame, outroZoom, outroZoom + ZOOM));
  }
  return IDENTITY_CAM;
};

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

const captionFor = (frame: number): { kicker: string; line: string } => {
  if (frame < clusterZoom) {
    return { kicker: "SAA · EC2", line: "Placement Groups — 置き方で性能と障害ドメインが変わる" };
  }
  if (frame < clusterHold + 160) {
    return { kicker: "Cluster", line: "同一 AZ の近傍に詰める。目的は低レイテンシと高パケットレート" };
  }
  if (frame < clusterHold + 340) {
    return { kicker: "Cluster · 使う", line: "HPC / MPI など密結合。10Gbps+ と短いホップがほしいとき" };
  }
  if (frame < partitionZoom) {
    return { kicker: "Cluster · 使わない", line: "単一 AZ。相関障害。高可用性の設計には使わない。同時起動が安全" };
  }
  if (frame < partitionHold + 160) {
    return { kicker: "Partition", line: "ラック単位の論理パーティション。複製を別パーティションへ" };
  }
  if (frame < partitionHold + 340) {
    return { kicker: "Partition · 使う", line: "Hadoop / Kafka / Cassandra。ラック障害をパーティションに閉じる" };
  }
  if (frame < spreadZoom) {
    return { kicker: "Partition · 制約", line: "1 AZ あたり最大 7 パーティション。AZ またぎ可" };
  }
  if (frame < spreadHold + 160) {
    return { kicker: "Spread", line: "インスタンスを別ハードウェアへ厳密配置。同時被災を避ける" };
  }
  if (frame < spreadHold + 340) {
    return { kicker: "Spread · 使う", line: "少数の重要ノード（DNS / AD / コントローラ）。小さい HA" };
  }
  if (frame < overviewZoom) {
    return { kicker: "Spread · 制約", line: "実行中は 1 AZ あたり最大 7 台。AZ またぎ可（× AZ 数）" };
  }
  if (frame < cmpZoom) {
    return { kicker: "3 類型", line: "性能 / ラック隔離 / ハード隔離 — 目的から逆引きする" };
  }
  if (frame < cmpHold + 280) {
    return { kicker: "比較", line: "試験は「何を守りたいか」で選ぶ。性能≠可用性" };
  }
  if (frame < examZoom) {
    return { kicker: "比較", line: "Cluster=単一AZ · Partition=7 partitions/AZ · Spread=7 instances/AZ" };
  }
  if (frame < examHold + 200) {
    return { kicker: "試験ポイント", line: "AZ 認識：Cluster だけ単一。他は複数 AZ に広げられる" };
  }
  if (frame < examHold + 400) {
    return { kicker: "試験ポイント", line: "台数の直観：Spread は少数、Partition は大規模分散、Cluster は容量次第" };
  }
  if (frame < outroZoom) {
    return { kicker: "ユースケース対応", line: "HPC→Cluster / 分散基盤→Partition / 少数の重要ノード→Spread" };
  }
  return { kicker: "SAA · まとめ", line: "Placement Group は性能と障害ドメインのトレードオフ" };
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
}> = ({ label, width, height, accent, children }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      borderRadius: 16,
      border: `1.5px dashed ${accent}99`,
      background: `${accent}10`,
      boxSizing: "border-box",
      padding: 10,
    }}
  >
    <Txt
      style={{
        position: "absolute",
        top: -11,
        left: 14,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: accent,
        background: "#151C2C",
        padding: "0 8px",
      }}
    >
      {label}
    </Txt>
    {children}
  </div>
);

const ClusterBody: FC<{ frame: number }> = ({ frame }) => {
  const t = Math.max(linearT(frame, 24, 80), linearT(frame, clusterHold, clusterHold + 90));
  const pulse = 0.45 + 0.55 * Math.abs(((frame - clusterHold) % 48) / 24 - 1);
  const showDont = linearT(frame, clusterHold + 280, clusterHold + 340);
  const chips = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <AzFrame label="AZ · 単一のみ" width={484} height={248} accent={CLUSTER_ACCENT}>
        <div
          style={{
            marginTop: 18,
            marginLeft: 10,
            width: 300,
            height: 196,
            borderRadius: 12,
            background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
            border: `1px solid ${CLUSTER_ACCENT}55`,
            position: "relative",
          }}
        >
          <Txt
            style={{
              position: "absolute",
              top: 8,
              left: 12,
              fontSize: 13,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: "0.12em",
            }}
          >
            RACK
          </Txt>
          {chips.map((i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const appear = Math.max(
              linearT(frame, 20 + i * 5, 44 + i * 5),
              linearT(frame, clusterHold + 8 + i * 10, clusterHold + 28 + i * 10),
            );
            return (
              <InstanceChip
                key={i}
                x={24 + col * 56}
                y={40 + row * 56}
                glow={t > 0.4}
                accent={CLUSTER_ACCENT}
                opacity={appear}
              />
            );
          })}
          <svg
            width={90}
            height={120}
            style={{ position: "absolute", right: 18, top: 40, opacity: t * pulse }}
          >
            <path
              d="M10 20 H70 M10 60 H70 M10 100 H70"
              fill="none"
              stroke={CLUSTER_ACCENT}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ position: "absolute", right: 16, top: 52, width: 140 }}>
          <Txt style={{ fontSize: 13, color: MUTED, letterSpacing: "0.1em", fontWeight: 700 }}>INTENT</Txt>
          <Txt style={{ fontSize: 20, color: TEXT, fontWeight: 700, marginTop: 4 }}>低レイテンシ</Txt>
          <Txt style={{ fontSize: 16, color: CLUSTER_ACCENT, fontWeight: 700, marginTop: 2 }}>高 PPS</Txt>
        </div>
      </AzFrame>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Tag label="HPC / MPI" accent={CLUSTER_ACCENT} />
        <Tag label="密結合" accent={CLUSTER_ACCENT} />
        <Tag label="同時起動が安全" accent={WARN_COLOR} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, opacity: showDont }}>
        <Tag label="✕ 高可用性" accent={DANGER_COLOR} />
        <Tag label="✕ マルチ AZ" accent={DANGER_COLOR} />
      </div>
    </div>
  );
};

const PartitionBody: FC<{ frame: number }> = ({ frame }) => {
  const fail = linearT(frame, partitionHold + 220, partitionHold + 280);
  const parts = [
    { id: "P0", accent: PARTITION_ACCENT, fail: false },
    { id: "P1", accent: DANGER_COLOR, fail: true },
    { id: "P2", accent: PARTITION_ACCENT, fail: false },
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <AzFrame label="AZ · またぎ可" width={484} height={248} accent={PARTITION_ACCENT}>
        <div style={{ display: "flex", gap: 10, marginTop: 22, marginLeft: 8 }}>
          {parts.map((part, index) => {
            const appear = Math.max(
              linearT(frame, 22 + index * 8, 50 + index * 8),
              linearT(frame, partitionHold + 10 + index * 18, partitionHold + 40 + index * 18),
            );
            const dim = part.fail ? 1 - fail * 0.55 : 1;
            return (
              <div
                key={part.id}
                style={{
                  width: 142,
                  height: 188,
                  borderRadius: 12,
                  background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
                  border: part.fail && fail > 0.4 ? `1.5px solid ${DANGER_COLOR}` : `1px solid ${PARTITION_ACCENT}55`,
                  opacity: appear * dim,
                  position: "relative",
                }}
              >
                <Txt
                  style={{
                    textAlign: "center",
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: part.fail && fail > 0.4 ? DANGER_COLOR : MUTED,
                  }}
                >
                  {part.id}
                </Txt>
                <InstanceChip x={22} y={44} accent={part.fail ? DANGER_COLOR : PARTITION_ACCENT} glow={!part.fail} />
                <InstanceChip x={76} y={44} accent={part.fail ? DANGER_COLOR : PARTITION_ACCENT} glow={!part.fail} />
                <InstanceChip x={22} y={100} accent={part.fail ? DANGER_COLOR : PARTITION_ACCENT} />
                <InstanceChip x={76} y={100} accent={part.fail ? DANGER_COLOR : PARTITION_ACCENT} />
                {part.fail ? (
                  <div style={{ position: "absolute", right: 8, bottom: 8, opacity: fail }}>
                    <IconImg file="icons/x.svg" size={22} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </AzFrame>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Tag label="Hadoop / Kafka" accent={PARTITION_ACCENT} />
        <Tag label="Cassandra" accent={PARTITION_ACCENT} />
        <Tag label="7 partitions / AZ" accent={WARN_COLOR} />
      </div>
      <Txt style={{ marginTop: 12, fontSize: 16, color: TEXT_SOFT, fontWeight: 600 }}>
        ラック障害は 1 パーティションに閉じる
      </Txt>
    </div>
  );
};

const SpreadBody: FC<{ frame: number }> = ({ frame }) => {
  const a = Math.max(linearT(frame, 24, 70), linearT(frame, spreadHold + 8, spreadHold + 70));
  const b = Math.max(linearT(frame, 40, 90), linearT(frame, spreadHold + 50, spreadHold + 110));
  return (
    <div style={{ position: "relative", width: "100%", height: 430 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <AzFrame label="AZ-a · max 7" width={236} height={248} accent={SPREAD_ACCENT}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                marginTop: i === 0 ? 22 : 8,
                marginLeft: 8,
                width: 204,
                height: 54,
                borderRadius: 10,
                background: "#101828",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                gap: 10,
                opacity: Math.max(
                  linearT(frame, 24 + i * 10, 50 + i * 10),
                  linearT(frame, spreadHold + 12 + i * 16, spreadHold + 36 + i * 16),
                ),
              }}
            >
              <Txt style={{ fontSize: 12, color: MUTED, width: 52, fontWeight: 700 }}>RACK {i + 1}</Txt>
              <InstanceChip accent={SPREAD_ACCENT} glow={a > 0.5} size={36} absolute={false} />
            </div>
          ))}
        </AzFrame>
        <AzFrame label="AZ-b · max 7" width={236} height={248} accent={SPREAD_ACCENT}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                marginTop: i === 0 ? 22 : 8,
                marginLeft: 8,
                width: 204,
                height: 54,
                borderRadius: 10,
                background: "#101828",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                gap: 10,
                opacity: Math.max(linearT(frame, 40 + i * 10, 70 + i * 10), b),
              }}
            >
              <Txt style={{ fontSize: 12, color: MUTED, width: 52, fontWeight: 700 }}>RACK {i + 1}</Txt>
              <InstanceChip accent={SPREAD_ACCENT} glow={b > 0.5} size={36} absolute={false} />
            </div>
          ))}
        </AzFrame>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Tag label="DNS / AD" accent={SPREAD_ACCENT} />
        <Tag label="重要ノード" accent={SPREAD_ACCENT} />
        <Tag label="7 running / AZ" accent={WARN_COLOR} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Tag label="✕ 大規模台数" accent={DANGER_COLOR} />
      </div>
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
        top: type.y + (1 - appear) * 16,
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
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>{type.jp}</Txt>
          <Txt style={{ fontSize: 30, fontWeight: 700, color: TEXT, letterSpacing: "0.03em" }}>{type.en}</Txt>
        </div>
      </div>
      {id === "cluster" ? <ClusterBody frame={frame} /> : null}
      {id === "partition" ? <PartitionBody frame={frame} /> : null}
      {id === "spread" ? <SpreadBody frame={frame} /> : null}
    </div>
  );
};

const CMP_ROWS: { label: string; values: [string, string, string] }[] = [
  { label: "目的", values: ["性能・低遅延", "ラック障害隔離", "ハード障害隔離"] },
  { label: "AZ", values: ["単一のみ", "複数可", "複数可"] },
  { label: "台数の直観", values: ["容量次第 / 同時起動", "7 partitions / AZ", "7 running / AZ"] },
  { label: "使う", values: ["HPC / MPI", "Hadoop / Kafka", "DNS / AD など少数"] },
  { label: "使わない", values: ["HA 設計", "超低遅延 HPC", "大規模クラスタ"] },
];

const ComparisonBoard: FC<{ frame: number }> = ({ frame }) => {
  const show = linearT(frame, cmpHold, cmpHold + 24);
  const cols = [
    { title: "Cluster", accent: CLUSTER_ACCENT },
    { title: "Partition", accent: PARTITION_ACCENT },
    { title: "Spread", accent: SPREAD_ACCENT },
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
        opacity: Math.max(0.35, show),
        padding: "28px 32px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <IconBadge file="icons/grid.svg" size={44} accent={WARN_COLOR} />
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>3-WAY</Txt>
          <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>Cluster / Partition / Spread</Txt>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 1fr 1fr",
          gap: 0,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ background: "#101828", padding: "14px 16px" }} />
        {cols.map((col, index) => (
          <div
            key={col.title}
            style={{
              background: "#101828",
              padding: "14px 16px",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              opacity: linearT(frame, cmpHold + 20 + index * 16, cmpHold + 48 + index * 16),
            }}
          >
            <Txt style={{ fontSize: 20, fontWeight: 700, color: col.accent, textAlign: "center" }}>{col.title}</Txt>
          </div>
        ))}
        {CMP_ROWS.map((row, rowIndex) => (
          <div key={row.label} style={{ display: "contents" }}>
            <div
              style={{
                background: rowIndex % 2 === 0 ? "#162033" : "#141C2C",
                padding: "13px 16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Txt style={{ fontSize: 16, fontWeight: 700, color: MUTED }}>{row.label}</Txt>
            </div>
            {row.values.map((value, colIndex) => (
              <div
                key={`${row.label}-${colIndex}`}
                style={{
                  background: rowIndex % 2 === 0 ? "#162033" : "#141C2C",
                  padding: "13px 16px",
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: linearT(
                    frame,
                    cmpHold + 24 + rowIndex * 16 + colIndex * 4,
                    cmpHold + 48 + rowIndex * 16 + colIndex * 4,
                  ),
                }}
              >
                <Txt
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: row.label === "使わない" ? DANGER_COLOR : TEXT_SOFT,
                    textAlign: "center",
                  }}
                >
                  {value}
                </Txt>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 22,
          opacity: linearT(frame, cmpHold + 110, cmpHold + 150),
        }}
      >
        <Tag label="性能 → Cluster" accent={CLUSTER_ACCENT} />
        <Tag label="ラック隔離 → Partition" accent={PARTITION_ACCENT} />
        <Tag label="ハード隔離 → Spread" accent={SPREAD_ACCENT} />
        <Tag label="性能 ≠ 可用性" accent={WARN_COLOR} />
      </div>
    </div>
  );
};

const EXAM_CARDS = [
  {
    icon: "icons/building.svg",
    accent: CLUSTER_ACCENT,
    kicker: "AZ awareness",
    title: "AZ のまたぎ",
    body: "Cluster は単一 AZ。Partition と Spread は複数 AZ に広げられる。",
  },
  {
    icon: "icons/server.svg",
    accent: WARN_COLOR,
    kicker: "Count intuition",
    title: "台数の直観",
    body: "Spread は 7 台/AZ。Partition は 7 パーティション/AZ。Cluster は容量と同時起動。",
  },
  {
    icon: "icons/check.svg",
    accent: SUCCESS_COLOR,
    kicker: "Use-case mapping",
    title: "問題文 → 類型",
    body: "低遅延 HPC → Cluster。分散基盤のラック隔離 → Partition。少数の重要ノード → Spread。",
  },
] as const;

const ExamBoard: FC<{ frame: number }> = ({ frame }) => {
  const show = linearT(frame, examHold, examHold + 24);
  return (
    <div
      style={{
        position: "absolute",
        left: BOARD_X,
        top: EXAM_Y,
        width: BOARD_W,
        height: BOARD_H,
        borderRadius: 24,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        opacity: Math.max(0.35, show),
        padding: "28px 32px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <IconBadge file="icons/check.svg" size={44} accent={SUCCESS_COLOR} />
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>SAA EXAM</Txt>
          <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>試験で問われやすい 3 点</Txt>
        </div>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {EXAM_CARDS.map((card, index) => (
          <div
            key={card.title}
            style={{
              flex: 1,
              minHeight: 480,
              borderRadius: 20,
              background: "linear-gradient(180deg, #182236 0%, #121A2B 100%)",
              border: `1.5px solid ${card.accent}55`,
              boxShadow: `0 0 22px ${card.accent}22`,
              padding: 24,
              boxSizing: "border-box",
              opacity: linearT(frame, examHold + 18 + index * 36, examHold + 52 + index * 36),
            }}
          >
            <IconBadge file={card.icon} size={56} accent={card.accent} />
            <Txt
              style={{
                marginTop: 18,
                fontSize: 14,
                letterSpacing: "0.16em",
                color: card.accent,
                fontWeight: 700,
              }}
            >
              {card.kicker}
            </Txt>
            <Txt style={{ marginTop: 8, fontSize: 26, fontWeight: 700, color: TEXT }}>{card.title}</Txt>
            <Txt style={{ marginTop: 16, fontSize: 20, lineHeight: 1.55, color: TEXT_SOFT, fontWeight: 500 }}>
              {card.body}
            </Txt>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
              {index === 0 ? (
                <>
                  <Tag label="Cluster = 1 AZ" accent={CLUSTER_ACCENT} />
                  <Tag label="他はマルチ AZ" accent={SUCCESS_COLOR} />
                </>
              ) : null}
              {index === 1 ? (
                <>
                  <Tag label="Spread 7/AZ" accent={SPREAD_ACCENT} />
                  <Tag label="Partition 7/AZ" accent={PARTITION_ACCENT} />
                </>
              ) : null}
              {index === 2 ? (
                <>
                  <Tag label="HPC → Cluster" accent={CLUSTER_ACCENT} />
                  <Tag label="Kafka → Partition" accent={PARTITION_ACCENT} />
                  <Tag label="AD → Spread" accent={SPREAD_ACCENT} />
                </>
              ) : null}
            </div>
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
  const zoomed = cam.scale > 1.04;
  const titleOpacity =
    interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (zoomed ? 0 : 1);
  const cardsAppear = linearT(frame, 10, 48);
  const caption = captionFor(frame);
  const captionOpacity = interpolate(frame, [0, 12, DURATION - 18, DURATION], [0, 1, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dimFor = (id: TypeId) => {
    if (!focused) {
      return 1;
    }
    return focused === id ? 1 : 0.28;
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
        <ExamBoard frame={frame} />
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
        Cluster · Partition · Spread — 置き方で性能と障害ドメインが決まる
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
