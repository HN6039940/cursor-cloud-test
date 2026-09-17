import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  BG,
  DANGER_COLOR,
  ENI_ACCENT,
  FONT_FAMILY,
  FPS,
  GLOW_COLOR,
  HEIGHT,
  IDENTITY_CAM,
  INSTANCE_ACCENT,
  IconBadge,
  IconImg,
  MUTED,
  PATH_COLOR,
  SG_ACCENT,
  SUBNET_ACCENT,
  SUCCESS_COLOR,
  ScreenCaption,
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
  polylineLength,
  toD,
  walkPolyline,
  type CameraView,
  type Pt,
} from "./theme";

const NODE_W = 280;
const NODE_H = 250;
const ENI_W = 340;
const ENI_H = 300;

const INST_A = { x: 160, y: 360 };
const ENI_POS = { x: 790, y: 334 };
const SUBNET_POS = { x: 1480, y: 360 };
const SG_POS = { x: 820, y: 720 };

const PRIM_Y = 1180;
const MOVE_Y = 2080;
const EXAM_Y = 3000;
const BOARD_X = 70;
const BOARD_W = 1780;
const BOARD_H = 760;

const PEAK_ENI = 1.62;
const PEAK_SG = 1.62;
const PEAK_BOARD = 1.05;

const INTRO = 90;
const ZOOM = 30;
const ENI_HOLD = 480;
const PRIM_HOLD = 510;
const MOVE_HOLD = 540;
const SG_HOLD = 240;
const EXAM_HOLD = 570;
const OUTRO = 150;

const eniZoom = INTRO;
const eniHold = eniZoom + ZOOM;
const primZoom = eniHold + ENI_HOLD;
const primHold = primZoom + ZOOM;
const moveZoom = primHold + PRIM_HOLD;
const moveHold = moveZoom + ZOOM;
const sgZoom = moveHold + MOVE_HOLD;
const sgHoldAt = sgZoom + ZOOM;
const examZoom = sgHoldAt + SG_HOLD;
const examHold = examZoom + ZOOM;
const outroZoom = examHold + EXAM_HOLD;
export const DURATION = outroZoom + ZOOM + OUTRO;

const ENI_CENTER: Pt = { x: ENI_POS.x + ENI_W / 2, y: ENI_POS.y + ENI_H / 2 };
const SG_CENTER: Pt = { x: SG_POS.x + 280 / 2, y: SG_POS.y + 170 / 2 };
const PRIM_CENTER: Pt = { x: WIDTH / 2, y: PRIM_Y + 360 };
const MOVE_CENTER: Pt = { x: WIDTH / 2, y: MOVE_Y + 380 };
const EXAM_CENTER: Pt = { x: WIDTH / 2, y: EXAM_Y + BOARD_H / 2 };

const FOCUS_ENI = cameraFocus(ENI_CENTER, PEAK_ENI);
const FOCUS_SG = cameraFocus(SG_CENTER, PEAK_SG);
const FOCUS_PRIM = cameraFocus(PRIM_CENTER, PEAK_BOARD);
const FOCUS_MOVE = cameraFocus(MOVE_CENTER, 1.08);
const FOCUS_EXAM = cameraFocus(EXAM_CENTER, PEAK_BOARD);

const cameraAt = (frame: number): CameraView => {
  if (frame < eniZoom) {
    return IDENTITY_CAM;
  }
  if (frame < eniHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_ENI, linearT(frame, eniZoom, eniHold));
  }
  if (frame < primZoom) {
    return FOCUS_ENI;
  }
  if (frame < primHold) {
    return lerpCam(FOCUS_ENI, FOCUS_PRIM, linearT(frame, primZoom, primHold));
  }
  if (frame < moveZoom) {
    return FOCUS_PRIM;
  }
  if (frame < moveHold) {
    return lerpCam(FOCUS_PRIM, FOCUS_MOVE, linearT(frame, moveZoom, moveHold));
  }
  if (frame < sgZoom) {
    return FOCUS_MOVE;
  }
  if (frame < sgHoldAt) {
    return lerpCam(FOCUS_MOVE, FOCUS_SG, linearT(frame, sgZoom, sgHoldAt));
  }
  if (frame < examZoom) {
    return FOCUS_SG;
  }
  if (frame < examHold) {
    return lerpCam(FOCUS_SG, FOCUS_EXAM, linearT(frame, examZoom, examHold));
  }
  if (frame < outroZoom) {
    return FOCUS_EXAM;
  }
  if (frame < outroZoom + ZOOM) {
    return lerpCam(FOCUS_EXAM, IDENTITY_CAM, linearT(frame, outroZoom, outroZoom + ZOOM));
  }
  return IDENTITY_CAM;
};

const captionFor = (frame: number): { kicker: string; line: string } => {
  if (frame < eniZoom) {
    return { kicker: "SAA · VPC", line: "ENI — Elastic Network Interface。仮想 NIC" };
  }
  if (frame < eniHold + 150) {
    return { kicker: "ENI とは", line: "インスタンスに付く仮想 NIC。IP / MAC / SG の入れ物" };
  }
  if (frame < eniHold + 310) {
    return { kicker: "保持するもの", line: "プライマリ IPv4、セカンダリ IP、EIP、MAC、セキュリティグループ" };
  }
  if (frame < primZoom) {
    return { kicker: "関係", line: "Instance ↔ ENI ↔ Subnet。SG は ENI に付く" };
  }
  if (frame < primHold + 180) {
    return { kicker: "Primary", line: "eth0 はライフタイム固定。デタッチできない" };
  }
  if (frame < primHold + 360) {
    return { kicker: "Secondary", line: "eth1 以降は着脱できる。同じ AZ なら別インスタンスへ移せる" };
  }
  if (frame < moveZoom) {
    return { kicker: "複数 ENI", line: "管理面とデータ面の分離、複数 IP、アプライアンス用途" };
  }
  if (frame < moveHold + 180) {
    return { kicker: "Detach", line: "セカンダリ ENI を外す。IP / MAC / SG は ENI 側に残る" };
  }
  if (frame < moveHold + 380) {
    return { kicker: "Move", line: "同じ AZ の別インスタンスへアタッチ。身元はそのまま移動" };
  }
  if (frame < sgZoom) {
    return { kicker: "移動後", line: "新しいインスタンスが、同じ IP・MAC・SG を引き継ぐ" };
  }
  if (frame < examZoom) {
    return { kicker: "SG の所属", line: "セキュリティグループはインスタンスではなく ENI に付く" };
  }
  if (frame < examHold + 180) {
    return { kicker: "試験ポイント", line: "複数 ENI = 複数の IP と経路。デュアルホームの定番" };
  }
  if (frame < examHold + 360) {
    return { kicker: "試験ポイント", line: "ENI 移動で IP・MAC・SG が一緒に動く。AZ をまたげない" };
  }
  if (frame < outroZoom) {
    return { kicker: "試験ポイント", line: "SG の対象は ENI。問題文の「インスタンスに SG」は ENI 経由" };
  }
  return { kicker: "SAA · まとめ", line: "ENI は仮想 NIC。住所（IP）と鍵（SG）の入れ物を着脱する" };
};

const NodeCard: FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  icon: string;
  kicker: string;
  title: string;
  focused?: boolean;
  dim?: number;
  children?: ReactNode;
  style?: CSSProperties;
}> = ({ x, y, w, h, accent, icon, kicker, title, focused = false, dim = 1, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 22,
      background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
      border: focused ? `2px solid ${accent}` : "1.5px solid rgba(255,255,255,0.08)",
      boxShadow: focused
        ? `0 0 0 5px ${accent}33, 0 0 28px ${accent}55`
        : "0 16px 36px rgba(0,0,0,0.28)",
      opacity: dim,
      overflow: "hidden",
      padding: "0 22px 18px",
      boxSizing: "border-box",
      ...style,
    }}
  >
    <div
      style={{
        width: "calc(100% + 44px)",
        marginLeft: -22,
        height: 6,
        background: accent,
      }}
    />
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, marginBottom: 12 }}>
      <IconBadge file={icon} size={48} accent={focused ? accent : undefined} />
      <div>
        <Txt style={{ fontSize: 13, letterSpacing: "0.14em", color: MUTED, fontWeight: 600 }}>{kicker}</Txt>
        <Txt style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>{title}</Txt>
      </div>
    </div>
    {children}
  </div>
);

const PATH_INST_ENI: Pt[] = [
  { x: INST_A.x + NODE_W, y: INST_A.y + NODE_H / 2 },
  { x: ENI_POS.x, y: ENI_POS.y + ENI_H / 2 },
];
const PATH_ENI_SUBNET: Pt[] = [
  { x: ENI_POS.x + ENI_W, y: ENI_POS.y + ENI_H / 2 },
  { x: SUBNET_POS.x, y: SUBNET_POS.y + NODE_H / 2 },
];
const PATH_ENI_SG: Pt[] = [
  { x: ENI_POS.x + ENI_W / 2, y: ENI_POS.y + ENI_H },
  { x: SG_POS.x + 140, y: SG_POS.y },
];

const OverviewPaths: FC<{ progress: number; glow: boolean }> = ({ progress, glow }) => {
  const paths = [PATH_INST_ENI, PATH_ENI_SUBNET, PATH_ENI_SG];
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT + 40}`}
      width={WIDTH}
      height={HEIGHT + 40}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      {paths.map((pts, index) => {
        const len = polylineLength(pts);
        return (
          <path
            key={index}
            d={toD(pts)}
            fill="none"
            stroke={glow ? GLOW_COLOR : PATH_COLOR}
            strokeWidth={glow ? 5 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - progress)}
            opacity={0.9}
            style={{ filter: glow ? `drop-shadow(0 0 8px ${GLOW_COLOR})` : undefined }}
          />
        );
      })}
    </svg>
  );
};

const ENI_CHIPS = [
  { icon: "icons/radio.svg", label: "10.0.1.24", hint: "Primary IPv4" },
  { icon: "icons/hash.svg", label: "02:8f:…:a1", hint: "MAC" },
  { icon: "icons/shield.svg", label: "sg-web", hint: "Security Group" },
  { icon: "icons/globe.svg", label: "EIP 可", hint: "Elastic IP" },
] as const;

const EniChips: FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {ENI_CHIPS.map((chip, index) => (
      <div
        key={chip.hint}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 10px",
          borderRadius: 12,
          background: "#101828",
          border: `1px solid ${ENI_ACCENT}44`,
          opacity: Math.max(
            linearT(frame, 36 + index * 10, 64 + index * 10),
            linearT(frame, eniHold + 20 + index * 28, eniHold + 48 + index * 28),
          ),
          minWidth: 140,
        }}
      >
        <IconImg file={chip.icon} size={18} />
        <div>
          <Txt style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em" }}>{chip.hint}</Txt>
          <Txt style={{ fontSize: 15, color: TEXT_SOFT, fontWeight: 700 }}>{chip.label}</Txt>
        </div>
      </div>
    ))}
  </div>
);

const PrimaryScene: FC<{ frame: number }> = ({ frame }) => {
  const secondary = linearT(frame, primHold + 160, primHold + 220);
  return (
    <div
      style={{
        position: "absolute",
        left: BOARD_X,
        top: PRIM_Y,
        width: BOARD_W,
        height: BOARD_H,
        borderRadius: 24,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        padding: "28px 36px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <IconBadge file="icons/lock.svg" size={44} accent={WARN_COLOR} />
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>ATTACH MODEL</Txt>
          <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>Primary vs Secondary</Txt>
        </div>
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "stretch" }}>
        <div
          style={{
            width: 420,
            borderRadius: 20,
            background: "#101828",
            border: `1.5px solid ${INSTANCE_ACCENT}55`,
            padding: 22,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconImg file="icons/server.svg" size={36} />
            <Txt style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Instance A</Txt>
          </div>
          <div
            style={{
              marginTop: 18,
              borderRadius: 14,
              border: `1.5px solid ${WARN_COLOR}`,
              background: `${WARN_COLOR}14`,
              padding: 14,
              opacity: linearT(frame, primHold + 12, primHold + 50),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconImg file="icons/lock.svg" size={20} />
              <Txt style={{ fontSize: 18, fontWeight: 700, color: WARN_COLOR }}>eth0 · Primary ENI</Txt>
            </div>
            <Txt style={{ marginTop: 6, fontSize: 15, color: TEXT_SOFT }}>ライフタイム固定 · デタッチ不可</Txt>
          </div>
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: `1.5px dashed ${ENI_ACCENT}`,
              background: `${ENI_ACCENT}14`,
              padding: 14,
              opacity: secondary,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconImg file="icons/unplug.svg" size={20} />
              <Txt style={{ fontSize: 18, fontWeight: 700, color: ENI_ACCENT }}>eth1 · Secondary ENI</Txt>
            </div>
            <Txt style={{ marginTop: 6, fontSize: 15, color: TEXT_SOFT }}>着脱可 · 同じ AZ なら移動可</Txt>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
          <Txt style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>試験での見方</Txt>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tag label="eth0 は外せない" accent={WARN_COLOR} />
            <Tag label="secondary はホットアタッチ" accent={ENI_ACCENT} />
            <Tag label="同一 AZ のみ移動" accent={SUBNET_ACCENT} />
          </div>
          <Txt style={{ fontSize: 18, lineHeight: 1.55, color: TEXT_SOFT, fontWeight: 500 }}>
            複数 ENI は「NIC を増やす」こと。追加のプライベート IP、管理用とデータ用の分離、アプライアンスの
            複数セグメント接続に使う。
          </Txt>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 12,
              opacity: secondary,
            }}
          >
            <div
              style={{
                flex: 1,
                borderRadius: 14,
                background: "#101828",
                border: `1px solid ${WARN_COLOR}55`,
                padding: 14,
              }}
            >
              <Txt style={{ fontSize: 13, color: WARN_COLOR, fontWeight: 700, letterSpacing: "0.1em" }}>eth0</Txt>
              <Txt style={{ marginTop: 6, fontSize: 16, color: TEXT, fontWeight: 700 }}>mgmt subnet</Txt>
              <Txt style={{ marginTop: 4, fontSize: 14, color: TEXT_SOFT }}>管理面 · SG-mgmt</Txt>
            </div>
            <div
              style={{
                flex: 1,
                borderRadius: 14,
                background: "#101828",
                border: `1px solid ${ENI_ACCENT}55`,
                padding: 14,
              }}
            >
              <Txt style={{ fontSize: 13, color: ENI_ACCENT, fontWeight: 700, letterSpacing: "0.1em" }}>eth1</Txt>
              <Txt style={{ marginTop: 6, fontSize: 16, color: TEXT, fontWeight: 700 }}>data subnet</Txt>
              <Txt style={{ marginTop: 4, fontSize: 14, color: TEXT_SOFT }}>データ面 · SG-data</Txt>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MOVE_A = { x: 220, y: MOVE_Y + 220 };
const MOVE_B = { x: 1280, y: MOVE_Y + 220 };
const MOVE_ENI_FROM = { x: 560, y: MOVE_Y + 250 };
const MOVE_ENI_TO = { x: 980, y: MOVE_Y + 250 };
const MOVE_PATH: Pt[] = [
  { x: MOVE_ENI_FROM.x + 150, y: MOVE_ENI_FROM.y + 80 },
  { x: MOVE_ENI_TO.x + 150, y: MOVE_ENI_TO.y + 80 },
];

const MoveScene: FC<{ frame: number }> = ({ frame }) => {
  const detach = linearT(frame, moveHold + 40, moveHold + 110);
  const travel = linearT(frame, moveHold + 140, moveHold + 300);
  const attach = linearT(frame, moveHold + 310, moveHold + 370);
  const eniPos = walkPolyline(
    [
      { x: MOVE_ENI_FROM.x, y: MOVE_ENI_FROM.y },
      { x: MOVE_ENI_TO.x, y: MOVE_ENI_TO.y },
    ],
    travel,
  );
  const packet = walkPolyline(MOVE_PATH, travel);
  return (
    <div
      style={{
        position: "absolute",
        left: BOARD_X,
        top: MOVE_Y,
        width: BOARD_W,
        height: BOARD_H,
        borderRadius: 24,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        padding: "28px 36px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <IconBadge file="icons/move.svg" size={44} accent={ENI_ACCENT} />
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>SAME AZ</Txt>
          <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>Detach → Move → Attach</Txt>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: 560,
          borderRadius: 18,
          border: `1.5px dashed ${SUBNET_ACCENT}88`,
          background: `${SUBNET_ACCENT}0c`,
        }}
      >
        <Txt
          style={{
            position: "absolute",
            top: -11,
            left: 18,
            fontSize: 13,
            fontWeight: 700,
            color: SUBNET_ACCENT,
            background: "#151C2C",
            padding: "0 8px",
            letterSpacing: "0.08em",
          }}
        >
          AZ · またげない
        </Txt>
        <NodeCard
          x={MOVE_A.x - BOARD_X}
          y={MOVE_A.y - MOVE_Y - 28}
          w={300}
          h={230}
          accent={INSTANCE_ACCENT}
          icon="icons/server.svg"
          kicker="SOURCE"
          title="Instance A"
          dim={1 - detach * 0.15}
        >
          <Tag label={detach > 0.8 ? "eth0 のみ" : "eth0 + eth1"} accent={INSTANCE_ACCENT} />
        </NodeCard>
        <NodeCard
          x={MOVE_B.x - BOARD_X}
          y={MOVE_B.y - MOVE_Y - 28}
          w={300}
          h={230}
          accent={SUCCESS_COLOR}
          icon="icons/server.svg"
          kicker="TARGET"
          title="Instance B"
          focused={attach > 0.6}
        >
          <Tag label={attach > 0.6 ? "ENI を継承" : "待ち"} accent={attach > 0.6 ? SUCCESS_COLOR : MUTED} />
        </NodeCard>
        <svg
          width={BOARD_W}
          height={560}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <path
            d={toD([
              { x: MOVE_ENI_FROM.x - BOARD_X + 150, y: MOVE_ENI_FROM.y - MOVE_Y - 28 + 80 },
              { x: MOVE_ENI_TO.x - BOARD_X + 150, y: MOVE_ENI_TO.y - MOVE_Y - 28 + 80 },
            ])}
            fill="none"
            stroke={PATH_COLOR}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="10 10"
            opacity={0.5 + travel * 0.5}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: eniPos.x - BOARD_X,
            top: eniPos.y - MOVE_Y - 28,
            width: 300,
            height: 160,
            borderRadius: 18,
            background: "linear-gradient(180deg, #1E2A40 0%, #151C2C 100%)",
            border: `2px solid ${ENI_ACCENT}`,
            boxShadow: `0 0 24px ${ENI_ACCENT}66`,
            padding: 16,
            boxSizing: "border-box",
            opacity: 0.55 + detach * 0.45,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconImg file="icons/cable.svg" size={28} />
            <Txt style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>Secondary ENI</Txt>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Tag label="IP" accent={ENI_ACCENT} />
            <Tag label="MAC" accent={ENI_ACCENT} />
            <Tag label="SG" accent={SG_ACCENT} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: packet.x - BOARD_X,
            top: packet.y - MOVE_Y - 28,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: 99,
            background: GLOW_COLOR,
            boxShadow: `0 0 18px ${GLOW_COLOR}`,
            opacity: travel > 0 && travel < 1 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

const EXAM_CARDS = [
  {
    icon: "icons/cable.svg",
    accent: ENI_ACCENT,
    kicker: "Multiple ENIs",
    title: "NIC を増やす",
    body: "追加 ENI は追加のプライベート IP と経路。管理用とデータ用のデュアルホームが定番。",
  },
  {
    icon: "icons/move.svg",
    accent: SUCCESS_COLOR,
    kicker: "ENI move",
    title: "入れ物ごと移動",
    body: "同じ AZ ならセカンダリ ENI を移せる。IP・MAC・SG が一緒に動く。AZ またぎは不可。",
  },
  {
    icon: "icons/shield.svg",
    accent: SG_ACCENT,
    kicker: "SG on ENI",
    title: "SG の所属先",
    body: "セキュリティグループはインスタンスではなく ENI に付く。ENI を移せば SG も移る。",
  },
] as const;

const ExamBoard: FC<{ frame: number }> = ({ frame }) => (
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
      padding: "28px 32px",
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
            opacity: linearT(frame, examHold + 16 + index * 36, examHold + 50 + index * 36),
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
                <Tag label="デュアルホーム" accent={ENI_ACCENT} />
                <Tag label="複数プライベート IP" accent={INSTANCE_ACCENT} />
              </>
            ) : null}
            {index === 1 ? (
              <>
                <Tag label="同一 AZ のみ" accent={SUBNET_ACCENT} />
                <Tag label="IP + MAC + SG" accent={SUCCESS_COLOR} />
              </>
            ) : null}
            {index === 2 ? (
              <>
                <Tag label="SG → ENI" accent={SG_ACCENT} />
                <Tag label="インスタンスではない" accent={DANGER_COLOR} />
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const EniOverview: FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const zoomed = cam.scale > 1.04;
  const titleOpacity =
    interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (zoomed ? 0 : 1);
  const appear = linearT(frame, 8, 44);
  const pathDraw = linearT(frame, 24, 80);
  const caption = captionFor(frame);
  const captionOpacity = interpolate(frame, [0, 12, DURATION - 18, DURATION], [0, 1, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const focusEni = frame >= eniHold && frame < primZoom;
  const focusSg = frame >= sgHoldAt && frame < examZoom;
  const glowPaths = focusEni || focusSg;

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
        <OverviewPaths progress={pathDraw} glow={glowPaths} />
        <NodeCard
          x={INST_A.x}
          y={INST_A.y}
          w={NODE_W}
          h={NODE_H}
          accent={INSTANCE_ACCENT}
          icon="icons/server.svg"
          kicker="EC2"
          title="Instance"
          dim={appear * (focusEni || focusSg ? 0.45 : 1)}
        >
          <Tag label="eth0 +" accent={INSTANCE_ACCENT} />
          <Txt style={{ marginTop: 10, fontSize: 15, color: TEXT_SOFT }}>ENI を挿す箱</Txt>
        </NodeCard>
        <NodeCard
          x={ENI_POS.x}
          y={ENI_POS.y}
          w={ENI_W}
          h={ENI_H}
          accent={ENI_ACCENT}
          icon="icons/cable.svg"
          kicker="VIRTUAL NIC"
          title="ENI"
          focused={focusEni}
          dim={appear * (focusSg ? 0.28 : 1)}
        >
          <EniChips frame={frame} />
        </NodeCard>
        <NodeCard
          x={SUBNET_POS.x}
          y={SUBNET_POS.y}
          w={NODE_W}
          h={NODE_H}
          accent={SUBNET_ACCENT}
          icon="icons/globe.svg"
          kicker="VPC"
          title="Subnet"
          dim={appear * (focusEni || focusSg ? 0.45 : 1)}
        >
          <Tag label="10.0.1.0/24" accent={SUBNET_ACCENT} />
          <Txt style={{ marginTop: 10, fontSize: 15, color: TEXT_SOFT }}>ENI はサブネットに属する</Txt>
        </NodeCard>
        <NodeCard
          x={SG_POS.x}
          y={SG_POS.y}
          w={280}
          h={170}
          accent={SG_ACCENT}
          icon="icons/shield.svg"
          kicker="ATTACHED TO ENI"
          title="Security Group"
          focused={focusSg}
          dim={appear * (focusEni ? 0.12 : 1)}
        >
          <Tag label="インスタンスではない" accent={focusSg ? SG_ACCENT : DANGER_COLOR} />
        </NodeCard>
        <PrimaryScene frame={frame} />
        <MoveScene frame={frame} />
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
        Elastic Network Interface
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
        仮想 NIC — IP / MAC / SG の入れ物を着脱する
      </Txt>
      <ScreenCaption kicker={caption.kicker} line={caption.line} opacity={captionOpacity} />
    </AbsoluteFill>
  );
};

export const ENI_OVERVIEW = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
