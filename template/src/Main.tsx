import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Scene1, Scene2} from './scenes/Scenes';
import {Subtitles} from './components/Subtitles';
import {LogoBug} from './components/LogoBug';
import {Chrome} from './components/Chrome';
import {Grain} from './components/Fx';
import {C, GRAIN} from './theme';

/**
 * Scene boundaries, in frames at 60 fps, taken from the voiceover word timestamps.
 * One entry per sentence group: a scene starts on the frame where its first word starts.
 */
export const SCENES = [
  {from: 0, duration: 300},    // 0.00 - 5.00 s
  {from: 300, duration: 300},  // 5.00 - 10.00 s
];

export const TOTAL_FRAMES = SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].duration;

export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.black}}>
    <Audio src={staticFile('voice.mp3')} volume={1} />

    <Sequence from={SCENES[0].from} durationInFrames={SCENES[0].duration} layout="none">
      <Scene1 />
    </Sequence>
    <Sequence from={SCENES[1].from} durationInFrames={SCENES[1].duration} layout="none">
      <Scene2 />
    </Sequence>

    {/* global layers: grain, broadcast chrome, subtitles, logo */}
    <Grain opacity={GRAIN} />
    <Sequence from={0} durationInFrames={TOTAL_FRAMES} layout="none">
      <Chrome />
      <Subtitles />
      <LogoBug />
    </Sequence>
  </AbsoluteFill>
);
