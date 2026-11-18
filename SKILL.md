---
name: neobrutalist-reels-edit
description: Use when turning raw footage plus a single voiceover file into a vertical 9:16 Reels/Shorts edit with Tactical Neobrutalism design - word-level subtitle sync, sentence-to-shot matching, Remotion motion graphics (giant ?, counters, HUD, EMP rings, clone swarms), OP-montage pacing, hyperframe collages, CC0 SFX and a measured audio master. Triggers on "dikey kurgu", "reels kurgu", "shorts edit", "neobrutalist edit", "seslendirmeye göre kurgu", "savunma sanayii videosu".
---

# Neobrutalist Reels Edit

Turns a folder of raw clips + one voiceover file into a finished 1080x1920 60fps edit where
**every sentence lands on the shot that shows what it says**, with a consistent Tactical
Neobrutalism design system and a measured audio master.

Everything here is measured, never guessed: subtitle timings come from word-level ASR, shot
choices come from contact sheets you actually look at, clip lengths are checked against source
duration, and loudness is verified on the exported MP4.

## Pipeline

Run these in order. Each step has a script in `scripts/`.

### 1. Index the material
```bash
python scripts/contact_sheets.py <media_dir> <out_dir>
```
Writes one contact sheet per video (grid of frames, N seconds apart) plus a `durations.json`.
**Look at every sheet.** Write down, per clip, which second holds the hero action
(`e_dish_low.mp4 45.5-48.5 = dish low angle against sky`). This note is the edit's backbone -
without it you place clips at random, which is the one thing this skill forbids.

### 2. Transcribe the voiceover with word timestamps
```bash
python scripts/transcribe.py <voiceover.mp3> transcript.json --language=tr \
  --terms "Bayraktar TB2, Kızılelma, Aselsan Ejderha"
```
faster-whisper, `word_timestamps=True`. Scene boundaries, subtitle blocks and every graphic cue
are derived from this file, so nothing drifts.

### 3. Build the subtitle data
```bash
python scripts/build_subtitles.py transcript.json src/data/subtitles.ts --fix fixes.json
```
Groups words into 2-4 word blocks, breaks on punctuation and on spans over 1.5 s. `fixes.json`
maps misheard words to the correct spelling (`{"aina": "aynı ay", "avionik": "aviyonik"}`) -
ASR output is never shown to viewers unedited.

### 4. Cut hero clips
```bash
python scripts/cut_clips.py clips.json <media_dir> public/clips
```
`clips.json` is a list of `{"src", "start", "dur", "name"}` taken from your step-1 notes.
Cutting short clips first (instead of seeking inside 3-minute sources at render time) is what
keeps rendering fast and seeking accurate.

### 5. Lay out the scenes
Copy `template/` into the project, then write `src/scenes/Scenes.tsx`: one `<S>` block per shot,
`from`/`durationInFrames` in frames at 60fps, derived from the word timestamps.
Read `references/layout.md` before placing anything and `references/pacing.md` before choosing
shot lengths.

```bash
python scripts/check_overruns.py src/scenes/Scenes.tsx public/clips
```
Fails loudly when a block plays longer than its clip - the silent killer that leaves frozen or
black frames in the middle of the video.

### 6. Audio
```bash
python scripts/fetch_sfx.py sfx --cc0-only          # Openverse, CC0 by default
python scripts/mix_audio.py mix.json                # VO + SFX (+ optional music) -> master -> mux
```
Read `references/audio.md`. Key rules: voiceover in front, SFX peak-normalized to -3 dBTP,
music (if any) at -20 LUFS and ducked, master two-pass loudnorm to -16 LUFS / -4.5 dBTP.
**Check a candidate music bed's noise floor before using it** - a hissy ambient track reads as
"crackle all over the video" and no amount of mixing fixes it.

### 7. Render and verify
```bash
npx remotion render src/index.ts Main out/final.mp4 --crf=17 --concurrency=3
python scripts/verify_edit.py out/final.mp4           # loudness, peaks, frozen/black frames
```
Then build a contact sheet of the **output** and look at it end to end. Renders occasionally
fail mid-way and leave the previous file in place, so always check the output's timestamp.

## Design system

Tactical Neobrutalism, enforced by `template/src/theme.ts`:

- Colors: black `#000000`, concrete `#F4F4F0`, signal red `#FF2A2A`, warning yellow `#FFE600`,
  acid green `#CCFF00`, high-voltage blue `#00E5FF`.
- Borders 6-8px solid black, corner radius **0**, shadows **hard** (`8px 8px 0`, zero blur).
- Type: heavy geometric sans (Arial Black / Impact stack) for display, monospace for telemetry.
- Motion: `spring()` with high stiffness and controlled damping; never linear fades.
  Cross-dissolves are banned.
- Texture: 5-8% film grain, micro grid behind cards, vignette.

## Component library (`template/src/components/`)

| File | What it gives you |
|---|---|
| `Clip.tsx` | The windowed shot: sharp 16:9 inside a bordered window over a blurred fill of itself. Keeps 1920px sources **downscaled** (sharp) instead of upscaled into a 9:16 crop (soft). `fullBleed` for the rare full-frame shot. |
| `Graphics.tsx` | `BrutalCard`, `GiantQ`, `CrossOut`, `SpeedCounter`, `TargetBox`, `WarnBand`, `HudFrame`, `EmpRings`, `CloneSwarm`, `HyperCollage`, `BoxVideo`, `SplitBar`. |
| `Fx.tsx` | `Grain`, `GridTexture`, `ImpactFrame`, `Flash`, `Shake`, `RgbSplit`, `GlitchSlices`, `Blackout`. |
| `Subtitles.tsx` | Single-line, auto-fitted, Turkish-correct uppercase, accent words in yellow, spring pop-in. |
| `Chrome.tsx` | Broadcast chrome: corner ticks, hairlines, slate tag, running timecode, REC dot. |
| `LogoBug.tsx` | Channel logo bug, configurable position. |

## Hard rules

1. **No random clip placement.** Every shot answers the sentence spoken over it. If the script
   says "260 km terminal hız", the dive footage plays there - and the hit that follows it pays
   the moment off.
2. **Never upscale into the 9:16 frame.** Window the 16:9 source; fill the rest with a blurred,
   darkened copy. Cropping a 1920x1080 source to 1080x1920 throws away 70% of the frame and
   softens what is left.
3. **Check clip length against block length.** `block_frames * speed / 60 <= clip_duration`.
4. **Turkish uppercase needs `toLocaleUpperCase('tr-TR')` plus an explicit `i -> İ` pass**, or
   subtitles read "SIZCE" instead of "SİZCE".
5. **Measure audio, never trust ears you do not have.** Targets in `references/audio.md`.
6. **Licensing**: CC0 only unless the user agrees to credit CC BY. "Non-commercial" or "hobby"
   does **not** waive attribution.

## References

- `references/layout.md` - window geometry, safe zones, card bands, subtitle line
- `references/pacing.md` - shot lengths, cut rhythm, speed ramps, impact frames
- `references/audio.md` - loudness targets, cue map, ducking, licensing
- `references/qa-checklist.md` - what to verify before export
