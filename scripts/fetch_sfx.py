# -*- coding: utf-8 -*-
"""Fetch and peak-normalise CC0 sound effects / music beds from Openverse (no API key).

usage:
  python fetch_sfx.py search "impact boom" [--max-ms 8000] [--min-ms 0] [--cc0-only]
  python fetch_sfx.py get <audio_url> <name> <sfx_dir> [--peak -3] [--lufs -20]

search prints id / title / duration / licence / url; nothing is downloaded.
get downloads into <sfx_dir>/<name>.mp3, writes the attribution line into
<sfx_dir>/credits.txt and a normalised copy into <sfx_dir>/n/<name>.wav
(peak -3 dBTP for one-shots, --lufs for beds).

Licence rule: CC0 unless the user explicitly accepts crediting CC BY. "Hobby" or
"non-commercial" does NOT waive attribution.

Music beds: check the noise floor before committing, a hissy ambient track reads as
crackle across the whole video:
    ffmpeg -v info -t 60 -i bed.mp3 -af astats -f null -   # want noise floor < -45 dB
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

API = 'https://api.openverse.org/v1/audio/'
UA = 'neobrutalist-reels-edit/1.0'


def api_search(query, min_ms, max_ms, cc0_only):
    params = {
        'q': query,
        'license': 'cc0,pdm' if cc0_only else 'cc0,by,pdm',
        'source': 'freesound,jamendo',
        'page_size': 20,
    }
    url = API + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode('utf-8'))

    out = []
    for item in data.get('results', []):
        ms = item.get('duration') or 0
        if min_ms and ms < min_ms:
            continue
        if max_ms and ms > max_ms:
            continue
        out.append({
            'title': item.get('title', ''),
            'creator': item.get('creator', ''),
            'license': item.get('license', ''),
            'duration_s': round(ms / 1000.0, 2),
            'url': item.get('url'),
            'landing': item.get('foreign_landing_url'),
            'attribution': re.sub(r'\s+', ' ', (item.get('attribution') or '')).strip(),
        })
    return out


def download(url, dst):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=120) as r, open(dst, 'wb') as f:
        f.write(r.read())


def measure(path, key):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af',
                        'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = re.findall(r'%s:\s*(-?\d+\.\d+)' % key, p.stderr or '')
    return float(m[-1]) if m else None


def normalise(src, dst, peak_target, lufs_target):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if lufs_target is not None:
        run = ['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
               'loudnorm=I=%s:TP=-4' % lufs_target, '-c:a', 'pcm_f32le', dst]
        subprocess.run(run, capture_output=True)
        return 'lufs %s' % lufs_target
    peak = measure(src, 'Peak')
    gain = (peak_target - peak) if peak is not None else 0.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
                    'volume=%.2fdB,aresample=48000' % gain, '-c:a', 'pcm_f32le', dst],
                   capture_output=True)
    return 'peak %.1f -> %.1f dBTP' % (peak if peak is not None else 0.0, peak_target)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)

    s = sub.add_parser('search')
    s.add_argument('query')
    s.add_argument('--min-ms', type=int, default=0)
    s.add_argument('--max-ms', type=int, default=0)
    s.add_argument('--cc0-only', action='store_true')

    g = sub.add_parser('get')
    g.add_argument('url')
    g.add_argument('name')
    g.add_argument('sfx_dir')
    g.add_argument('--peak', type=float, default=-3.0)
    g.add_argument('--lufs', type=float, default=None)
    g.add_argument('--attribution', default='')

    a = ap.parse_args()

    if a.cmd == 'search':
        for r in api_search(a.query, a.min_ms, a.max_ms, a.cc0_only):
            print('%-44s %6.1fs %-4s %s' % (r['title'][:44], r['duration_s'], r['license'], r['url']))
        return

    os.makedirs(a.sfx_dir, exist_ok=True)
    raw = os.path.join(a.sfx_dir, a.name + '.mp3')
    download(a.url, raw)
    how = normalise(raw, os.path.join(a.sfx_dir, 'n', a.name + '.wav'), a.peak, a.lufs)
    if a.attribution:
        with io.open(os.path.join(a.sfx_dir, 'credits.txt'), 'a', encoding='utf-8') as f:
            f.write('%s.mp3: %s\n' % (a.name, a.attribution))
    print('%s -> %s (%s)' % (a.name, raw, how))


if __name__ == '__main__':
    main()
