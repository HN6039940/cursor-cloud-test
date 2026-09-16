import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const PATH_COLOR = "#9BB8DC";
const GLOW_COLOR = "#7CE7FF";
const SUCCESS_COLOR = "#5EE9A0";
const ICON_ACCENT = "#59A6FF";
const REMOTION_ACCENT = "#F0C14B";
const CANVA_ACCENT = "#C084FC";
const STAFF_ACCENT = "#8EA0C2";
const BOT_ACCENT = "#7CE7FF";
const DESA_ACCENT = "#FFB020";
const PEAK_SCALE = 1.52;

type Pt = { x: number; y: number };
type CameraView = { scale: number; x: number; y: number };
type LayerId = "icons" | "remotion" | "canva";

const CARD_W = 500;
const CARD_H = 420;
const GAP = 72;
const ROW_W = CARD_W * 3 + GAP * 2;
const ROW_LEFT = (WIDTH - ROW_W) / 2;
const CARD_Y = 220;
const FLOW_Y = CARD_Y + CARD_H + 20;
const STAFF_Y = FLOW_Y + 58;
const BOT_Y = STAFF_Y + 56;

const LAYERS: Record<LayerId, { x: number; y: number; accent: string }> = {
  icons: { x: ROW_LEFT, y: CARD_Y, accent: ICON_ACCENT },
  remotion: { x: ROW_LEFT + CARD_W + GAP, y: CARD_Y, accent: REMOTION_ACCENT },
  canva: { x: ROW_LEFT + (CARD_W + GAP) * 2, y: CARD_Y, accent: CANVA_ACCENT },
};

const centerOf = (id: LayerId): Pt => ({
  x: LAYERS[id].x + CARD_W / 2,
  y: LAYERS[id].y + CARD_H / 2,
});

const IDENTITY_CAM: CameraView = { scale: 1, x: 0, y: 0 };

const INTRO_END = 72;
const ZOOM = 28;
const ICON_HOLD = 90;
const REMOTION_HOLD = 138;
const CANVA_HOLD = 90;
const FLOW_HOLD = 96;
const BOT_HOLD = 108;
const END_HOLD = 48;

const iconZoom = INTRO_END;
const iconHold = iconZoom + ZOOM;
const remotionZoom = iconHold + ICON_HOLD;
const remotionHold = remotionZoom + ZOOM;
const canvaZoom = remotionHold + REMOTION_HOLD;
const canvaHold = canvaZoom + ZOOM;
const overviewZoom = canvaHold + CANVA_HOLD;
const flowHold = overviewZoom + ZOOM;
const botAt = flowHold + FLOW_HOLD;
const endAt = botAt + BOT_HOLD;
export const DURATION = endAt + END_HOLD;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const linearT = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const cameraFocus = (target: Pt, peakScale: number): CameraView => {
  const scale = peakScale;
  return {
    scale,
    x: WIDTH / 2 - target.x * scale,
    y: HEIGHT / 2 - target.y * scale,
  };
};

const lerpCam = (from: CameraView, to: CameraView, t: number): CameraView => {
  const u = clamp01(t);
  return {
    scale: from.scale + (to.scale - from.scale) * u,
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  };
};

const FOCUS_ICONS = cameraFocus(centerOf("icons"), PEAK_SCALE);
const FOCUS_REMOTION = cameraFocus(centerOf("remotion"), PEAK_SCALE);
const FOCUS_CANVA = cameraFocus(centerOf("canva"), PEAK_SCALE);

const cameraAt = (frame: number): CameraView => {
  if (frame < iconZoom) {
    return IDENTITY_CAM;
  }
  if (frame < iconHold) {
    return lerpCam(IDENTITY_CAM, FOCUS_ICONS, linearT(frame, iconZoom, iconHold));
  }
  if (frame < remotionZoom) {
    return FOCUS_ICONS;
  }
  if (frame < remotionHold) {
    return lerpCam(FOCUS_ICONS, FOCUS_REMOTION, linearT(frame, remotionZoom, remotionHold));
  }
  if (frame < canvaZoom) {
    return FOCUS_REMOTION;
  }
  if (frame < canvaHold) {
    return lerpCam(FOCUS_REMOTION, FOCUS_CANVA, linearT(frame, canvaZoom, canvaHold));
  }
  if (frame < overviewZoom) {
    return FOCUS_CANVA;
  }
  if (frame < flowHold) {
    return lerpCam(FOCUS_CANVA, IDENTITY_CAM, linearT(frame, overviewZoom, flowHold));
  }
  return IDENTITY_CAM;
};

const focusedLayer = (frame: number): LayerId | null => {
  if (frame >= iconHold && frame < remotionZoom) {
    return "icons";
  }
  if (frame >= remotionHold && frame < canvaZoom) {
    return "remotion";
  }
  if (frame >= canvaHold && frame < overviewZoom) {
    return "canva";
  }
  return null;
};

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, fontFamily: FONT_FAMILY, ...style }}>{children}</p>
);

const Tag: FC<{ label: string; active?: boolean }> = ({ label, active = true }) => (
  <span
    style={{
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.04em",
      color: active ? "#EBF0FA" : "#6D7F9E",
      background: active ? "rgba(124, 231, 255, 0.12)" : "rgba(255,255,255,0.04)",
      border: active ? "1px solid rgba(124, 231, 255, 0.35)" : "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {label}
  </span>
);

const IconImg: FC<{ file: string; size: number }> = ({ file, size }) => (
  <Img src={staticFile(file)} style={{ width: size, height: size }} />
);

const captionFor = (frame: number): { kicker: string; line: string } => {
  if (frame < iconZoom) {
    return { kicker: "META", line: "チームの可視化スタック — 誰が何を担当するか" };
  }
  if (frame < remotionZoom) {
    return { kicker: "部品アイコン", line: "テキストなし SVG（Lucide など）。本編のノードへ置く" };
  }
  if (frame < canvaZoom) {
    return {
      kicker: "本編 Remotion",
      line: "ラベル・キャプション・配線・発光・データフロー・カメラ・タイミング",
    };
  }
  if (frame < flowHold) {
    return { kicker: "周辺 Canva", line: "SNS 静止画・軽いフェード・一括／静的。本編のあと任意" };
  }
  if (frame < botAt) {
    return { kicker: "流れ", line: "部品 → 本編 Remotion → 周辺 Canva（任意）。判断は参謀へ" };
  }
  return { kicker: "コード整理", line: "重複排除・共有モジュールは Remotion担当（Bot）。デザの方向とは別" };
};

const MiniNode: FC<{
  x: number;
  y: number;
  file: string;
  label: string;
  glow?: boolean;
}> = ({ x, y, file, label, glow }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 92,
      height: 108,
      borderRadius: 14,
      background: "linear-gradient(180deg, #1E2A40 0%, #151C2C 100%)",
      border: glow ? `1.5px solid ${GLOW_COLOR}` : "1px solid rgba(255,255,255,0.1)",
      boxShadow: glow ? `0 0 16px ${GLOW_COLOR}66` : "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
  >
    <IconImg file={file} size={32} />
    <Txt style={{ fontSize: 14, fontWeight: 700, color: "#EBF0FA" }}>{label}</Txt>
  </div>
);

const IconsBody: FC<{ frame: number }> = ({ frame }) => {
  const place = linearT(frame, iconHold + 8, iconHold + 36);
  return (
    <div style={{ position: "relative", width: "100%", height: 268 }}>
      <Txt style={{ fontSize: 15, color: "#8EA0C2", letterSpacing: "0.08em", marginBottom: 12 }}>
        テキストなし SVG
      </Txt>
      <div style={{ display: "flex", gap: 12 }}>
        {(["icons/monitor.svg", "icons/server.svg", "icons/database.svg"] as const).map((file) => (
          <div
            key={file}
            style={{
              width: 68,
              height: 68,
              borderRadius: 14,
              background: "#101828",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconImg file={file} size={34} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 4,
          top: 78,
          width: 156,
          height: 168,
          borderRadius: 16,
          background: "linear-gradient(180deg, #1A2438 0%, #151C2C 100%)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0.55 + place * 0.45,
          transform: `translateY(${(1 - place) * 10}px)`,
        }}
      >
        <div style={{ width: "100%", height: 5, background: ICON_ACCENT, borderRadius: "16px 16px 0 0" }} />
        <div style={{ marginTop: 22 }}>
          <IconImg file="icons/monitor.svg" size={44} />
        </div>
        <Txt style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: "#EBF0FA" }}>Client</Txt>
        <Txt style={{ marginTop: 4, fontSize: 13, color: "#8EA0C2" }}>ラベルは本編</Txt>
      </div>
    </div>
  );
};

const RemotionBody: FC<{ frame: number }> = ({ frame }) => {
  const draw = linearT(frame, remotionHold + 4, remotionHold + 40);
  const packetT = linearT(frame, remotionHold + 20, remotionHold + 110);
  const packetX = 118 + packetT * 196;
  const tags = ["ラベル", "キャプション", "配線", "発光", "データフロー", "カメラ", "タイミング"];
  const tagCount = Math.floor(linearT(frame, remotionHold, remotionHold + 70) * tags.length + 0.001);
  return (
    <div style={{ position: "relative", width: "100%", height: 268 }}>
      <div style={{ position: "relative", height: 132 }}>
        <svg width={420} height={132} style={{ overflow: "visible" }}>
          <path
            d="M118 66 H314"
            fill="none"
            stroke={PATH_COLOR}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={196}
            strokeDashoffset={196 * (1 - draw)}
            opacity={0.7}
          />
        </svg>
        <MiniNode x={26} y={12} file="icons/monitor.svg" label="A" glow={packetT < 0.2} />
        <MiniNode x={302} y={12} file="icons/database.svg" label="B" glow={packetT > 0.8} />
        <div
          style={{
            position: "absolute",
            left: packetX,
            top: 58,
            width: 16,
            height: 16,
            marginLeft: -8,
            borderRadius: 99,
            background: GLOW_COLOR,
            boxShadow: `0 0 0 4px rgba(124,231,255,0.18), 0 0 18px ${GLOW_COLOR}`,
            opacity: draw,
          }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        {tags.map((label, index) => (
          <span key={label} style={{ opacity: index < tagCount ? 1 : 0.2 }}>
            <Tag label={label} active={index < tagCount} />
          </span>
        ))}
      </div>
    </div>
  );
};

const StillMock: FC<{ fade: number; title: string; file: string }> = ({ fade, title, file }) => (
  <div
    style={{
      width: 156,
      height: 172,
      borderRadius: 16,
      background: "#101828",
      border: "1px solid rgba(255,255,255,0.1)",
      opacity: 0.62 + fade * 0.38,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 96,
        background: "linear-gradient(180deg, #24324A 0%, #182234 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconImg file={file} size={36} />
    </div>
    <div style={{ padding: "12px 12px 0" }}>
      <div style={{ height: 8, width: "72%", borderRadius: 99, background: "rgba(255,255,255,0.16)" }} />
      <div
        style={{
          height: 8,
          width: "46%",
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
          marginTop: 8,
        }}
      />
      <Txt style={{ marginTop: 12, fontSize: 13, color: "#8EA0C2", letterSpacing: "0.06em" }}>{title}</Txt>
    </div>
  </div>
);

const CanvaBody: FC<{ frame: number }> = ({ frame }) => {
  const fadeA = linearT(frame, canvaHold + 6, canvaHold + 36);
  const fadeB = linearT(frame, canvaHold + 24, canvaHold + 54);
  return (
    <div style={{ width: "100%", height: 268 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <StillMock fade={fadeA} title="SNS 静止画" file="icons/image.svg" />
        <StillMock fade={fadeB} title="一括 / 静的" file="icons/share.svg" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <Tag label="軽いフェード" />
        <Tag label="周辺エクスポート" />
      </div>
    </div>
  );
};

const LayerCard: FC<{
  id: LayerId;
  kicker: string;
  title: string;
  icon: string;
  focused: boolean;
  dim: number;
  appear: number;
  children: ReactNode;
}> = ({ id, kicker, title, icon, focused, dim, appear, children }) => {
  const layer = LAYERS[id];
  return (
    <div
      style={{
        position: "absolute",
        left: layer.x,
        top: layer.y + (1 - appear) * 16,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 22,
        background: "linear-gradient(180deg, #1A2438 0%, #121A2B 100%)",
        border: focused ? `2px solid ${layer.accent}` : "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: focused
          ? `0 0 0 5px ${layer.accent}33, 0 0 28px ${layer.accent}55, 0 18px 40px rgba(0,0,0,0.32)`
          : "0 18px 40px rgba(0,0,0,0.28)",
        opacity: appear * dim,
        overflow: "hidden",
        padding: "0 28px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "calc(100% + 56px)",
          marginLeft: -28,
          height: 6,
          background: layer.accent,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, marginBottom: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#101828",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <IconImg file={icon} size={30} />
        </div>
        <div>
          <Txt style={{ fontSize: 14, letterSpacing: "0.16em", color: "#8EA0C2", fontWeight: 600 }}>
            {kicker}
          </Txt>
          <Txt style={{ fontSize: 30, fontWeight: 700, color: "#F4F7FF", letterSpacing: "0.03em" }}>
            {title}
          </Txt>
        </div>
      </div>
      {children}
    </div>
  );
};

const FlowArrow: FC<{
  fromX: number;
  toX: number;
  y: number;
  progress: number;
  label: string;
  done: boolean;
}> = ({ fromX, toX, y, progress, label, done }) => {
  const width = toX - fromX;
  const color = done ? SUCCESS_COLOR : PATH_COLOR;
  return (
    <div style={{ position: "absolute", left: fromX, top: y - 28, width, height: 56, opacity: progress }}>
      <svg width={width} height={56} style={{ overflow: "visible" }}>
        <defs>
          <marker id={`arrow-${fromX}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill={color} />
          </marker>
        </defs>
        <line
          x1={8}
          y1={36}
          x2={width - 8}
          y2={36}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          markerEnd={`url(#arrow-${fromX})`}
          opacity={0.85}
        />
      </svg>
      <Txt
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          textAlign: "center",
          fontSize: 17,
          fontWeight: 700,
          color: done ? SUCCESS_COLOR : "#C5D3EE",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </Txt>
    </div>
  );
};

const StaffNote: FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      left: (WIDTH - 420) / 2,
      top: STAFF_Y,
      width: 420,
      height: 48,
      borderRadius: 999,
      background: "rgba(16, 24, 40, 0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      opacity,
    }}
  >
    <IconImg file="icons/compass.svg" size={22} />
    <Txt style={{ fontSize: 18, color: STAFF_ACCENT, fontWeight: 600 }}>判断が必要なら 参謀へ</Txt>
  </div>
);

const BotBar: FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      left: 140,
      right: 140,
      top: BOT_Y,
      height: 72,
      borderRadius: 18,
      background: "linear-gradient(180deg, #182236 0%, #121A2B 100%)",
      border: "1.5px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      padding: "0 22px",
      gap: 22,
      opacity,
      boxSizing: "border-box",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      <IconImg file="icons/bot.svg" size={28} />
      <div>
        <Txt style={{ fontSize: 13, color: BOT_ACCENT, letterSpacing: "0.12em", fontWeight: 700 }}>
          REMOTION担当（BOT）
        </Txt>
        <Txt style={{ fontSize: 18, color: "#EBF0FA", fontWeight: 700 }}>コード整理・重複排除・共有モジュール</Txt>
      </div>
    </div>
    <Txt style={{ fontSize: 22, color: "#6D7F9E", fontWeight: 700 }}>≠</Txt>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      <IconImg file="icons/palette.svg" size={28} />
      <div>
        <Txt style={{ fontSize: 13, color: DESA_ACCENT, letterSpacing: "0.12em", fontWeight: 700 }}>デザ</Txt>
        <Txt style={{ fontSize: 18, color: "#EBF0FA", fontWeight: 700 }}>見た目の方向（ビジュアルディレクション）</Txt>
      </div>
    </div>
  </div>
);

export const VizStackRoles: FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const focused = focusedLayer(frame);
  const zoomed = cam.scale > 1.04;
  const titleOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * (zoomed ? 0.18 : 1);
  const cardsAppear = linearT(frame, 10, 48);
  const arrowA = linearT(frame, flowHold, flowHold + 22);
  const arrowB = linearT(frame, flowHold + 16, flowHold + 38);
  const staff = linearT(frame, flowHold + 28, flowHold + 52);
  const bot = linearT(frame, botAt, botAt + 24);
  const done = frame >= botAt;
  const caption = captionFor(frame);
  const captionOpacity = interpolate(
    frame,
    [0, 12, DURATION - 18, DURATION],
    [0, 1, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const dimFor = (id: LayerId) => {
    if (!focused) {
      return 1;
    }
    return focused === id ? 1 : 0.28;
  };

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 55% at 50% 42%, #13203a 0%, #121726 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 48%, #050814 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <LayerCard
          id="icons"
          kicker="部品"
          title="部品アイコン"
          icon="icons/box.svg"
          focused={focused === "icons"}
          dim={dimFor("icons")}
          appear={cardsAppear}
        >
          <IconsBody frame={frame} />
        </LayerCard>
        <LayerCard
          id="remotion"
          kicker="本編"
          title="Remotion"
          icon="icons/clapperboard.svg"
          focused={focused === "remotion"}
          dim={dimFor("remotion")}
          appear={cardsAppear}
        >
          <RemotionBody frame={frame} />
        </LayerCard>
        <LayerCard
          id="canva"
          kicker="周辺"
          title="Canva"
          icon="icons/image.svg"
          focused={focused === "canva"}
          dim={dimFor("canva")}
          appear={cardsAppear}
        >
          <CanvaBody frame={frame} />
        </LayerCard>

        <FlowArrow
          fromX={LAYERS.icons.x + CARD_W * 0.55}
          toX={LAYERS.remotion.x + CARD_W * 0.45}
          y={FLOW_Y}
          progress={focused ? 0 : Math.max(cardsAppear * 0.45, arrowA)}
          label={done ? "本編へ" : "置く"}
          done={done}
        />
        <FlowArrow
          fromX={LAYERS.remotion.x + CARD_W * 0.55}
          toX={LAYERS.canva.x + CARD_W * 0.45}
          y={FLOW_Y}
          progress={focused ? 0 : Math.max(cardsAppear * 0.45, arrowB)}
          label="任意"
          done={done}
        />

        <StaffNote opacity={staff} />
        <BotBar opacity={bot} />
      </div>

      <Txt
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.06em",
          opacity: titleOpacity,
        }}
      >
        可視化スタックの役割
      </Txt>
      <Txt
        style={{
          position: "absolute",
          top: 102,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 20,
          fontWeight: 500,
          color: "#8EA0C2",
          letterSpacing: "0.18em",
          opacity: titleOpacity,
        }}
      >
        部品アイコン → 本編 Remotion → 周辺 Canva
      </Txt>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 42,
          textAlign: "center",
          opacity: captionOpacity,
        }}
      >
        <Txt
          style={{
            fontSize: 14,
            letterSpacing: "0.22em",
            color: "#6D7F9E",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          {caption.kicker}
        </Txt>
        <Txt style={{ fontSize: 26, fontWeight: 600, color: "#C5D3EE" }}>{caption.line}</Txt>
      </div>
    </AbsoluteFill>
  );
};

export const VIZ_STACK_ROLES = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
