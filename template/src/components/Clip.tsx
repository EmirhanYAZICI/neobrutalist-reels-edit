import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C} from '../theme';

export type ClipProps = {
  src: string;
  /** playback speed; <1 = slow motion, >1 = velocity ramp */
  speed?: number;
  /** trim inside the already-trimmed clip, in seconds */
  from?: number;
  /** horizontal focus point, 0 = left, 1 = right (only matters when zoomed in) */
  focusX?: number;
  /** start scale -> end scale inside the window (keep <= 1.25 to stay sharp) */
  zoom?: [number, number];
  grade?: boolean;
  filter?: string;
  /** window geometry: width in px and top edge; height follows 16:9 */
  winWidth?: number;
  winTop?: number;
  /** fill the whole 1080x1920 frame instead of using a window (soft, use sparingly) */
  fullBleed?: boolean;
  /** draw the blurred backdrop (turn off for the second window of a split screen) */
  backdrop?: boolean;
  border?: number;
  style?: React.CSSProperties;
};

const DEFAULT_GRADE = 'contrast(1.12) saturate(1.08) brightness(1.03)';

/**
 * 16:9 source shown inside a sharp Neobrutalist window (1920 -> 1000 px wide is a
 * downscale, so it stays crisp), over a blurred fill of the same frame so the
 * 9:16 canvas is never empty and nothing important gets cropped away.
 */
export const Clip: React.FC<ClipProps> = ({
  src,
  speed = 1,
  from = 0,
  focusX = 0.5,
  zoom = [1.0, 1.06],
  grade = true,
  filter,
  winWidth = 1040,
  winTop = 600,
  fullBleed = false,
  backdrop = true,
  border = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 180], zoom, {extrapolateRight: 'clamp'});
  const trim = Math.round(from * 60);
  const grading = filter ?? (grade ? DEFAULT_GRADE : undefined);
  const winH = Math.round((winWidth * 9) / 16);
  const offsetX = (0.5 - focusX) * winWidth * (scale - 1);

  if (fullBleed) {
    return (
      <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.black, ...style}}>
        <AbsoluteFill style={{transform: `scale(${scale})`}}>
          <OffthreadVideo
            src={staticFile(src)}
            playbackRate={speed}
            trimBefore={trim}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: grading}}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{overflow: 'hidden', backgroundColor: backdrop ? C.black : 'transparent', ...style}}
    >
      {/* blurred backdrop so the vertical canvas is filled without cropping the subject */}
      {backdrop ? <AbsoluteFill style={{transform: 'scale(1.25)'}}>
        <OffthreadVideo
          src={staticFile(src)}
          playbackRate={speed}
          trimBefore={trim}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(36px) brightness(0.58) saturate(1.25) contrast(1.02)',
          }}
        />
      </AbsoluteFill> : null}

      {/* sharp window */}
      <div
        style={{
          position: 'absolute',
          left: (1080 - winWidth) / 2,
          top: winTop,
          width: winWidth,
          height: winH,
          border: `${border}px solid ${C.black}`,
          boxShadow: `14px 14px 0px ${C.black}`,
          overflow: 'hidden',
          backgroundColor: C.black,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translateX(${offsetX}px) scale(${scale})`,
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            playbackRate={speed}
            trimBefore={trim}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: grading}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
