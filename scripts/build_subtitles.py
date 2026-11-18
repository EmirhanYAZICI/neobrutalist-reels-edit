# -*- coding: utf-8 -*-
"""transcript.json (word timestamps) -> src/data/subtitles.ts

usage: python build_subtitles.py transcript.json src/data/subtitles.ts [--fix fixes.json]
       [--max-words 4] [--max-span 1.5]

fixes.json: {"word_as_heard": "correct spelling", "mühim+matlar": "mühimmatlar"}
A key containing '+' merges that many consecutive words into one.
ASR output is never shipped unedited: run the result past the actual script.
"""
import argparse, json, io


def load_words(path):
    d = json.load(io.open(path, encoding='utf-8'))
    return [{'w': x['word'].strip(), 's': x['start'], 'e': x['end']} for x in d['word_timestamps']]


def apply_fixes(words, fixes):
    merges = {k: v for k, v in fixes.items() if '+' in k}
    simple = {k: v for k, v in fixes.items() if '+' not in k}
    out, i = [], 0
    while i < len(words):
        hit = None
        for key, val in merges.items():
            parts = key.split('+')
            if [w['w'] for w in words[i:i + len(parts)]] == parts:
                hit = (val, len(parts))
                break
        if hit:
            val, n = hit
            out.append({'w': val, 's': words[i]['s'], 'e': words[i + n - 1]['e']})
            i += n
            continue
        w = dict(words[i])
        # a token starting with an apostrophe belongs to the previous word (TB2 + 'nin)
        if w['w'].startswith("'") and out:
            out[-1]['w'] += w['w']
            out[-1]['e'] = w['e']
            i += 1
            continue
        w['w'] = simple.get(w['w'], w['w'])
        out.append(w)
        i += 1
    return out


def chunk(words, max_words, max_span):
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        ends_clause = cur[-1]['w'][-1:] in '.?!,'
        span = cur[-1]['e'] - cur[0]['s']
        if len(cur) >= max_words or ends_clause or span > max_span:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('transcript')
    ap.add_argument('out_ts')
    ap.add_argument('--fix', default=None)
    ap.add_argument('--max-words', type=int, default=4)
    ap.add_argument('--max-span', type=float, default=1.5)
    a = ap.parse_args()

    fixes = json.load(io.open(a.fix, encoding='utf-8')) if a.fix else {}
    words = apply_fixes(load_words(a.transcript), fixes)
    chunks = chunk(words, a.max_words, a.max_span)

    with io.open(a.out_ts, 'w', encoding='utf-8') as f:
        f.write('// auto-generated from the voiceover (word-level ASR). Do not hand-edit timings.\n')
        f.write('export type Chunk = {text: string; start: number; end: number};\n\n')
        f.write('export const SUBS: Chunk[] = [\n')
        for c in chunks:
            text = ' '.join(x['w'] for x in c)
            f.write('  {text: %s, start: %.3f, end: %.3f},\n'
                    % (json.dumps(text, ensure_ascii=False), c[0]['s'], c[-1]['e']))
        f.write('];\n')

    print('%d chunks -> %s' % (len(chunks), a.out_ts))
    for c in chunks[:5]:
        print('  %.2f  %s' % (c[0]['s'], ' '.join(x['w'] for x in c)))


if __name__ == '__main__':
    main()
