import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/** Channel logo bug: small pill, top centre, inside the Reels/Shorts safe zone. */
export const LogoBug: React.FC<{y?: number; width?: number}> = ({y = 96, width = 300}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 10, fps, config: {stiffness: 180, damping: 18}});
  const appear = interpolate(s, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img
        src={staticFile('logo.png')}
        style={{
          position: 'absolute',
          top: y,
          left: (1080 - width) / 2,
          width,
          height: 'auto',
          opacity: 0.96,
          transform: `scale(${appear})`,
          filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.85))',
        }}
      />
    </AbsoluteFill>
  );
};
