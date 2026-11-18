# -*- coding: utf-8 -*-
"""Cut hero clips listed in a JSON plan into public/clips at a uniform format.

usage: python cut_clips.py clips.json <media_dir> <out_dir> [--fps 60] [--crf 18]

clips.json:
[
  {"name": "e_dish_low", "src": "ASELSAN EJDERHA.mp4", "start": 45.5, "dur": 3.0},
  {"name": "d_dive",     "src": "fpv dalis.mp4",       "start": 1.5,  "dur": 3.1}
]

Short, pre-trimmed, constant-frame-rate clips keep render-time seeking accurate and fast.
"""
import argparse
import io
import json
import os
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('plan')
    ap.add_argument('media_dir')
    ap.add_argument('out_dir')
    ap.add_argument('--fps', type=int, default=60)
    ap.add_argument('--crf', type=int, default=18)
    ap.add_argument('--width', type=int, default=1920)
    ap.add_argument('--height', type=int, default=1080)
    a = ap.parse_args()

    os.makedirs(a.out_dir, exist_ok=True)
    plan = json.load(io.open(a.plan, encoding='utf-8'))
    failed = []

    for item in plan:
        src = os.path.join(a.media_dir, item['src'])
        dst = os.path.join(a.out_dir, item['name'] + '.mp4')
        vf = 'scale={}:{}:flags=lanczos,fps={}'.format(a.width, a.height, a.fps)
        cmd = ['ffmpeg', '-v', 'error', '-y',
               '-ss', str(item['start']), '-t', str(item['dur']), '-i', src,
               '-an', '-vf', vf,
               '-c:v', 'libx264', '-crf', str(a.crf), '-preset', 'veryfast',
               '-pix_fmt', 'yuv420p', dst]
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode != 0 or not os.path.exists(dst):
            failed.append((item['name'], (p.stderr or '').strip()[-200:]))
            continue
        print('%-22s %6.2f +%4.2fs -> %s' % (item['name'], item['start'], item['dur'], dst))

    if failed:
        print('\nFAILED:')
        for name, err in failed:
            print(' ', name, err)
        sys.exit(1)


if __name__ == '__main__':
    main()
