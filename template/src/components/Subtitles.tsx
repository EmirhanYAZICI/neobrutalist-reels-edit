import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_DISPLAY, SUBTITLE_ACCENT} from '../theme';
import {SUBS} from '../data/subtitles';

/** Words that get the tactical yellow accent, like the reference channel's style. */
const ACCENT = [
  'tesadüf', 'mü?', 'TB2\'nin', 'Skydagger', '260', 'kilometre', 'mühimmatlar',
  'kabus', 'TB3', 'Kızılelma\'nın', 'yüzlerce', 'dronluk', 'simetrik', 'olacak?',
  'Aselsan', 'Ejderha.', 'Ejderha', 'mikrodalga', 'aviyonik', 'saldırıyor.',
  'panzehirini', 'dominasyonuna', 'mevcut', 'mu?', 'küle', 'kalkanı',
];

const isAccent = (w: string) => ACCENT.includes(w.replace(/[",]/g, ''));

/** Turkish-correct uppercase: İSTANBUL, not ISTANBUL. */
const upper = (s: string) => s.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');

export const Subtitles: React.FC<{y?: number}> = ({y = 1340}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const active = SUBS.find((c) => t >= c.start && t < c.end + 0.12);
  if (!active) return null;

  const startFrame = Math.round(active.start * fps);
  const local = frame - startFrame;
  const s = spring({frame: local, fps, config: {stiffness: 300, damping: 16, mass: 0.6}});
  const scale = interpolate(s, [0, 1], [0.76, 1]);
  const words = active.text.split(' ');

  const text = upper(active.text);
  // single line, auto-fitted: never wrap, never collide with the logo or the frame edge
  const gaps = 14 * Math.max(0, words.length - 1);
  // Arial Black advances ~0.78 em per glyph and the 2.5 px stroke widens it further,
  // so fit against a 980 px safe width instead of guessing.
  const fontSize = Math.max(24, Math.min(48, Math.floor((980 - gaps) / (text.length * 0.78))));

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: y,
          left: 0,
          width: 1080,
          display: 'flex',
          gap: '0 14px',
          justifyContent: 'center',
          alignItems: 'baseline',
          whiteSpace: 'nowrap',
          transform: `scale(${scale})`,
        }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize,
              lineHeight: 1.1,
              color: isAccent(w) ? SUBTITLE_ACCENT : C.white,
              WebkitTextStroke: `2.5px ${C.black}`,
              paintOrder: 'stroke fill',
              textShadow: `4px 4px 0px ${C.black}`,
              letterSpacing: -0.5,
            }}
          >
            {upper(w)}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
