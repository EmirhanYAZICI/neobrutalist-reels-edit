import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, CHROME, FONT_MONO} from '../theme';

const L = 24;      // left rail
const R = 1056;    // right rail
const TOP = 236;   // top hairline, under the logo
const BOT = 1286;  // bottom hairline, above the subtitle line
const TICK = 44;

const Tick: React.FC<{x: number; y: number; dx: number; dy: number}> = ({x, y, dx, dy}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: Math.min(x, x + dx * TICK),
        top: y,
        width: TICK,
        height: 3,
        backgroundColor: CHROME,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: x,
        top: Math.min(y, y + dy * TICK),
        width: 3,
        height: TICK,
        backgroundColor: CHROME,
      }}
    />
  </>
);

/** Tactical broadcast chrome: corner ticks, hairlines, slate tag and running timecode. */
export const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const total = Math.floor(frame / 60);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  const ff = String(frame % 60).padStart(2, '0');
  const rec = Math.floor(frame / 30) % 2 === 0;

  const hair: React.CSSProperties = {
    position: 'absolute',
    left: L,
    width: R - L,
    height: 2,
    backgroundColor: CHROME,
    opacity: 0.3,
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...hair, top: TOP}} />
      <div style={{...hair, top: BOT}} />

      <Tick x={L} y={TOP} dx={1} dy={1} />
      <Tick x={R} y={TOP} dx={-1} dy={1} />
      <Tick x={L} y={BOT} dx={1} dy={-1} />
      <Tick x={R} y={BOT} dx={-1} dy={-1} />

      <div
        style={{
          position: 'absolute',
          top: TOP - 40,
          left: L + 4,
          fontFamily: FONT_MONO,
          fontSize: 24,
          letterSpacing: 4,
          color: CHROME,
        }}
      >
        SKYDAGGER × EJDERHA
      </div>

      <div
        style={{
          position: 'absolute',
          top: TOP - 40,
          right: 1080 - R + 4,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: FONT_MONO,
          fontSize: 24,
          letterSpacing: 3,
          color: CHROME,
        }}
      >
        <span style={{color: C.red, opacity: rec ? 1 : 0.25, fontSize: 20}}>●</span>
        <span>{`${mm}:${ss}:${ff}`}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: BOT + 12,
          left: L + 4,
          fontFamily: FONT_MONO,
          fontSize: 20,
          letterSpacing: 5,
          color: CHROME,
          opacity: 0.6,
        }}
      >
        TR // SAVUNMA SANAYİİ
      </div>
    </AbsoluteFill>
  );
};
