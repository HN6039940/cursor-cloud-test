import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const Txt: FC<{ style?: CSSProperties; children: ReactNode }> = ({ style, children }) => (
  <p style={{ margin: 0, ...style }}>{children}</p>
);

const FONT_FAMILY =
  '"WenQuanYi Micro Hei", "Droid Sans Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 300;

const CARDS = [
  { file: "icons/client.svg", label: "Client", accent: "#59A6FF" },
  { file: "icons/lb.svg", label: "LB", accent: "#4DD18C" },
  { file: "icons/app.svg", label: "App", accent: "#F0C14B" },
  { file: "icons/cache.svg", label: "Cache", accent: "#C084FC" },
  { file: "icons/db.svg", label: "DB", accent: "#A78BFA" },
] as const;

const CARD_W = 260;
const CARD_H = 300;
const GAP = 40;
const ROW_W = CARDS.length * CARD_W + (CARDS.length - 1) * GAP;
const ROW_LEFT = (WIDTH - ROW_W) / 2;
const ROW_TOP = 360;

export const IconNodes: FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#121726", fontFamily: FONT_FAMILY }}>
      <Txt
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 44,
          fontWeight: 700,
          color: "#F4F7FF",
          letterSpacing: "0.04em",
          opacity: titleOpacity,
        }}
      >
        ノードアイコン
      </Txt>
      <Txt
        style={{
          position: "absolute",
          top: 186,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          fontWeight: 500,
          color: "#8EA0C2",
          letterSpacing: "0.12em",
          opacity: titleOpacity,
        }}
      >
        Lucide SVG → Remotion Img
      </Txt>

      {CARDS.map((card, index) => {
        const appear = interpolate(frame, [10 + index * 8, 26 + index * 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(appear, [0, 1], [18, 0]);
        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: ROW_LEFT + index * (CARD_W + GAP),
              top: ROW_TOP + y,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 22,
              background: "linear-gradient(180deg, #1A2438 0%, #151C2C 100%)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
              opacity: appear,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 6,
                background: card.accent,
              }}
            />
            <Img
              src={staticFile(card.file)}
              style={{ width: 88, height: 88, marginTop: 56 }}
            />
            <Txt
              style={{
                marginTop: 28,
                fontFamily: FONT_FAMILY,
                fontSize: 32,
                fontWeight: 700,
                color: "#EBF0FA",
                letterSpacing: "0.04em",
              }}
            >
              {card.label}
            </Txt>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const ICON_NODES = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: DURATION,
} as const;
