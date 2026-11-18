# QA before export

Run scripts/check_overruns.py and scripts/verify_edit.py, then check these by eye on a contact
sheet of the OUTPUT file:

- [ ] Every sentence sits over the shot that shows what it says; nothing placed at random.
- [ ] Each setup pays off on screen (dive -> hit, charge -> discharge, threat -> defence).
- [ ] No frozen or black stretch anywhere. A render that dies mid-way leaves the PREVIOUS file
      in place, so check the output timestamp as well.
- [ ] Hero windows are sharp; nothing upscaled into the 9:16 frame.
- [ ] Cards, badges and bands stay in their bands; nothing overlaps the subtitle line.
- [ ] Subtitles: single line, inside the frame, Turkish uppercase correct, spelling fixed
      against the real script rather than raw ASR output.
- [ ] Logo bug visible for the whole video, inside the safe zone.
- [ ] Neobrutalism holds: 0 radius, thick black borders, hard shadows, no cross-dissolves.
- [ ] Audio: -16 LUFS +/- 1, true peak under -4 dBTP, voiceover never buried, crackle only
      where something is breaking.
- [ ] Licensing: every sound is CC0, or every CC BY asset is credited in the description.
- [ ] The final frame does what the script's last line asks (question held, then hard blackout).
