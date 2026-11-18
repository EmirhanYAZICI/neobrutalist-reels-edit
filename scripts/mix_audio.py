# -*- coding: utf-8 -*-
"""Build the audio master (voiceover + SFX + optional music) and mux it onto the render.

usage: python mix_audio.py mix.json

mix.json:
{
  "video": "remotion/out/edit.mp4",
  "voiceover": "ses.mp3",
  "duration": 90.048,
  "sfx_dir": "sfx/n",                  // peak-normalised one-shots, <name>.wav
  "out": "final.mp4",
  "work_dir": "build",
  "music": {"file": "sfx/music.mp3", "cut_at": 89.72, "lufs": -20},   // or null
  "target_lufs": -16, "target_tp": -4.5,
  "cues": [[0.0, "boom", 0.9], [8.9, "boom", 1.0], [24.33, "impact", 0.95]]
}

Hierarchy: voiceover in front, SFX above the music, music ducked under the voiceover.
Everything is normalised by measurement; the master is verified separately with verify_edit.py.
"""
import io
import json
import os
import subprocess
import sys


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if p.returncode != 0:
        print(' '.join(cmd)[:400])
        print((p.stderr or '')[-2500:])
        sys.exit(1)
    return p.stderr or ''


def main():
    cfg = json.load(io.open(sys.argv[1] if len(sys.argv) > 1 else 'mix.json', encoding='utf-8'))
    dur = float(cfg['duration'])
    work = cfg.get('work_dir', 'build')
    os.makedirs(work, exist_ok=True)
    sfx_dir = cfg.get('sfx_dir', 'sfx/n')
    tl = cfg.get('target_lufs', -16)
    tp = cfg.get('target_tp', -4.5)

    sfx_bed = os.path.join(work, 'sfx_bed.wav')
    premaster = os.path.join(work, 'premaster.wav')
    master = os.path.join(work, 'master.wav')

    # 1) SFX bed
    cues = cfg.get('cues', [])
    if cues:
        inputs, filters, labels = [], [], []
        for i, (t, name, gain) in enumerate(cues):
            inputs += ['-i', os.path.join(sfx_dir, name + '.wav')]
            ms = int(round(float(t) * 1000))
            filters.append('[{0}:a]aresample=48000,volume={1},adelay={2}|{2}[s{0}]'.format(i, gain, ms))
            labels.append('[s%d]' % i)
        filters.append(''.join(labels) +
                       'amix=inputs={}:normalize=0:dropout_transition=0,atrim=0:{},apad=whole_dur={}[sfx]'
                       .format(len(cues), dur, dur))
        run(['ffmpeg', '-v', 'error', '-y'] + inputs +
            ['-filter_complex', '; '.join(filters), '-map', '[sfx]', '-c:a', 'pcm_f32le', sfx_bed])

    # 2) optional music bed: looped/trimmed, hard cut after the last word, ducked later
    music_bed = None
    music = cfg.get('music')
    if music:
        music_bed = os.path.join(work, 'music_bed.wav')
        cut = float(music.get('cut_at', dur))
        lufs = music.get('lufs', -20)
        af = ('atrim=0:{cut},afade=t=in:st=0:d=1.5,afade=t=out:st={fo}:d=0.18,'
              'apad=whole_dur={dur},loudnorm=I={lufs}:TP=-4,aresample=48000'
              ).format(cut=cut, fo=max(0.0, cut - 0.18), dur=dur, lufs=lufs)
        run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-i', music['file'],
             '-t', str(dur), '-af', af, '-c:a', 'pcm_f32le', music_bed])

    # 3) mix: voiceover in front
    ins = ['-i', cfg['voiceover']]
    chain = ["[0:a]aresample=48000,highpass=f=70,asplit=2[sc][vo]"]
    mix_labels = ['[vo]']
    idx = 1
    if music_bed:
        ins += ['-i', music_bed]
        chain.append('[{}:a][sc]sidechaincompress=threshold=0.025:ratio=9:attack=15:release=420:makeup=1[bg]'.format(idx))
        mix_labels.append('[bg]')
        idx += 1
    if cues:
        ins += ['-i', sfx_bed]
        if music_bed:
            mix_labels.append('[{}:a]'.format(idx))
        else:
            chain.append('[{}:a][sc]sidechaincompress=threshold=0.05:ratio=4:attack=12:release=300:makeup=1[sfxd]'.format(idx))
            mix_labels.append('[sfxd]')
        idx += 1
    if len(mix_labels) == 1:
        chain.append('[vo]anull[out]')
    else:
        chain.append(''.join(mix_labels) +
                     'amix=inputs={}:normalize=0:dropout_transition=0,atrim=0:{},apad=whole_dur={}[out]'
                     .format(len(mix_labels), dur, dur))
    run(['ffmpeg', '-v', 'error', '-y'] + ins +
        ['-filter_complex', '; '.join(chain), '-map', '[out]', '-c:a', 'pcm_f32le', premaster])

    # 4) two-pass loudnorm
    err = run(['ffmpeg', '-v', 'info', '-i', premaster, '-af',
               'loudnorm=I={}:TP={}:LRA=11:print_format=json'.format(tl, tp), '-f', 'null', '-'])
    m = json.loads(err[err.rindex('{'):err.rindex('}') + 1])
    print('pass1:', {k: m[k] for k in ('input_i', 'input_tp', 'input_lra', 'input_thresh')})
    run(['ffmpeg', '-v', 'error', '-y', '-i', premaster, '-af',
         ('loudnorm=I={tl}:TP={tp}:LRA=11:measured_I={i}:measured_TP={t}:measured_LRA={l}:'
          'measured_thresh={th}:offset={o}:linear=true,aresample=48000').format(
             tl=tl, tp=tp, i=m['input_i'], t=m['input_tp'], l=m['input_lra'],
             th=m['input_thresh'], o=m['target_offset']),
         '-c:a', 'pcm_f32le', master])

    # 5) mux onto the finished picture, video untouched
    run(['ffmpeg', '-v', 'error', '-y', '-i', cfg['video'], '-i', master,
         '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k',
         '-shortest', cfg['out']])
    print('muxed ->', cfg['out'])


if __name__ == '__main__':
    main()
