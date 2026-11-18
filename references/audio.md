# Audio: measured, not guessed

## Targets

| Layer | Target |
|---|---|
| Voiceover | front, untouched except a 70 Hz high-pass |
| SFX one-shots | peak-normalised to -3 dBTP (never LUFS: a transient reads quiet and still clips) |
| Music bed | -20 LUFS, ducked under the voiceover |
| Master | two-pass loudnorm to -16 LUFS / -4.5 dBTP |

-4.5 on the master, not -4.0: the AAC encode adds 0.3 - 0.6 dB of true-peak overshoot, so a
-4.0 master fails the -4 dBTP gate after muxing.

## Before committing to a music bed

    ffmpeg -v info -t 60 -i bed.mp3 -af astats -f null -      # read "Noise floor dB"

Want below -45 dB. A noisy ambient bed (-20 dB noise floor, crest factor around 3) is heard as
constant crackle across the whole video and no mixing fixes it: replace the track. Compare with
the voiceover, which should read around -80 dB.

## Cue map

Write cues as [time_s, sfx_name, gain] in mix.json, taken from the same frame numbers the
scenes use (time = frame / 60). Typical set:

- scene cut: short whoosh 0.3 - 0.7
- card slam: shutter or thud 0.4 - 0.7
- giant question mark: riser into boom, boom at 0.9 - 1.0
- counter roll: three ticks at 0.25 - 0.3
- impact / explosion: impact 0.9 plus boom 0.6
- energy discharge: zap 0.9 - 1.0
- system failure: glitch at 0.12 - 0.2 (crackle only where something is breaking)
- closing montage: one whoosh per cut, 0.32 - 0.42

Keep glitch and static out of everywhere else; stray digital noise reads as a broken export.

## Ducking

sidechaincompress with the voiceover as sidechain: music threshold 0.025 ratio 9,
SFX threshold 0.05 ratio 4. Split the voiceover with asplit first, because the filter consumes
its sidechain input.

## Licensing

CC0 by default (fetch_sfx.py search --cc0-only). CC BY needs visible attribution; "hobby",
"non-commercial" and "I will not say where I got it" do not waive it. When the user wants no
credits line, swap every CC BY asset for a CC0 one instead of shipping unattributed CC BY.
