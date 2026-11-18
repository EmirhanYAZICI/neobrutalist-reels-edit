# Layout: the 1080x1920 grid

Everything is placed against fixed bands so the edit never collides with itself or with the
platform UI.

```
y=0      +------------------------------+
         |  logo bug             y=96   |   top safe zone
y=196    |  slate tag / timecode        |   Chrome.tsx
y=236    |  -- hairline + corner ticks  |
y=430    |  CARD_TOP band               |   cards above the window
y=600    |  +------------------------+  |
         |  |  HERO WINDOW 1040x585  |  |   Clip.tsx, sharp
y=1185   |  +------------------------+  |
y=1186   |  CARD_BOT band               |   cards below the window
y=1286   |  -- hairline + corner ticks  |
y=1340   |  SUBTITLE LINE (single)      |   Subtitles.tsx
y=1500+  |  reserved for Reels UI       |   keep empty
y=1920   +------------------------------+
```

## Why a window instead of a full-bleed crop

A 1920x1080 source filling 1080x1920 must be scaled to 3413 px wide: a 1.78x **upscale**, so
the picture goes soft and 70% of the frame is cropped away - subjects fall outside the frame.
Showing the same source 1040 px wide is a **downscale**, so it stays sharp and nothing is lost.
The rest of the canvas is filled with a blurred, darkened copy of the same frame
(blur 36px, brightness 0.58), which reads as depth rather than as empty black.

- Hero window: winWidth 1040, winTop 600 (the defaults).
- Split screen: two windows, winWidth 860 at winTop 330 and winTop 848. The second one must
  pass backdrop={false}, otherwise its backdrop paints over the first window.
- fullBleed exists for rare cases (a deliberately soft, dark background layer at low opacity).
  Never use it for a shot the viewer has to read.

## Zoom

Keep zoom inside [1.0, 1.25]. The window already downscales, so a little push-in stays sharp;
past ~1.3 you are upscaling again. Alternate direction per shot (in / out) so cuts do not feel
mechanical.

## Cards

- Above the window: top CARD_TOP, left 70 (or right 70).
- Below the window: top CARD_BOT, left 70.
- Split screen: above the top window (top 252) and between the two (top 756).
- A card is a 6px black border, 0 radius, 10px 10px 0 hard shadow, grid texture inside.

## Subtitles

One line, never wrapped. Subtitles.tsx fits the font to the text:

    fontSize = clamp(24, 48, (980 - gaps) / (chars * 0.78))

0.78 em per glyph is measured for Arial Black including the 2.5px stroke; 0.62 (the naive
advance width) overflows the frame. Accent words render in yellow, the rest white, each with a
hard black shadow and stroke so they survive any background.

Turkish uppercase needs an explicit pass:

    s.replace(/i/g, 'I-with-dot').replace(/dotless-i/g, 'I').toLocaleUpperCase('tr-TR')

CSS text-transform uppercase produces SIZCE instead of SiZCE with the dot.
