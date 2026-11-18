# -*- coding: utf-8 -*-
"""Catch the silent killer: a scene block that plays longer than its clip.

usage: python check_overruns.py <Scenes.tsx> <clips_dir> [--fps 60]

Parses every `<S from={A} durationInFrames={B}>` block and the `<Clip src="clips/x.mp4"
from={F} speed={S}>` inside it, then checks

    (B * speed) / fps + from  <=  clip_duration

A block that fails this freezes on the last frame (or goes black) for the remainder - which is
invisible in code review and obvious to viewers. Exits 1 when anything overruns.
"""
import argparse
import json
import os
import re
import subprocess
import sys

BLOCK = re.compile(r'<S\s+from=\{(\d+)\}\s+durationInFrames=\{(\d+)\}')
CLIP = re.compile(r'<Clip\b[^>]*?src="([^"]+)"[^>]*?>', re.S)
ATTR_FROM = re.compile(r'from=\{([0-9.]+)\}')
ATTR_SPEED = re.compile(r'speed=\{([0-9.]+)\}')


def duration(path):
    p = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True)
    try:
        return float(p.stdout.strip())
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('scenes')
    ap.add_argument('clips_dir')
    ap.add_argument('--fps', type=int, default=60)
    a = ap.parse_args()

    src = open(a.scenes, encoding='utf-8').read()
    durations = {}
    for name in os.listdir(a.clips_dir):
        if name.lower().endswith(('.mp4', '.mov', '.webm')):
            d = duration(os.path.join(a.clips_dir, name))
            if d:
                durations[name] = d

    blocks = [(m.start(), int(m.group(1)), int(m.group(2))) for m in BLOCK.finditer(src)]
    blocks.append((len(src), -1, -1))

    problems = []
    checked = 0
    for i in range(len(blocks) - 1):
        start, frm, dur = blocks[i]
        chunk = src[start:blocks[i + 1][0]]
        for m in CLIP.finditer(chunk):
            tag = m.group(0)
            clip_name = os.path.basename(m.group(1))
            if clip_name not in durations:
                continue
            offset = float(ATTR_FROM.search(tag).group(1)) if ATTR_FROM.search(tag) else 0.0
            speed = float(ATTR_SPEED.search(tag).group(1)) if ATTR_SPEED.search(tag) else 1.0
            needed = offset + (dur * speed) / a.fps
            checked += 1
            if needed > durations[clip_name] + 0.01:
                problems.append({
                    'block_from': frm, 'frames': dur, 'clip': clip_name,
                    'needs_s': round(needed, 2), 'has_s': round(durations[clip_name], 2),
                    'max_speed': round((durations[clip_name] - offset) * a.fps / dur, 2),
                })

    print('checked %d clip placements in %d blocks' % (checked, len(blocks) - 1))
    if not problems:
        print('OK - no overruns')
        return
    print('\nOVERRUNS:')
    for p in problems:
        print('  block from={:<5} {:<22} needs {:.2f}s, clip is {:.2f}s -> speed <= {}'.format(
            p['block_from'], p['clip'], p['needs_s'], p['has_s'], p['max_speed']))
    sys.exit(1)


if __name__ == '__main__':
    main()
