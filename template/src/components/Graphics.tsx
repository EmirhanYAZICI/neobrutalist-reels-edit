import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BORDER, C, FONT_DISPLAY, FONT_MONO, HARD} from '../theme';
import {GridTexture} from './Fx';

/** Video that fills its parent card box (used inside collages / PiP windows). */
export const BoxVideo: React.FC<{src: string; speed?: number}> = ({src, speed = 1}) => (
  <OffthreadVideo
    src={staticFile(src)}
    playbackRate={speed}
    muted
    style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.2) saturate(1.1)'}}
  />
);

/** Neobrutalist label card that slams in with spring physics. */
export const BrutalCard: React.FC<{
  label: string;
  at?: number;
  bg?: string;
  color?: string;
  from?: 'left' | 'right' | 'top' | 'bottom' | 'scale';
  style?: React.CSSProperties;
  fontSize?: number;
  mono?: boolean;
  grid?: boolean;
}> = ({
  label,
  at = 0,
  bg = C.concrete,
  color = C.black,
  from = 'left',
  style,
  fontSize = 56,
  mono = false,
  grid = true,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {stiffness: 220, damping: 14, mass: 0.7}});
  const off = interpolate(s, [0, 1], [1, 0]);
  const map: Record<string, string> = {
    left: `translateX(${-900 * off}px)`,
    right: `translateX(${900 * off}px)`,
    top: `translateY(${-500 * off}px)`,
    bottom: `translateY(${500 * off}px)`,
    scale: `scale(${interpolate(s, [0, 1], [0.3, 1])})`,
  };
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        transform: map[from],
        backgroundColor: bg,
        border: BORDER(6),
        boxShadow: HARD(10, 10),
        padding: '14px 26px',
        overflow: 'hidden',
        ...style,
      }}
    >
      {grid ? <GridTexture opacity={0.08} size={16} /> : null}
      <span
        style={{
          position: 'relative',
          fontFamily: mono ? FONT_MONO : FONT_DISPLAY,
          fontWeight: 900,
          fontSize,
          letterSpacing: mono ? 2 : -1,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
};

/** The giant Neobrutalist question mark. */
export const GiantQ: React.FC<{
  at: number;
  color?: string;
  size?: number;
  top?: number;
  char?: string;
}> = ({at, color = C.yellow, size = 760, top = 420, char = '?'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  const s = spring({frame: t, fps, config: {stiffness: 260, damping: 11, mass: 0.9}});
  const wig = Math.sin(t * 0.9) * interpolate(t, [0, 40], [9, 0], {extrapolateRight: 'clamp'});
  const rot = Math.sin(t * 0.35) * 2.2;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start'}}>
      <div
        style={{
          position: 'absolute',
          top,
          transform: `translateX(${wig}px) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.2, 1])})`,
          fontFamily: FONT_DISPLAY,
          fontSize: size,
          lineHeight: 0.85,
          color,
          WebkitTextStroke: `14px ${C.black}`,
          paintOrder: 'stroke fill',
          textShadow: HARD(22, 22),
        }}
      >
        {char}
      </div>
    </AbsoluteFill>
  );
};

/** Giant red cross drawn with stroke-dashoffset over a rejected concept. */
export const CrossOut: React.FC<{at: number; width?: number; height?: number; style?: React.CSSProperties}> = ({
  at,
  width = 620,
  height = 220,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const p1 = interpolate(t, [0, 8], [1, 0], {extrapolateRight: 'clamp'});
  const p2 = interpolate(t, [6, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const len = Math.hypot(width, height);
  return (
    <svg width={width} height={height} style={{position: 'absolute', ...style}}>
      <line
        x1={10} y1={10} x2={width - 10} y2={height - 10}
        stroke={C.red} strokeWidth={26} strokeLinecap="square"
        strokeDasharray={len} strokeDashoffset={len * p1}
      />
      <line
        x1={width - 10} y1={10} x2={10} y2={height - 10}
        stroke={C.red} strokeWidth={26} strokeLinecap="square"
        strokeDasharray={len} strokeDashoffset={len * p2}
      />
    </svg>
  );
};

/** 000 -> 260 KM/H counter roll. */
export const SpeedCounter: React.FC<{at: number; to?: number; style?: React.CSSProperties}> = ({
  at,
  to = 260,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  const s = spring({frame: t, fps, config: {stiffness: 200, damping: 16}});
  const val = Math.round(interpolate(t, [0, 34], [0, to], {extrapolateRight: 'clamp'}));
  const shake = t < 38 ? (random(`c${t}`) - 0.5) * 4 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        transform: `translateX(${interpolate(s, [0, 1], [700, 0])}px) translateY(${shake}px)`,
        backgroundColor: C.yellow,
        border: BORDER(6),
        boxShadow: HARD(10, 10),
        padding: '10px 22px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        ...style,
      }}
    >
      <span style={{fontFamily: FONT_MONO, fontWeight: 900, fontSize: 104, color: C.black, letterSpacing: -2}}>
        {String(val).padStart(3, '0')}
      </span>
      <span style={{fontFamily: FONT_DISPLAY, fontSize: 42, color: C.black}}>KM/H</span>
      <span style={{fontFamily: FONT_DISPLAY, fontSize: 46, color: C.red}}>▼</span>
    </div>
  );
};

/** Tactical target box locking onto the subject. */
export const TargetBox: React.FC<{
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  color?: string;
}> = ({at, x, y, w, h, label = 'TARGET LOCK', color = C.white}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  const s = spring({frame: t, fps, config: {stiffness: 200, damping: 18}});
  const grow = interpolate(s, [0, 1], [1.8, 1]);
  const corner = 44;
  const o = interpolate(t, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const blink = Math.floor(t / 10) % 2 === 0 ? 1 : 0.45;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scale(${grow})`,
        opacity: o,
      }}
    >
      {[
        {top: 0, left: 0, bt: true, bl: true},
        {top: 0, right: 0, bt: true, br: true},
        {bottom: 0, left: 0, bb: true, bl: true},
        {bottom: 0, right: 0, bb: true, br: true},
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: corner,
            height: corner,
            ...p,
            borderTop: (p as any).bt ? `8px solid ${color}` : undefined,
            borderBottom: (p as any).bb ? `8px solid ${color}` : undefined,
            borderLeft: (p as any).bl ? `8px solid ${color}` : undefined,
            borderRight: (p as any).br ? `8px solid ${color}` : undefined,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: -54,
          left: 0,
          backgroundColor: color === C.white ? C.black : color,
          color: color === C.white ? C.white : C.black,
          fontFamily: FONT_MONO,
          fontSize: 26,
          letterSpacing: 3,
          padding: '4px 12px',
          opacity: blink,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Scrolling tactical warning band. */
export const WarnBand: React.FC<{
  text: string;
  y: number;
  dir?: 1 | -1;
  bg?: string;
  color?: string;
  at?: number;
  speed?: number;
}> = ({text, y, dir = 1, bg = C.red, color = C.black, at = 0, speed = 9}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const x = ((t * speed * dir) % 1600) - 800;
  const line = new Array(6).fill(text).join('   ///   ');
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        width: 1080,
        overflow: 'hidden',
        backgroundColor: bg,
        borderTop: BORDER(6),
        borderBottom: BORDER(6),
        height: 86,
        display: 'flex',
        alignItems: 'center',
        transform: `rotate(${dir === 1 ? -1.2 : 1.2}deg)`,
        boxShadow: HARD(0, 8),
      }}
    >
      <span
        style={{
          transform: `translateX(${x}px)`,
          whiteSpace: 'nowrap',
          fontFamily: FONT_DISPLAY,
          fontSize: 48,
          color,
          letterSpacing: 2,
        }}
      >
        {line}
      </span>
    </div>
  );
};

/** HUD / visor frame with live-looking telemetry. */
export const HudFrame: React.FC<{at?: number; color?: string}> = ({at = 0, color = C.red}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const alt = 1200 - Math.round(t * 9.4);
  const spd = 180 + Math.round(Math.sin(t / 7) * 12 + t * 0.8);
  const blink = Math.floor(t / 8) % 2 === 0;
  const corners = [
    {top: 640, left: 70, r: 0},
    {top: 640, right: 70, r: 90},
    {top: 1040, left: 70, r: 270},
    {top: 1040, right: 70, r: 180},
  ];
  return (
    <AbsoluteFill>
      {corners.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...c,
            width: 110,
            height: 110,
            borderTop: `9px solid ${color}`,
            borderLeft: `9px solid ${color}`,
            transform: `rotate(${(c as any).r}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: 540,
          left: 0,
          width: 1080,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 30,
          color,
          letterSpacing: 4,
          opacity: blink ? 1 : 0.4,
        }}
      >
        ◉ TRACKING // LOCK
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1210,
          left: 90,
          fontFamily: FONT_MONO,
          fontSize: 28,
          color: C.white,
          letterSpacing: 3,
          textShadow: HARD(3, 3),
        }}
      >
        ALT {alt} M
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1210,
          right: 90,
          fontFamily: FONT_MONO,
          fontSize: 28,
          color: C.white,
          letterSpacing: 3,
          textShadow: HARD(3, 3),
        }}
      >
        SPD {spd} KM/H
      </div>
      <div
        style={{
          position: 'absolute',
          top: 940,
          left: 540 - 60,
          width: 120,
          height: 120,
          border: `5px solid ${color}`,
          borderRadius: '50%',
          opacity: 0.9,
        }}
      />
      <div style={{position: 'absolute', top: 894, left: 420, width: 240, height: 4, backgroundColor: color}} />
      <div style={{position: 'absolute', top: 836, left: 538, width: 4, height: 120, backgroundColor: color}} />
    </AbsoluteFill>
  );
};

/** Concentric EMP / microwave shock rings. */
export const EmpRings: React.FC<{
  at: number;
  x?: number;
  y?: number;
  color?: string;
  count?: number;
}> = ({at, x = 540, y = 820, color = C.volt, count = 5}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const local = t - i * 9;
        if (local < 0) return null;
        const r = interpolate(local, [0, 70], [40, 1500], {extrapolateRight: 'clamp'});
        const o = interpolate(local, [0, 70], [1, 0], {extrapolateRight: 'clamp'});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `${Math.max(4, 22 - i * 3)}px solid ${i % 2 ? C.acid : color}`,
              opacity: o,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Skydagger cutout multiplying into a swarm: 1 -> 4 -> 16 -> many. */
export const CloneSwarm: React.FC<{at: number; src?: string}> = ({at, src = 'skydager.jpg'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  const steps = [1, 4, 16, 40];
  const stage = t < 18 ? 0 : t < 34 ? 1 : t < 52 ? 2 : 3;
  const n = steps[stage];
  return (
    <AbsoluteFill>
      {new Array(n).fill(0).map((_, i) => {
        const bornAt = stage === 0 ? 0 : 0;
        const s = spring({frame: t - bornAt - (i % 8), fps, config: {stiffness: 180, damping: 13}});
        const col = n === 1 ? 1 : Math.ceil(Math.sqrt(n));
        const gx = (i % col) / Math.max(1, col - 1 || 1);
        const gy = Math.floor(i / col) / Math.max(1, Math.ceil(n / col) - 1 || 1);
        const size = n === 1 ? 700 : n === 4 ? 460 : n === 16 ? 250 : 165;
        const jitterX = (random(`x${i}`) - 0.5) * 70;
        const jitterY = (random(`y${i}`) - 0.5) * 70;
        const left = 60 + gx * (960 - size) + jitterX;
        const top = 330 + gy * (830 - size * 0.56) + jitterY;
        const bob = Math.sin((t + i * 7) / 9) * 10;
        return (
          <div
            key={`${stage}-${i}`}
            style={{
              position: 'absolute',
              left,
              top: top + bob,
              width: size,
              height: size * 0.56,
              border: '5px solid #000',
              boxShadow: HARD(8, 8),
              overflow: 'hidden',
              transform: `scale(${interpolate(s, [0, 1], [0.2, 1])})`,
              filter: 'contrast(1.2) saturate(0.9)',
            }}
          >
            <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Hyperframes: 12fps rapid match-cut collage of brutalist cards. */
export const HyperCollage: React.FC<{
  at: number;
  items: {src: string; label?: string}[];
  holdFrames?: number;
  renderItem?: (src: string) => React.ReactNode;
}> = ({at, items, holdFrames = 5, renderItem}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const shown = Math.min(items.length, Math.floor(t / holdFrames) + 1);
  return (
    <AbsoluteFill>
      {items.slice(0, shown).map((it, i) => {
        const rot = (random(`r${i}`) - 0.5) * 7;
        const left = 55 + (i % 2) * 150;
        const top = 280 + i * 200;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: 790,
              height: 390,
              transform: `rotate(${rot}deg)`,
              border: '8px solid #000',
              boxShadow: HARD(14, 14),
              backgroundColor: C.concrete,
              overflow: 'hidden',
            }}
          >
            {renderItem ? renderItem(it.src) : null}
            {it.label ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  backgroundColor: C.yellow,
                  borderTop: '6px solid #000',
                  borderRight: '6px solid #000',
                  padding: '4px 14px',
                  fontFamily: FONT_MONO,
                  fontSize: 26,
                  letterSpacing: 2,
                }}
              >
                {it.label}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Hard black split bar used for split-screen composition. */
export const SplitBar: React.FC<{y?: number; thickness?: number; diagonal?: boolean}> = ({
  y = 960,
  thickness = 16,
  diagonal = false,
}) =>
  diagonal ? (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <line x1={-100} y1={1750} x2={1180} y2={250} stroke="#000" strokeWidth={thickness} />
    </svg>
  ) : (
    <div
      style={{
        position: 'absolute',
        top: y - thickness / 2,
        left: 0,
        width: 1080,
        height: thickness,
        backgroundColor: C.black,
      }}
    />
  );
