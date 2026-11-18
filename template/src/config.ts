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
