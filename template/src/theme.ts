export const C = {
  black: '#000000',
  concrete: '#F4F4F0',
  white: '#FFFFFF',
  red: '#FF2A2A',
  yellow: '#FFE600',
  acid: '#CCFF00',
  volt: '#00E5FF',
};

export const FONT_DISPLAY = '"Arial Black", "Arial Bold", Impact, sans-serif';
export const FONT_MONO = 'Consolas, "Courier New", monospace';

export const HARD = (x = 8, y = 8, color = C.black) => `${x}px ${y}px 0px ${color}`;

export const BORDER = (w = 6, color = C.black) => `${w}px solid ${color}`;

export const FPS = 60;
export const W = 1080;
export const H = 1920;

/** seconds -> frames */
export const f = (sec: number) => Math.round(sec * FPS);
