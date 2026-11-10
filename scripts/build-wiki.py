#!/usr/bin/env python3
"""Turn site/concepts.json into the brain wiki: one small Markdown page per concept, an index page per topic, and names.txt.
Usage: python3 scripts/build-wiki.py   (writes site/brain/)"""
import json, re, os, shutil
BASE = 'https://www.akshaymenon.qd.je'
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
d = json.load(open(os.path.join(root, 'concepts.json')))
cs = d['concepts']
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
page = {c['name']: f"{BASE}/brain/c/{slug(c['name'])}.md" for c in cs}
out = os.path.join(root, 'brain')
shutil.rmtree(out, ignore_errors=True)
os.makedirs(os.path.join(out, 'c')); os.makedirs(os.path.join(out, 'topics'))
NOTE = "Unofficial map of Alex Hormozi's public teaching. The idea summary is a machine paraphrase. Only the quoted text is his words, taken from auto-captions, so check the video at the timestamp before relying on a figure."

for c in cs:
    q = '\n\n'.join(f"> \"{x['text']}\"\n> [{x['video_title'].strip()} @ {x['timestamp']}]({x['url']})" for x in c['quotes']) or '(no verified quotes)'
    rel = '\n'.join(f"- [{n}]({page[n]})" for n in c['related'] if n in page) or '(none)'
    md = f"""# {c['name']}

Topic: {c['topic']} | Type: {c['type']} | Seen in {c['source_count']} videos

## The idea (paraphrase)

{c['summary']}

## His words

{q}

## Related ideas

{rel}

---
{NOTE} Index: {BASE}/brain/index.md
"""
    open(os.path.join(out, 'c', slug(c['name']) + '.md'), 'w').write(md)

topics = {}
for c in cs: topics.setdefault(c['topic'], []).append(c)
for t, lst in topics.items():
    lst.sort(key=lambda c: -c['source_count'])
    lines = '\n'.join(f"- [{c['name']}]({page[c['name']]}) ({c['source_count']} videos): {c['summary'][:150].rstrip()}{'...' if len(c['summary'])>150 else ''}" for c in lst)
    open(os.path.join(out, 'topics', slug(t) + '.md'), 'w').write(f"# {t}\n\n{len(lst)} ideas, most-covered first. Open any idea for the full summary, his quotes and related ideas.\n\n{lines}\n\n---\n{NOTE}\n")

top = sorted(cs, key=lambda c: -c['source_count'])[:30]
tl = '\n'.join(f"- [{t}]({BASE}/brain/topics/{slug(t)}.md): {len(l)} ideas. Biggest: " + ', '.join(c['name'] for c in l[:4]) for t, l in sorted(topics.items()))
open(os.path.join(out, 'index.md'), 'w').write(f"""# The Hormozi brain

{len(cs)} ideas from {d['meta']['sources']:,} public videos, one small page each. Built for AI agents. No account, no key.

## How to use it

1. Find the idea you need: grep `{BASE}/brain/names.txt`, or open a topic page below.
2. Open the idea page (about 2 KB). It has a paraphrased summary, his exact words with video links, and related ideas to follow.
3. Cite what you use: keep the quote, the video title, the timestamp and the link.

## Topics

{tl}

## The most-covered ideas

{chr(10).join(f"- [{c['name']}]({page[c['name']]}) ({c['source_count']} videos)" for c in top)}

## Names list

[names.txt]({BASE}/brain/names.txt): one line per idea: `name | topic | videos | url`.

---
{NOTE}
""")
open(os.path.join(out, 'names.txt'), 'w').write('\n'.join(f"{c['name']} | {c['topic']} | {c['source_count']} | {page[c['name']]}" for c in sorted(cs, key=lambda c: -c['source_count'])) + '\n')
print(len(cs), 'pages', sum(os.path.getsize(os.path.join(out,'c',f)) for f in os.listdir(os.path.join(out,'c')))//1024, 'KB')
