import {THEMES} from './themes';
import {ACTIVE_THEME} from './config';

export const T = THEMES[ACTIVE_THEME];

/**
 * Colour slots. The keys are kept from the original Tactical palette so scenes written for
 * one theme render unchanged in every other: `C.red` is "the danger accent", not literally red.
 */
export const C = {
  black: T.colors.ink,
  concrete: T.colors.surface,
  white: T.colors.text,
  red: T.colors.danger,
  yellow: T.colors.warn,
  acid: T.colors.primary,
  volt: T.colors.info,
};

export const FONT_DISPLAY = '"Arial Black", "Arial Bold", Impact, sans-serif';
export const FONT_MONO = 'Consolas, "Courier New", monospace';

export const HARD = (x = T.shadow, y = T.shadow, color = C.black) => `${x}px ${y}px 0px ${color}`;

export const BORDER = (w = T.borderWidth, color = C.black) => `${w}px solid ${color}`;

/** Film grain strength for this theme (0 - 0.1). */
export const GRAIN = T.grain;
/** Brightness of the blurred backdrop behind the hero window. */
export const BACKDROP_BRIGHTNESS = T.backdropBrightness;
/** Colour of the broadcast chrome lines, ticks and timecode. */
export const CHROME = T.chrome;
/** Colour of accent words in subtitles. */
export const SUBTITLE_ACCENT = T.subtitleAccent;
/** Texture drawn behind cards and collage backgrounds. */
export const TEXTURE = T.texture;

export const FPS = 60;
export const W = 1080;
export const H = 1920;

/** seconds -> frames */
export const f = (sec: number) => Math.round(sec * FPS);
