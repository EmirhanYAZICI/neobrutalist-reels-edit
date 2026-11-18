# -*- coding: utf-8 -*-
"""Verify the exported MP4: loudness, true peak, black/frozen stretches, and a contact sheet.

usage: python verify_edit.py final.mp4 [--lufs -16] [--tp -4.0] [--sheet out/sheet.png]

Checks
  * integrated loudness within 1 LU of target and true peak under the ceiling
  * black frames (a render that died mid-way or a clip that ran out)
  * frozen stretches over 0.6 s (a block playing past the end of its clip)
Exits 1 when a check fails. Always look at the contact sheet afterwards - numbers do not
catch a shot that simply does not show what the sentence says.
"""
import argparse
import json
import re
import subprocess
import sys


def ff(args):
    return subprocess.run(['ffmpeg'] + args, capture_output=True, text=True,
                          encoding='utf-8', errors='replace').stderr or ''


def loudness(path):
    err = ff(['-v', 'info', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    i = re.findall(r'I:\s*(-?\d+\.\d+)\s*LUFS', err)
    p = re.findall(r'Peak:\s*(-?\d+\.\d+)\s*dBFS', err)
    return (float(i[-1]) if i else None, float(p[-1]) if p else None)


def black_spans(path):
    err = ff(['-v', 'info', '-i', path, '-vf', 'blackdetect=d=0.25:pic_th=0.98', '-an', '-f', 'null', '-'])
    return re.findall(r'black_start:(\d+\.?\d*) black_end:(\d+\.?\d*)', err)


def frozen_spans(path, min_s=0.6):
    err = ff(['-v', 'info', '-i', path, '-vf', 'freezedetect=n=0.001:d=%s' % min_s,
              '-an', '-f', 'null', '-'])
    starts = re.findall(r'freeze_start:\s*(\d+\.?\d*)', err)
    durs = re.findall(r'freeze_duration:\s*(\d+\.?\d*)', err)
    return list(zip(starts, durs))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--lufs', type=float, default=-16.0)
    ap.add_argument('--tp', type=float, default=-4.0)
    ap.add_argument('--sheet', default=None)
    ap.add_argument('--allow-tail-black', type=float, default=1.0,
                    help='ignore black that ends within this many seconds of the end')
    a = ap.parse_args()

    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', a.video], capture_output=True, text=True)
    total = float(probe.stdout.strip() or 0)

    i, peak = loudness(a.video)
    blacks = [b for b in black_spans(a.video) if float(b[1]) < total - a.allow_tail_black]
    freezes = frozen_spans(a.video)

    ok_loud = i is not None and abs(i - a.lufs) <= 1.0
    ok_peak = peak is not None and peak <= a.tp + 0.2

    report = {
        'file': a.video,
        'duration_s': round(total, 2),
        'integrated_lufs': i,
        'true_peak_dbfs': peak,
        'loudness_ok': ok_loud,
        'peak_ok': ok_peak,
        'black_spans': blacks,
        'frozen_spans': freezes,
    }

    if a.sheet:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-vf',
                        'fps=1/%.3f,scale=190:-1,tile=6x5' % max(0.5, total / 30.0),
                        '-frames:v', '1', a.sheet], capture_output=True)
        report['sheet'] = a.sheet

    verdict = ok_loud and ok_peak and not blacks and not freezes
    print('VERDICT:', 'PASS' if verdict else 'NEEDS FIX')
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not verdict:
        sys.exit(1)


if __name__ == '__main__':
    main()
