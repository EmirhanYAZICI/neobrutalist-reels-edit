# -*- coding: utf-8 -*-
"""Word-level transcription of a voiceover with faster-whisper (local, no API key).

usage: python transcribe.py <audio_or_video> <out.json> [--language tr] [--model small]
                            [--terms "Bayraktar TB2, Kızılelma"]

Writes {"text", "word_timestamps": [{"word","start","end","probability"}], "language",
"duration", "model_size"}. Scene boundaries, subtitle blocks and graphic cues are all derived
from these timestamps, so run this before planning the edit.

Needs: pip install faster-whisper, plus ffmpeg on PATH (audio is decoded with ffmpeg so PyAV
metadata errors on some Windows builds cannot break the run).
"""
import argparse
import json
import io
import subprocess
import sys
import tempfile
import os


def decode_to_wav(src):
    tmp = os.path.join(tempfile.gettempdir(), 'nbe_transcribe_%d.wav' % os.getpid())
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src,
                        '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', tmp],
                       capture_output=True, text=True)
    if p.returncode != 0:
        sys.stderr.write((p.stderr or '')[-800:])
        sys.exit(1)
    return tmp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--language', default='tr')
    ap.add_argument('--model', default='small')
    ap.add_argument('--terms', default='', help='proper nouns, comma separated')
    a = ap.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.stderr.write('pip install faster-whisper\n')
        sys.exit(1)

    wav = decode_to_wav(a.src)
    model = WhisperModel(a.model, device='cpu', compute_type='int8')
    segments, info = model.transcribe(
        wav,
        language=None if a.language == 'auto' else a.language,
        word_timestamps=True,
        initial_prompt=a.terms or None,
        vad_filter=False,
    )

    words, text = [], []
    for seg in segments:
        text.append(seg.text)
        for w in (seg.words or []):
            words.append({'word': w.word, 'start': round(w.start, 3),
                          'end': round(w.end, 3), 'probability': round(w.probability, 3)})

    out = {
        'text': ''.join(text).strip(),
        'word_timestamps': words,
        'language': info.language,
        'duration': round(info.duration, 3),
        'model_size': a.model,
    }
    with io.open(a.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    try:
        os.remove(wav)
    except OSError:
        pass

    print('%d words, %.2fs -> %s' % (len(words), out['duration'], a.out))


if __name__ == '__main__':
    main()
