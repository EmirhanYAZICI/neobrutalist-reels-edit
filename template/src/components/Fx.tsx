import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';

/** Film grain + micro grid + vignette, laid over the whole video. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', opacity}}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
        </filter>
        <rect width="1080" height="1920" filter={`url(#grain${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Blueprint micro-grid, used as texture behind brutalist cards. */
export const GridTexture: React.FC<{color?: string; size?: number; opacity?: number}> = ({
  color = '#000',
  size = 22,
  opacity = 0.12,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }}
  />
);

/** 1-3 frame high contrast / inverted impact frame. */
export const ImpactFrame: React.FC<{at: number; frames?: number; invert?: boolean}> = ({
  at,
  frames = 2,
  invert = true,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= at + frames) return null;
  return (
    <AbsoluteFill
      style={{
        backdropFilter: invert
          ? 'invert(1) grayscale(1) contrast(2.2)'
          : 'grayscale(1) contrast(2.6) brightness(1.4)',
        background: invert ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.18)',
      }}
    />
  );
};

/** Hard white/black flash. */
export const Flash: React.FC<{at: number; frames?: number; color?: string}> = ({
  at,
  frames = 3,
  color = '#fff',
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + frames], [0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (frame < at) return null;
  return <AbsoluteFill style={{backgroundColor: color, opacity: o}} />;
};

/** Camera shake wrapper (turbulence / impact). */
export const Shake: React.FC<{
  amount?: number;
  speed?: number;
  rotate?: number;
  children: React.ReactNode;
}> = ({amount = 8, speed = 1, rotate = 0.4, children}) => {
  const frame = useCurrentFrame();
  const t = Math.floor(frame * speed);
  const x = (random(`sx${t}`) - 0.5) * amount * 2;
  const y = (random(`sy${t}`) - 0.5) * amount * 2;
  const r = (random(`sr${t}`) - 0.5) * rotate * 2;
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${r}deg)`}}>
      {children}
    </AbsoluteFill>
  );
};

/** RGB split / chromatic aberration pulse. */
export const RgbSplit: React.FC<{at: number; frames?: number; children: React.ReactNode}> = ({
  at,
  frames = 10,
  children,
}) => {
  const frame = useCurrentFrame();
  const active = frame >= at && frame < at + frames;
  const d = active ? interpolate(frame, [at, at + frames], [16, 0]) : 0;
  if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{filter: 'url(#none)', transform: `translateX(${-d}px)`, mixBlendMode: 'screen', opacity: 0.6}}
      >
        <AbsoluteFill style={{filter: 'sepia(1) saturate(8) hue-rotate(-50deg)'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{transform: `translateX(${d}px)`, mixBlendMode: 'screen', opacity: 0.6}}
      >
        <AbsoluteFill style={{filter: 'sepia(1) saturate(8) hue-rotate(150deg)'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Horizontal glitch slices. */
export const GlitchSlices: React.FC<{at: number; frames?: number}> = ({at, frames = 8}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= at + frames) return null;
  const slices = new Array(9).fill(0).map((_, i) => {
    const h = 1920 / 9;
    const dx = (random(`g${frame}${i}`) - 0.5) * 220;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * h,
          left: dx,
          width: 1080,
          height: h,
          backdropFilter: 'invert(1) grayscale(0.6) contrast(1.4)',
          opacity: random(`o${frame}${i}`) > 0.55 ? 0.85 : 0,
        }}
      />
    );
  });
  return <AbsoluteFill>{slices}</AbsoluteFill>;
};

/** Hard black bars closing the frame (blackout). */
export const Blackout: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return <AbsoluteFill style={{backgroundColor: C.black}} />;
};
