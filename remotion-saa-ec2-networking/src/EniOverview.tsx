import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  BG,
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
  PacketDot,
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
  loopT,
  polylineLength,
  smoothT,
  toD,
  walkPolyline,
  type CameraView,
  type Pt,
} from "./theme";

const NODE_W = 280;
const NODE_H = 250;
const ENI_W = 340;
const ENI_H = 280;

const INST_A = { x: 160, y: 380 };
const ENI_POS = { x: 790, y: 364 };
const SUBNET_POS = { x: 1480, y: 380 };
const SG_POS = { x: 820, y: 730 };

const PRIM_Y = 1180;
const MOVE_Y = 2080;
const BOARD_X = 70;
const BOARD_W = 1780;
const BOARD_H = 760;

const PEAK_ENI = 1.16;
const PEAK_BOARD = 1.03;

const INTRO = 100;
const ZOOM = 84;
const P_DIAGRAM = 90;
const P_MOTION = 150;
const P_TERM = 120;
const P_DWELL = 180;
const TOPIC_HOLD = P_DIAGRAM + P_MOTION + P_TERM + P_DWELL;
const ENI_HOLD = TOPIC_HOLD;
const PRIM_HOLD = TOPIC_HOLD;
const MOVE_HOLD = TOPIC_HOLD;
const REST = 180;
const OUTRO = 96;

const eniZoom = INTRO;
const eniHold = eniZoom + ZOOM;
const primZoom = eniHold + ENI_HOLD;
const primHold = primZoom + ZOOM;
const moveZoom = primHold + PRIM_HOLD;
const moveHold = moveZoom + ZOOM;
const overviewBack = moveHold + MOVE_HOLD;
const overviewHold = overviewBack + ZOOM;
const outroHold = overviewHold + REST;
export const DURATION = outroHold + OUTRO;

const ENI_CENTER: Pt = { x: ENI_POS.x + ENI_W / 2, y: ENI_POS.y + ENI_H / 2 };
const PRIM_CENTER: Pt = { x: WIDTH / 2, y: PRIM_Y + 390 };
const MOVE_CENTER: Pt = { x: WIDTH / 2, y: MOVE_Y + 390 };

const FOCUS_ENI = cameraFocus(ENI_CENTER, PEAK_ENI);
const FOCUS_PRIM = cameraFocus(PRIM_CENTER, PEAK_BOARD);
const FOCUS_MOVE = cameraFocus(MOVE_CENTER, PEAK_BOARD);

const cameraAt = (frame: number): CameraView => {
  if (frame < eniZoom) {
    return IDENTITY_CAM;
  }
  if (frame < eniHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_ENI, smoothT(frame, eniZoom, eniHold));
  }
  if (frame < primZoom) {
    return FOCUS_ENI;
  }
  if (frame < primHold) {
    return lerpCam(FOCUS_ENI, FOCUS_PRIM, smoothT(frame, primZoom, primHold));
  }
  if (frame < moveZoom) {
    return FOCUS_PRIM;
  }
  if (frame < moveHold) {
    return lerpCam(FOCUS_PRIM, FOCUS_MOVE, smoothT(frame, moveZoom, moveHold));
  }
  if (frame < overviewBack) {
    return FOCUS_MOVE;
  }
  if (frame < overviewHold) {
    return lerpCam(FOCUS_MOVE, IDENTITY_CAM, smoothT(frame, overviewBack, overviewHold));
  }
  return IDENTITY_CAM;
};

const moving = (frame: number) =>
  (frame >= eniZoom && frame < eniHold) ||
  (frame >= primZoom && frame < primHold) ||
  (frame >= moveZoom && frame < moveHold) ||
  (frame >= overviewBack && frame < overviewHold);

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
  if (frame < eniHold) {
    return { kicker: "ENI", line: "仮想 NIC" };
  }
  const eniPhase = beatPhase(frame, eniHold);
  if (frame < primZoom) {
    if (eniPhase === "diagram") {
      return { kicker: "ENI", line: "Instance · ENI · Subnet" };
    }
    if (eniPhase === "motion") {
      return { kicker: "通り道", line: "通信は Instance → ENI → Subnet" };
    }
    return { kicker: "ENI", line: "仮想 NIC。IP と SG を持つ" };
  }
  const primPhase = beatPhase(frame, primHold);
  if (frame < moveZoom) {
    if (primPhase === "diagram") {
      return { kicker: "2 本の NIC", line: "eth0 と eth1 の通り道" };
    }
    if (primPhase === "motion") {
      return { kicker: "2 本の NIC", line: "パケットが eth0 と eth1 を通る" };
    }
    return { kicker: "2 本の NIC", line: "eth0 は外せない。eth1 は移せる" };
  }
  const movePhase = beatPhase(frame, moveHold);
  if (frame < overviewBack) {
    if (movePhase === "diagram") {
      return { kicker: "移動", line: "同じ AZ の 2 台" };
    }
    if (movePhase === "motion") {
      return { kicker: "移動", line: "ENI が A から B へ移る" };
    }
    return { kicker: "移動", line: "同じ AZ なら、ENI ごと移る" };
  }
  return { kicker: "SG", line: "SG は ENI に付く" };
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
      boxShadow: focused ? `0 0 0 5px ${accent}33, 0 0 28px ${accent}55` : "0 16px 36px rgba(0,0,0,0.28)",
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
const PATH_FULL: Pt[] = [
  PATH_INST_ENI[0],
  PATH_INST_ENI[1],
  { x: ENI_POS.x + ENI_W / 2, y: ENI_POS.y + ENI_H / 2 },
  PATH_ENI_SUBNET[0],
  PATH_ENI_SUBNET[1],
];
const PATH_RETURN: Pt[] = [...PATH_FULL].reverse();

const OverviewPaths: FC<{ progress: number; glow: boolean }> = ({ progress, glow }) => {
  const paths = [PATH_INST_ENI, PATH_ENI_SUBNET, PATH_ENI_SG];
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT + 80}`}
      width={WIDTH}
      height={HEIGHT + 80}
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
          />
        );
      })}
    </svg>
  );
};

const PrimaryScene: FC<{ frame: number }> = ({ frame }) => {
  const phase = beatPhase(frame, primHold);
  const trafficOn = phase !== "diagram";
  const eth1 = smoothT(frame, primHold + P_DIAGRAM, primHold + P_DIAGRAM + 70);
  const t0 = loopT(frame, primHold + P_DIAGRAM, 86);
  const t1 = loopT(frame, primHold + P_DIAGRAM + 20, 94);
  const path0: Pt[] = [
    { x: 360, y: 250 },
    { x: 560, y: 250 },
    { x: 820, y: 250 },
    { x: 1180, y: 250 },
    { x: 1420, y: 250 },
  ];
  const path1: Pt[] = [
    { x: 360, y: 470 },
    { x: 560, y: 470 },
    { x: 820, y: 470 },
    { x: 1180, y: 470 },
    { x: 1420, y: 470 },
  ];
  const p0 = walkPolyline(path0, t0);
  const p1 = walkPolyline(path1, t1);
  const onStage = frame >= primZoom && frame < moveZoom;
  const appear = smoothT(frame, primZoom, primHold);
  const fadeOut = 1 - smoothT(frame, moveZoom, moveHold);
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
        opacity: appear * (onStage ? 1 : fadeOut),
      }}
    >
      <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>2 本の通り道</Txt>
      <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 18 }}>どの NIC を通るか</Txt>
      <div style={{ position: "relative", height: 600 }}>
        <svg width={BOARD_W} height={600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d={toD(path0)}
            fill="none"
            stroke={WARN_COLOR}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d={toD(path1)}
            fill="none"
            stroke={ENI_ACCENT}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.2 + eth1 * 0.45}
          />
        </svg>
        <NodeCard x={80} y={220} w={260} h={280} accent={INSTANCE_ACCENT} icon="icons/server.svg" kicker="EC2" title="Instance">
          <Tag label="eth0 + eth1" accent={INSTANCE_ACCENT} />
        </NodeCard>
        <NodeCard x={560} y={120} w={260} h={200} accent={WARN_COLOR} icon="icons/lock.svg" kicker="eth0" title="Primary" focused>
          <Txt style={{ fontSize: 16, color: TEXT_SOFT }}>外せない</Txt>
        </NodeCard>
        <NodeCard
          x={560}
          y={360}
          w={260}
          h={200}
          accent={ENI_ACCENT}
          icon="icons/unplug.svg"
          kicker="eth1"
          title="Secondary"
          dim={0.35 + eth1 * 0.65}
        >
          <Txt style={{ fontSize: 16, color: TEXT_SOFT }}>移せる</Txt>
        </NodeCard>
        <NodeCard x={1180} y={120} w={280} h={200} accent={SUBNET_ACCENT} icon="icons/globe.svg" kicker="subnet" title="管理">
          <Txt style={{ fontSize: 16, color: TEXT_SOFT }}>eth0 の先</Txt>
        </NodeCard>
        <NodeCard
          x={1180}
          y={360}
          w={280}
          h={200}
          accent={SUBNET_ACCENT}
          icon="icons/globe.svg"
          kicker="subnet"
          title="データ"
          dim={0.35 + eth1 * 0.65}
        >
          <Txt style={{ fontSize: 16, color: TEXT_SOFT }}>eth1 の先</Txt>
        </NodeCard>
        {trafficOn ? <PacketDot x={p0.x} y={p0.y} color={WARN_COLOR} /> : null}
        {trafficOn ? <PacketDot x={p1.x} y={p1.y} color={ENI_ACCENT} opacity={eth1} /> : null}
      </div>
    </div>
  );
};

const MOVE_A = { x: 180, y: MOVE_Y + 200 };
const MOVE_B = { x: 1240, y: MOVE_Y + 200 };
const MOVE_ENI_FROM = { x: 520, y: MOVE_Y + 250 };
const MOVE_ENI_TO = { x: 940, y: MOVE_Y + 250 };

const MoveScene: FC<{ frame: number }> = ({ frame }) => {
  const phase = beatPhase(frame, moveHold);
  const detach = smoothT(frame, moveHold + P_DIAGRAM, moveHold + P_DIAGRAM + 40);
  const travel = smoothT(frame, moveHold + P_DIAGRAM + 50, moveHold + P_DIAGRAM + 130);
  const attach = smoothT(frame, moveHold + P_DIAGRAM + 132, moveHold + P_DIAGRAM + 150);
  const eniPos = walkPolyline(
    [
      { x: MOVE_ENI_FROM.x, y: MOVE_ENI_FROM.y },
      { x: MOVE_ENI_TO.x, y: MOVE_ENI_TO.y },
    ],
    travel,
  );
  const beforePath: Pt[] = [
    { x: MOVE_A.x + 150 - BOARD_X, y: MOVE_A.y + 80 - MOVE_Y - 28 },
    { x: MOVE_ENI_FROM.x + 150 - BOARD_X, y: MOVE_ENI_FROM.y + 80 - MOVE_Y - 28 },
  ];
  const afterPath: Pt[] = [
    { x: MOVE_B.x + 150 - BOARD_X, y: MOVE_B.y + 80 - MOVE_Y - 28 },
    { x: MOVE_ENI_TO.x + 150 - BOARD_X, y: MOVE_ENI_TO.y + 80 - MOVE_Y - 28 },
  ];
  const tBefore = loopT(frame, moveHold + P_DIAGRAM, 70);
  const tAfter = loopT(frame, moveHold + P_DIAGRAM + P_MOTION, 70);
  const pktBefore = walkPolyline(beforePath, tBefore);
  const pktAfter = walkPolyline(afterPath, tAfter);
  const appear = smoothT(frame, moveZoom, moveHold);
  const fadeOut = 1 - smoothT(frame, overviewBack, overviewHold);
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
        opacity: appear * fadeOut,
      }}
    >
      <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: MUTED, fontWeight: 600 }}>同じ AZ</Txt>
      <Txt style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 16 }}>ENI ごと移す</Txt>
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
          AZ
        </Txt>
        <NodeCard
          x={MOVE_A.x - BOARD_X}
          y={MOVE_A.y - MOVE_Y - 28}
          w={300}
          h={230}
          accent={INSTANCE_ACCENT}
          icon="icons/server.svg"
          kicker="FROM"
          title="Instance A"
        >
          <Tag label={detach > 0.8 ? "eth0 だけ" : "eth0 + eth1"} accent={INSTANCE_ACCENT} />
        </NodeCard>
        <NodeCard
          x={MOVE_B.x - BOARD_X}
          y={MOVE_B.y - MOVE_Y - 28}
          w={300}
          h={230}
          accent={SUCCESS_COLOR}
          icon="icons/server.svg"
          kicker="TO"
          title="Instance B"
          focused={attach > 0.6}
        >
          <Tag label={attach > 0.6 ? "ENI を受け取った" : "待ち"} accent={attach > 0.6 ? SUCCESS_COLOR : MUTED} />
        </NodeCard>
        <svg width={BOARD_W} height={560} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
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
            opacity={0.45 + travel * 0.4}
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
            <Tag label="SG" accent={SG_ACCENT} />
          </div>
        </div>
        {phase !== "diagram" && detach < 0.35 ? <PacketDot x={pktBefore.x} y={pktBefore.y} color={GLOW_COLOR} /> : null}
        {attach > 0.6 ? <PacketDot x={pktAfter.x} y={pktAfter.y} color={SUCCESS_COLOR} /> : null}
      </div>
    </div>
  );
};

export const EniOverview: FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const titleOpacity =
    interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (frame < eniZoom ? 1 : smoothT(frame, overviewHold, overviewHold + 18));
  const appear = smoothT(frame, 8, 52);
  const pathDraw = smoothT(frame, 20, 90);
  const caption = captionFor(frame);
  const captionOpacity =
    interpolate(frame, [0, 16, DURATION - 20, DURATION], [0, 1, 1, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * (moving(frame) ? 0.55 : 1);
  const focusEni = frame >= eniHold && frame < primZoom;
  const overviewTraffic =
    (frame >= eniHold + P_DIAGRAM && frame < primZoom) || frame >= overviewHold;
  const tGo = loopT(frame, eniHold + P_DIAGRAM, 96);
  const tBack = loopT(frame, eniHold + P_DIAGRAM + 48, 96);
  const go = walkPolyline(PATH_FULL, tGo);
  const back = walkPolyline(PATH_RETURN, tBack);

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
        <OverviewPaths progress={pathDraw} glow={focusEni} />
        <NodeCard
          x={INST_A.x}
          y={INST_A.y}
          w={NODE_W}
          h={NODE_H}
          accent={INSTANCE_ACCENT}
          icon="icons/server.svg"
          kicker="EC2"
          title="Instance"
          dim={appear * (focusEni ? 0.5 : 1)}
        >
          <Tag label="eth0" accent={INSTANCE_ACCENT} />
        </NodeCard>
        <NodeCard
          x={ENI_POS.x}
          y={ENI_POS.y}
          w={ENI_W}
          h={ENI_H}
          accent={ENI_ACCENT}
          icon="icons/cable.svg"
          kicker="仮想 NIC"
          title="ENI"
          focused={focusEni}
          dim={appear}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag label="IP" accent={ENI_ACCENT} />
            <Tag label="SG" accent={SG_ACCENT} />
          </div>
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
          dim={appear * (focusEni ? 0.5 : 1)}
        >
          <Tag label="行き先" accent={SUBNET_ACCENT} />
        </NodeCard>
        <NodeCard
          x={SG_POS.x}
          y={SG_POS.y}
          w={280}
          h={150}
          accent={SG_ACCENT}
          icon="icons/shield.svg"
          kicker="付く先"
          title="SG"
          dim={appear * (focusEni ? 0.18 : 1)}
        >
          <Tag label="ENI に付く" accent={SG_ACCENT} />
        </NodeCard>
        {overviewTraffic && pathDraw > 0.25 ? <PacketDot x={go.x} y={go.y} color={GLOW_COLOR} /> : null}
        {overviewTraffic && pathDraw > 0.25 ? (
          <PacketDot x={back.x} y={back.y} color={ENI_ACCENT} size={12} opacity={0.85} />
        ) : null}
        <PrimaryScene frame={frame} />
        <MoveScene frame={frame} />
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
        仮想 NIC
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
