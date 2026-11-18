# Pacing: cut rhythm that stays readable

## Shot length

| Purpose | Length |
|---|---|
| Establishing / explaining shot | 1.8 - 3.0 s |
| Supporting shot | 1.2 - 1.8 s |
| Payoff beat (hit, reveal, question mark) | 0.9 - 1.3 s |
| Hyperframe collage card | 0.12 - 0.18 s, inside one 2-3 s block |
| Closing montage shot | about 1.0 s |

Under ~0.9 s the viewer registers motion but not content. Use short shots only for beats that
ARE the content (an impact, a flash, a card slam), never for a shot carrying information.

A new angle, graphic hit or speed change every 1.2 - 2.2 s keeps retention without turning the
video into noise.

## The non-negotiable check

    block_frames * speed / 60 + clip_from <= clip_duration

Break it and the block freezes on its last frame (or goes black) for the remainder.
scripts/check_overruns.py verifies every block; run it before every render.

## Speed

- Slow motion for the moment that matters (a release, a separation): speed 0.42 - 0.55.
- Mild acceleration for travel shots: speed 1.1 - 1.35.
- Speed multiplies the source time consumed, so a fast block runs out of clip sooner.

## Impact grammar

- ImpactFrame (2 frames, inverted) on hard cuts and reveals.
- Flash (3-4 frames) on an explosion or an energy discharge.
- Shake with amount 5 - 12 during dives, hits and system failures.
- GlitchSlices only where something is breaking; used everywhere it reads as a broken render.

## Pay off what you set up

If a sentence says a weapon dives at 260 km/h, the dive plays there AND the hit that follows is
on screen. A dive that cuts away before impact feels unfinished, which is usually the real
reason an edit does not land even when every clip matches its sentence.
