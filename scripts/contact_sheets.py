# -*- coding: utf-8 -*-
"""Index a media folder: one contact sheet per video + durations.json.

usage: python contact_sheets.py <media_dir> <out_dir> [--cols 6] [--rows 5] [--width 300]

Look at every sheet before cutting anything. Cell (row, col) is at
t = (row * cols + col) * step seconds, where step is printed per file.
"""
import argparse, json, math, os, subprocess, sys

VIDEO_EXT = {'.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v'}
AUDIO_EXT = {'.mp3', '.wav', '.m4a', '.aac', '.flac'}


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-show_entries', 'stream=width,height,codec_type', '-of', 'json', path],
        capture_output=True, text=True)
    try:
        d = json.loads(out.stdout)
    except json.JSONDecodeError:
        return None
    dur = float(d.get('format', {}).get('duration', 0) or 0)
    v = next((s for s in d.get('streams', []) if s.get('codec_type') == 'video'), {})
    return {'duration': dur, 'width': v.get('width'), 'height': v.get('height')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('media_dir')
    ap.add_argument('out_dir')
    ap.add_argument('--cols', type=int, default=6)
    ap.add_argument('--rows', type=int, default=5)
    ap.add_argument('--width', type=int, default=300)
    a = ap.parse_args()

    os.makedirs(a.out_dir, exist_ok=True)
    index = {}

    for name in sorted(os.listdir(a.media_dir)):
        path = os.path.join(a.media_dir, name)
        ext = os.path.splitext(name)[1].lower()
        if not os.path.isfile(path) or ext not in VIDEO_EXT | AUDIO_EXT:
            continue
        info = probe(path)
        if not info:
            continue
        index[name] = info
        if ext not in VIDEO_EXT:
            continue

        cells = a.cols * a.rows
        step = max(0.25, info['duration'] / cells)
        sheet = os.path.join(a.out_dir, os.path.splitext(name)[0] + '.png')
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', path, '-vf',
               'fps=1/%.4f,scale=%d:-1,tile=%dx%d' % (step, a.width, a.cols, a.rows),
               '-frames:v', '1', sheet]
        subprocess.run(cmd, capture_output=True)
        index[name]['sheet'] = sheet
        index[name]['step_s'] = round(step, 3)
        print('%-50s %7.2fs  step %.2fs  -> %s' % (name, info['duration'], step, sheet))

    with open(os.path.join(a.out_dir, 'durations.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print('\nwrote', os.path.join(a.out_dir, 'durations.json'))


if __name__ == '__main__':
    main()
