import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Clip} from '../components/Clip';
import {BrutalCard, GiantQ, SpeedCounter, TargetBox} from '../components/Graphics';
import {Flash, ImpactFrame, Shake} from '../components/Fx';
import {C} from '../theme';

/* ------------------------------------------------------------------ layout
 * Hero window: 1040 px wide 16:9 at y=600 (see references/layout.md).
 * Cards live in the bands above (CARD_TOP) and below (CARD_BOT) the window,
 * the subtitle line sits at y=1340, the logo at the top.
 * Split screen: two 860 px windows at y=330 and y=848.
 */
export const WIN_W = 1040;
export const WIN_TOP = 600;
export const WIN_H = Math.round((WIN_W * 9) / 16);
const CARD_TOP = 430;
const CARD_BOT = 1186;
const SPLIT_W = 860;
const SPLIT_TOP_Y = 330;
const SPLIT_BOT_Y = 848;

/** One shot. `from`/`durationInFrames` are frames at 60 fps, derived from the voiceover. */
const S: React.FC<{from: number; durationInFrames: number; children: React.ReactNode}> = ({
  from,
  durationInFrames,
  children,
}) => (
  <Sequence from={from} durationInFrames={durationInFrames} layout="none">
    {children}
  </Sequence>
);

const Base: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: C.black}}>{children}</AbsoluteFill>
);

/** Split screen + the hook question. */
export const Scene1: React.FC = () => (
  <Base>
    <S from={0} durationInFrames={160}>
      <AbsoluteFill>
        <Clip src="clips/a.mp4" zoom={[1.0, 1.08]} winWidth={SPLIT_W} winTop={SPLIT_TOP_Y} />
        <Clip
          src="clips/b.mp4"
          zoom={[1.0, 1.07]}
          winWidth={SPLIT_W}
          winTop={SPLIT_BOT_Y}
          backdrop={false}
        />
        <BrutalCard label="SALDIRI" at={6} bg={C.red} from="left" style={{top: 252, left: 120}} fontSize={48} />
        <BrutalCard label="KALKAN" at={14} bg={C.acid} from="right" style={{top: 756, right: 120}} fontSize={48} />
        <Flash at={0} frames={4} />
      </AbsoluteFill>
    </S>

    <S from={160} durationInFrames={140}>
      <AbsoluteFill>
        <Shake amount={7} speed={0.7}>
          <Clip src="clips/a.mp4" zoom={[1.04, 1.18]} speed={0.85} />
        </Shake>
        <ImpactFrame at={14} frames={2} />
        <GiantQ at={16} color={C.yellow} size={560} top={560} />
      </AbsoluteFill>
    </S>
  </Base>
);

/** Hero shot with a tracked target box and a counter rolling to its number. */
export const Scene2: React.FC = () => (
  <Base>
    <S from={0} durationInFrames={150}>
      <AbsoluteFill>
        <Clip src="clips/b.mp4" zoom={[1.0, 1.07]} />
        <TargetBox at={10} x={320} y={760} w={440} h={300} label="TARGET // LOCK" />
        <BrutalCard label="[ ÖRNEK KART ]" at={8} bg={C.concrete} from="left" style={{top: CARD_TOP, left: 70}} fontSize={50} mono />
      </AbsoluteFill>
    </S>

    <S from={150} durationInFrames={150}>
      <AbsoluteFill>
        <Shake amount={5} speed={0.8}>
          <Clip src="clips/a.mp4" zoom={[1.0, 1.12]} speed={0.95} />
        </Shake>
        <SpeedCounter at={8} to={260} style={{top: CARD_TOP - 50, right: 70}} />
        <BrutalCard label="TERMİNAL DALIŞ" at={70} bg={C.red} color={C.white} from="left" style={{top: CARD_BOT, left: 70}} fontSize={48} />
      </AbsoluteFill>
    </S>
  </Base>
);
