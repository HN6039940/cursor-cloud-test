import type { FC } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

const NODES = [
  { label: "Client", hint: "クライアント", color: "#5b8def" },
  { label: "LB", hint: "ロードバランサ", color: "#3ecf8e" },
  { label: "App", hint: "アプリケーション", color: "#f0c14b" },
  { label: "DB", hint: "データベース", color: "#c084fc" },
] as const;

const CAPTIONS = [
  "クライアントがリクエストを送る",
  "ロードバランサが振り分ける",
  "アプリケーションが処理する",
  "データベースへ到達する",
] as const;

const BOX_W = 280;
const BOX_H = 168;
const STAGE_W = 1600;
const GAP = (STAGE_W - BOX_W * 4) / 3;
const BOX_Y = 40;
const ARROW_Y = BOX_Y + BOX_H / 2;

const NODE_START = 28;
const NODE_STAGGER = 42;
const ARROW_DELAY = 26;
const PACKET_START = 240;
const PACKET_END = 600;

const nodeLeft = (index: number) => index * (BOX_W + GAP);
const nodeCenterX = (index: number) => nodeLeft(index) + BOX_W / 2;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const appear = (frame: number, fps: number, start: number) => {
  if (frame < start) {
    return 0;
  }
  return clamp01(
    spring({
      frame: frame - start,
      fps,
      config: { damping: 18, mass: 0.7, stiffness: 120 },
      durationInFrames: 28,
    }),
  );
};

export const RequestFlow: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 18], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const packetT = interpolate(frame, [PACKET_START, PACKET_END], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const packetVisible = frame >= PACKET_START && frame <= PACKET_END + 90;
  const segment = Math.min(2, Math.floor(packetT));
  const localT = interpolate(packetT - segment, [0, 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const packetX = interpolate(localT, [0, 1], [nodeCenterX(segment), nodeCenterX(segment + 1)]);
  const activeIndex =
    frame < PACKET_START ? -1 : packetT >= 2.92 ? 3 : Math.round(packetT);

  const caption =
    activeIndex >= 0 ? CAPTIONS[activeIndex] : "Client → LB → App → DB";
  const captionOpacity = interpolate(
    frame,
    [PACKET_START - 12, PACKET_START + 8],
    [0.55, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div className="request-flow" style={{ fontFamily: FONT_FAMILY }}>
      <div className="request-flow__vignette" />

      <h1
        className="request-flow__title"
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}
      >
        リクエストがサーバに届く流れ
      </h1>
      <p className="request-flow__subtitle" style={{ opacity: titleOpacity }}>
        Client → LB → App → DB
      </p>

      <div className="request-flow__stage">
        <svg className="arrow-layer" viewBox={`0 0 ${STAGE_W} 280`} fill="none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 1 1 L 9 5 L 1 9 Z" fill="#8ea0c2" />
            </marker>
          </defs>
          {NODES.slice(0, -1).map((_, index) => {
            const startX = nodeLeft(index) + BOX_W + 10;
            const endX = nodeLeft(index + 1) - 10;
            const length = endX - startX;
            const draw = clamp01(
              appear(frame, fps, NODE_START + index * NODE_STAGGER + ARROW_DELAY),
            );
            return (
              <line
                key={NODES[index].label}
                x1={startX}
                y1={ARROW_Y}
                x2={endX}
                y2={ARROW_Y}
                stroke="#8ea0c2"
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd={draw > 0.9 ? "url(#arrowhead)" : undefined}
                strokeDasharray={length}
                strokeDashoffset={length * (1 - draw)}
                opacity={draw === 0 ? 0 : 0.35 + draw * 0.65}
              />
            );
          })}
        </svg>

        {NODES.map((node, index) => {
          const progress = appear(frame, fps, NODE_START + index * NODE_STAGGER);
          const isActive = activeIndex === index;
          return (
            <div
              key={node.label}
              className="node"
              style={{
                left: nodeLeft(index),
                opacity: progress,
                transform: `translateY(${(1 - progress) * 28}px)`,
                boxShadow: isActive
                  ? `0 0 0 2px ${node.color}, 0 0 36px ${node.color}88`
                  : "0 18px 40px rgba(0, 0, 0, 0.28)",
              }}
            >
              <div className="node__bar" style={{ background: node.color }} />
              <div className="node__body">
                <NodeIcon kind={node.label} color={node.color} />
                <div className="node__label" style={{ color: node.color }}>
                  {node.label}
                </div>
                <div className="node__hint">{node.hint}</div>
              </div>
            </div>
          );
        })}

        {packetVisible ? (
          <div
            className="packet"
            style={{
              left: packetX,
              top: ARROW_Y,
              opacity: interpolate(
                frame,
                [PACKET_START, PACKET_START + 8, PACKET_END - 18, PACKET_END],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          />
        ) : null}
      </div>

      <p className="request-flow__caption" style={{ opacity: captionOpacity }}>
        <span className="request-flow__caption-kicker">REQUEST PATH</span>
        {caption}
      </p>
    </div>
  );
};

const NodeIcon: FC<{ kind: (typeof NODES)[number]["label"]; color: string }> = ({
  kind,
  color,
}) => {
  const common = {
    width: 36,
    height: 36,
    viewBox: "0 0 36 36",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "Client") {
    return (
      <svg {...common}>
        <rect x="5" y="7" width="26" height="16" rx="2" />
        <path d="M12 29h12M18 23v6" />
      </svg>
    );
  }
  if (kind === "LB") {
    return (
      <svg {...common}>
        <path d="M6 18h11" />
        <circle cx="20" cy="18" r="3.2" />
        <path d="M23 18l7-8M23 18h8M23 18l7 8" />
      </svg>
    );
  }
  if (kind === "App") {
    return (
      <svg {...common}>
        <rect x="8" y="8" width="20" height="20" rx="3" />
        <path d="M8 14h20M14 14v14" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <ellipse cx="18" cy="10" rx="10" ry="4" />
      <path d="M8 10v16c0 2.2 4.5 4 10 4s10-1.8 10-4V10" />
      <path d="M8 18c0 2.2 4.5 4 10 4s10-1.8 10-4" />
    </svg>
  );
};
