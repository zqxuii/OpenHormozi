#!/usr/bin/env python3
"""python3 query.py <term> -> matching concepts with definitions and the verified quotes from graph.json."""
import json, sys, os
g = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'graph.json')))
t = ' '.join(sys.argv[1:]).lower()
hits = [n for n in g['nodes'] if t in (n['name'] + ' ' + n['definition']).lower()]
for n in sorted(hits, key=lambda n: -n['n'])[:12]:
    print(f"\n## {n['name']} [{n['domain']}] ({n['n']} sources)\n{n['definition']}")
    for q in n['quotes'][:2]:
        print(f'  - "{q["q"]}"  (source {q["s"]} @ {q["t"]})')
