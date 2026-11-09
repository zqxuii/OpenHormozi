#!/usr/bin/env python3
"""Build the knowledge graph from verified extractions.
Outputs: graph.json (nodes, links, sources) and stats.json."""
import json, glob, re, os, collections, itertools, math

SEED = ["Value Equation","Grand Slam Offer","Core Four","Warm Outreach","Cold Outreach","Post Free Content","Paid Ads",
"Lead Getters","Rule of 100","More Better New","Money Models","Attraction Offer","Upsell Offer","Downsell Offer","Continuity Offer",
"CLOSER Framework","Hook Retain Reward","Constraint Theory","Scaling Roadmap","Dream Outcome","Perceived Likelihood of Achievement",
"Time Delay","Effort and Sacrifice","Volume Negates Luck","Skill Stacking","Leverage","Opportunity Cost","Unit Economics","LTV to CAC",
"Gross Profit","Cash Flow","Culture","Hiring","Management","Pricing","Guarantees","Scarcity and Urgency","Bonuses","Naming and Packaging",
"Niche and Market Selection","Sales Process","Lead Magnet","Content Strategy","Personal Brand","Acquisitions","Licensing","Stages of Growth",
"Discipline","Identity","Self-Worth","Wealth Building","Delegation","Systems and SOPs"]

DOMAINS = collections.OrderedDict([
 ("Offers",              r"offer|value equation|dream outcome|guarantee|bonus|pricing|price|packag|naming|niche|market select|scarcity|urgency|premium|product|stack|bundle|risk reversal|likelihood"),
 ("Leads & Marketing",   r"lead|content|outreach|ads?\b|advertis|marketing|brand|audience|hook|viral|social|youtube|post |organic|funnel|referral|attention|traffic|cold|warm|seo|email list|creator|distribution|video"),
 ("Sales",               r"sales|sell|closing|closer|objection|call\b|prospect|close\b|negotiat|script|persuasion|follow.?up|appointment|setter"),
 ("Money & Unit Economics", r"money model|upsell|downsell|continuity|attraction|ltv|cac|gross profit|margin|cash|revenue|profit|unit econom|payback|churn|retention|financ|recurring|subscription|monetiz|cost"),
 ("People & Operations", r"hir(e|ing)|culture|manage|delegat|team|employee|system|sop|process|incentive|leader|ceo|operat|org chart|role|fire|firing|training|accountab|kpi|meeting|ownership"),
 ("Mindset & Self",      r"mindset|discipline|identity|self|belief|fear|confidence|habit|consisten|patience|ego|emotion|anxiety|motivat|happiness|fulfil|purpose|meaning|work ethic|grind|resilien|failure|comparison|stoic|therapy|relationship|marriage|health|fitness|sleep"),
 ("Scaling & Strategy",  r"scal|constraint|stage|growth|strategy|acqui|licens|compet|leverage|bottleneck|focus|portfolio|roadmap|rule of 100|volume|skill stack|opportunit|pivot|expand|moat|differentiat"),
 ("Wealth & Investing",  r"wealth|invest|tax|real estate|stock|asset|passive|net worth|nest egg|exit|equity|retire|ventures|private deal|portfolio compan"),
])
ORDER = list(DOMAINS)

def keyname(s):
    s = s.lower().replace('&',' and ')
    s = re.sub(r"[^a-z0-9 ]+"," ",s)
    toks = [t for t in s.split() if t not in ("the","a","an","of","to","and","for","in","on","your","you")]
    toks = [t[:-1] if len(t)>3 and t.endswith('s') and not t.endswith('ss') else t for t in toks]
    return ' '.join(toks)

def classify(name, definition):
    text = (name+' '+(definition or '')).lower()
    sc = {}
    for d,rx in DOMAINS.items():
        n = len(re.findall(rx, name.lower()))*3 + len(re.findall(rx, text))
        sc[d] = n
    best = max(sc.items(), key=lambda kv: kv[1])
    return best[0] if best[1] > 0 else None

def main():
    meta = json.load(open('sources_meta.json'))
    mentions = []   # dict(raw,type,def,quotes,src)
    rels, nums = [], []
    nsrc = 0
    for f in sorted(glob.glob('verified/*.json')):
        d = json.load(open(f)); sid = d['source_id']; nsrc += 1
        for c in d['concepts']:
            mentions.append(dict(raw=c['name'].strip(), type=c.get('type','principle'), definition=c.get('definition',''),
                                 quotes=[dict(t=q['t'], q=q['q']) for q in c['quotes']], src=sid))
        for r in d.get('relations',[]):
            rels.append(dict(src=sid, **{k:r[k] for k in ('from','to','rel','t','q')}))
        for n in d.get('numbers',[]):
            nums.append(dict(src=sid, claim=n['claim'], t=n['t'], q=n['q']))
    # 1. exact key merge
    by_key = collections.defaultdict(list)
    for m in mentions: by_key[keyname(m['raw'])].append(m)
    keys = list(by_key)
    # 2. conservative merge: same token set, or one token set contained in the other with >=2 shared tokens and jaccard>=0.67
    seedkeys = {keyname(s): s for s in SEED}
    parent = {k:k for k in keys}
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]]; x=parent[x]
        return x
    toks = {k:set(k.split()) for k in keys}
    inv = collections.defaultdict(list)
    for k,t in toks.items():
        for w in t: inv[w].append(k)
    for k,t in toks.items():
        cands = set()
        for w in t:
            if len(inv[w])<400: cands.update(inv[w])
        for k2 in cands:
            if k2<=k: continue
            t2=toks[k2]; inter=len(t&t2)
            if inter<2 and not (len(t)==1 and t==t2): continue
            jac=inter/len(t|t2)
            if jac>=0.67 and not (k in seedkeys and k2 in seedkeys):
                # do not join into a seed cluster if the other already belongs to a different seed cluster
                ra,rb=find(k),find(k2)
                if ra!=rb: parent[rb]=ra
    groups = collections.defaultdict(list)
    for k in keys: groups[find(k)].append(k)
    clusters = []
    for ks in groups.values():
        seedin = [k for k in ks if k in seedkeys]
        if len(seedin) > 1:
            for k in ks: clusters.append([k])
        else:
            clusters.append(ks)
    nodes = {}
    key2node = {}
    for i, ks in enumerate(clusters):
        ms = [m for k in ks for m in by_key[k]]
        # canonical name: seed if present, else most frequent raw name
        sk = [k for k in ks if k in seedkeys]
        if sk: name = seedkeys[sk[0]]
        else: name = collections.Counter(m['raw'] for m in ms).most_common(1)[0][0]
        srcs = sorted(set(m['src'] for m in ms))
        # definition: the one from the source with most views among mentions
        def views(m):
            try: return int(float(meta.get(m['src'],{}).get('views') or 0))
            except: return 0
        best = max(ms, key=lambda m: (len(m['definition'])>25, views(m)))
        quotes = []
        seenq = set()
        for m in sorted(ms, key=lambda m: -views(m)):
            for q in m['quotes']:
                if q['q'] in seenq: continue
                seenq.add(q['q']); quotes.append(dict(s=m['src'], t=q['t'], q=q['q']))
        typ = collections.Counter(m['type'] for m in ms).most_common(1)[0][0]
        nid = f"c{i}"
        nodes[nid] = dict(id=nid, name=name, type=typ, definition=best['definition'], n=len(srcs), sources=srcs,
                          quotes=quotes[:6], aliases=sorted(set(m['raw'] for m in ms) - {name})[:6], seed=bool(sk))
        for k in ks: key2node[k] = nid
    # 3. domains
    for n in nodes.values():
        n['domain'] = classify(n['name'], n['definition'])
    # 4. edges
    link_w = collections.Counter(); link_meta = {}
    def resolve(nm):
        return key2node.get(keyname(nm))
    for r in rels:
        a, b = resolve(r['from']), resolve(r['to'])
        if a and b and a != b:
            k = tuple(sorted((a, b)))
            link_w[('rel',)+k] += 1
            link_meta.setdefault(('rel',)+k, []).append(dict(s=r['src'], t=r['t'], q=r['q'], rel=r['rel'], a=a, b=b))
    src_nodes = collections.defaultdict(set)
    for n in nodes.values():
        for s in n['sources']: src_nodes[s].add(n['id'])
    co = collections.Counter()
    for s, ns in src_nodes.items():
        ns = sorted(ns)
        if len(ns) > 60: continue
        for a, b in itertools.combinations(ns, 2): co[(a, b)] += 1
    # keep co-occurrence edges where both nodes appear in >=2 sources and weight>=2, top-5 per node by PMI-ish
    N = max(1, nsrc)
    cand = collections.defaultdict(list)
    for (a, b), w in co.items():
        if w < 2: continue
        na, nb = nodes[a]['n'], nodes[b]['n']
        score = w * math.log((w * N) / (na * nb) + 1e-9) if w*N > na*nb else 0
        if score <= 0: continue
        cand[a].append((score, b, w)); cand[b].append((score, a, w))
    keep = set()
    for a, lst in cand.items():
        for score, b, w in sorted(lst, reverse=True)[:5]:
            keep.add(tuple(sorted((a, b))))
    links = []
    for k in keep:
        a, b = k
        links.append(dict(a=a, b=b, w=co[k], kind='co'))
    for (tag, a, b), w in link_w.items():
        ev = link_meta[(tag, a, b)][0]
        links.append(dict(a=a, b=b, w=w, kind='rel', rel=ev['rel'], s=ev['s'], t=ev['t'], q=ev['q']))
    # 5. neighbour-vote domain for unclassified
    adj = collections.defaultdict(list)
    for l in links: adj[l['a']].append(l['b']); adj[l['b']].append(l['a'])
    for _ in range(2):
        for n in nodes.values():
            if n['domain']: continue
            votes = collections.Counter(nodes[x]['domain'] for x in adj[n['id']] if nodes[x]['domain'])
            if votes: n['domain'] = votes.most_common(1)[0][0]
    # 5b. source-level fallback: majority domain of other classified concepts in the same sources
    src_votes = collections.defaultdict(collections.Counter)
    for n in nodes.values():
        if n['domain']:
            for s in n['sources']: src_votes[s][n['domain']] += 1
    for n in nodes.values():
        if n['domain']: continue
        votes = collections.Counter()
        for s in n['sources']: votes.update(src_votes[s])
        n['domain'] = votes.most_common(1)[0][0] if votes else 'Scaling & Strategy'
    # 6. sources
    used = set(s for n in nodes.values() for s in n['sources'])
    sources = {}
    for sid in sorted(set(glob.glob('verified/*.json')) and [os.path.basename(f)[:-5] for f in glob.glob('verified/*.json')]):
        m = meta.get(sid, {})
        sources[sid] = dict(id=sid, title=m.get('title',''), channel=m.get('channel',''), kind=m.get('kind',''), dur=m.get('duration'), views=m.get('views'))
    out = dict(nodes=list(nodes.values()), links=links, sources=sources, numbers=nums[:4000])
    json.dump(out, open('graph.json', 'w'))
    stats = dict(sources=len(sources), mentions=len(mentions), concepts=len(nodes), multi_source=sum(1 for n in nodes.values() if n['n']>=2),
                 links=len(links), rel_links=sum(1 for l in links if l['kind']=='rel'), numbers=len(nums),
                 domains=collections.Counter(n['domain'] for n in nodes.values()))
    json.dump(stats, open('stats.json', 'w'), default=dict)
    print(stats)

if __name__ == '__main__':
    main()
