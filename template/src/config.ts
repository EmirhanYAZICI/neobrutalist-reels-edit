import type {ThemeName} from './themes';

/**
 * Pick the look of the whole edit here.
 *
 * tactical | midnight | stadium | inferno | acidlab | mono | royal | arctic
 *
 * Every component reads its colours, border weight, shadow, grain and texture from the
 * active theme, so one line restyles the entire video.
 */
export const ACTIVE_THEME: ThemeName = 'tactical';

/** Slate tag drawn top-left by Chrome.tsx. Set it to the subject of the video. */
export const SLATE_TAG = 'YOUR SUBJECT HERE';

/** Small label under the bottom hairline. Set it to your channel or topic line. */
export const FOOTER_TAG = 'YOUR CHANNEL // TOPIC';
