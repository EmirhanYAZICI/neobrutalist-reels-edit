/**
 * Theme presets. Every component reads colours through `C` in theme.ts, so switching
 * `ACTIVE_THEME` in config.ts restyles the whole edit without touching a single scene.
 *
 * The seven colour slots keep their names across themes so components stay generic:
 *   ink      - the deep background
 *   surface  - the card / panel fill
 *   text     - headline + subtitle fill
 *   danger   - threat, rejection, primary alert
 *   warn     - emphasis, stamps, counters
 *   primary  - the signature accent
 *   info     - secondary accent, telemetry
 */
export type ThemeName =
  | 'tactical'
  | 'midnight'
  | 'stadium'
  | 'inferno'
  | 'acidlab'
  | 'mono'
  | 'royal'
  | 'arctic';

export type Texture = 'grid' | 'halftone' | 'pinstripe' | 'none';

export type Theme = {
  label: string;
  note: string;
  colors: {
    ink: string;
    surface: string;
    text: string;
    danger: string;
    warn: string;
    primary: string;
    info: string;
  };
  /** structural weight of the Neobrutalist frame */
  borderWidth: number;
  shadow: number;
  /** 0 = no film grain, 0.1 = heavy */
  grain: number;
  texture: Texture;
  /** backdrop brightness behind the hero window */
  backdropBrightness: number;
  /** colour of the broadcast chrome lines and timecode */
  chrome: string;
  /** colour of the accent words in subtitles */
  subtitleAccent: string;
};

export const THEMES: Record<ThemeName, Theme> = {
  /** Defence / aviation. The original Tactical Neobrutalism. */
  tactical: {
    label: 'Tactical',
    note: 'Defence, aviation, hardware. Black and concrete with signal red and acid green.',
    colors: {
      ink: '#000000',
      surface: '#F4F4F0',
      text: '#FFFFFF',
      danger: '#FF2A2A',
      warn: '#FFE600',
      primary: '#CCFF00',
      info: '#00E5FF',
    },
    borderWidth: 6,
    shadow: 10,
    grain: 0.06,
    texture: 'grid',
    backdropBrightness: 0.58,
    chrome: 'rgba(255,255,255,0.78)',
    subtitleAccent: '#FFE600',
  },

  /** Dark tech / night. Deep navy with ice blue and electric cyan. */
  midnight: {
    label: 'Midnight',
    note: 'Night tech, AI, software, finance. Deep navy with ice blue and cyan.',
    colors: {
      ink: '#05070F',
      surface: '#E8EEF8',
      text: '#FFFFFF',
      danger: '#FF3B6B',
      warn: '#8AB4FF',
      primary: '#00D1FF',
      info: '#6C5CE7',
    },
    borderWidth: 6,
    shadow: 10,
    grain: 0.05,
    texture: 'grid',
    backdropBrightness: 0.5,
    chrome: 'rgba(160,200,255,0.8)',
    subtitleAccent: '#00D1FF',
  },

  /** Sports broadcast. Navy and cream with signal orange, pinstriped. */
  stadium: {
    label: 'Stadium',
    note: 'Sports, baseball, match recaps. Navy and cream with signal orange, pinstriped.',
    colors: {
      ink: '#0B1B33',
      surface: '#F7F3E8',
      text: '#FFFFFF',
      danger: '#E4322B',
      warn: '#FF8A00',
      primary: '#F7F3E8',
      info: '#2E6FDB',
    },
    borderWidth: 7,
    shadow: 11,
    grain: 0.07,
    texture: 'pinstripe',
    backdropBrightness: 0.55,
    chrome: 'rgba(255,255,255,0.85)',
    subtitleAccent: '#FF8A00',
  },

  /** Motorsport / action. Black with ember orange and hot red. */
  inferno: {
    label: 'Inferno',
    note: 'Motorsport, action, hype. Black with ember orange and hot red.',
    colors: {
      ink: '#0A0604',
      surface: '#F3E9E2',
      text: '#FFFFFF',
      danger: '#FF2D00',
      warn: '#FFB300',
      primary: '#FF6B00',
      info: '#FFE0B2',
    },
    borderWidth: 7,
    shadow: 12,
    grain: 0.08,
    texture: 'halftone',
    backdropBrightness: 0.52,
    chrome: 'rgba(255,180,120,0.8)',
    subtitleAccent: '#FF8A1F',
  },

  /** Science / lab. Bone white base with acid green and magenta. */
  acidlab: {
    label: 'Acid Lab',
    note: 'Science, biotech, data. Bone white with acid green and magenta.',
    colors: {
      ink: '#121212',
      surface: '#EFEFE6',
      text: '#FFFFFF',
      danger: '#FF0090',
      warn: '#D7FF3E',
      primary: '#A6FF00',
      info: '#00E0B8',
    },
    borderWidth: 6,
    shadow: 10,
    grain: 0.06,
    texture: 'halftone',
    backdropBrightness: 0.6,
    chrome: 'rgba(214,255,120,0.8)',
    subtitleAccent: '#A6FF00',
  },

  /** Pure brutalism. Black, white, one yellow accent. */
  mono: {
    label: 'Mono',
    note: 'Editorial, essays, minimal. Pure black and white with one yellow accent.',
    colors: {
      ink: '#000000',
      surface: '#FFFFFF',
      text: '#FFFFFF',
      danger: '#000000',
      warn: '#FFE600',
      primary: '#FFFFFF',
      info: '#9E9E9E',
    },
    borderWidth: 8,
    shadow: 12,
    grain: 0.04,
    texture: 'none',
    backdropBrightness: 0.45,
    chrome: 'rgba(255,255,255,0.9)',
    subtitleAccent: '#FFE600',
  },

  /** History / luxury. Deep plum with gold and bone. */
  royal: {
    label: 'Royal',
    note: 'History, luxury, documentary. Deep plum with gold and bone.',
    colors: {
      ink: '#140B1F',
      surface: '#F2E9D8',
      text: '#FFFFFF',
      danger: '#C2185B',
      warn: '#E8C56B',
      primary: '#D4AF37',
      info: '#9C7BD0',
    },
    borderWidth: 6,
    shadow: 11,
    grain: 0.07,
    texture: 'grid',
    backdropBrightness: 0.5,
    chrome: 'rgba(232,197,107,0.82)',
    subtitleAccent: '#E8C56B',
  },

  /** Winter / clean. Ice white with cobalt and glacier blue. */
  arctic: {
    label: 'Arctic',
    note: 'Winter, travel, clean product. Ice white with cobalt and glacier blue.',
    colors: {
      ink: '#0E1A24',
      surface: '#F2FAFF',
      text: '#FFFFFF',
      danger: '#FF4D4D',
      warn: '#7FE3FF',
      primary: '#E8F7FF',
      info: '#0057FF',
    },
    borderWidth: 6,
    shadow: 10,
    grain: 0.05,
    texture: 'grid',
    backdropBrightness: 0.62,
    chrome: 'rgba(255,255,255,0.85)',
    subtitleAccent: '#7FE3FF',
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
