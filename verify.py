#!/usr/bin/env python3
"""Verify extraction quotes against transcripts. Writes verified/<id>.json with only supported items + stats."""
import json,re,os,sys,glob
os.makedirs('verified',exist_ok=True)
def norm(s): return re.sub(r'[^a-z0-9 ]+','',re.sub(r"['’]",'',s.lower())).split()
def load_tx(i):
    raw=open(f'transcripts/{i}.txt').read()
    raw=re.sub(r'\[\d+:\d+(?::\d+)?\]','',raw)
    return norm(raw)
def find(q_tokens,tx,thr=0.9):
    """exact token-run match, else fuzzy: >=thr of tokens in a window in order"""
    n=len(q_tokens)
    if n<5: return False
    s=' '.join(tx); qs=' '.join(q_tokens)
    if (' '+qs+' ') in (' '+s+' '): return 'exact'
    # fuzzy windowed LCS-ish: slide window of n+4
    from difflib import SequenceMatcher
    first=q_tokens[0:2]; 
    idxs=[k for k in range(len(tx)-1) if tx[k]==q_tokens[0] or tx[k+1]==q_tokens[1] ]
    for k in idxs:
        w=tx[k:k+n+4]
        m=SequenceMatcher(None,q_tokens,w,autojunk=False)
        if sum(b.size for b in m.get_matching_blocks())/n>=thr:
            nums=[t for t in q_tokens if any(ch.isdigit() for ch in t)]
            if all(t in w for t in nums): return 'fuzzy'
    return False
def run(files):
    tot=dict(files=0,items=0,ok=0)
    for f in files:
        i=os.path.basename(f)[:-5]
        try: d=json.load(open(f)); tx=load_tx(i)
        except Exception as e: print('BAD',i,str(e)[:80]); continue
        out=dict(source_id=i,summary=d.get('summary'),speaker_note=d.get('speaker_note'),concepts=[],numbers=[],relations=[])
        for c in d.get('concepts',[]):
            qs=[]
            for q in c.get('quotes',[]):
                tot['items']+=1; m=find(norm(q.get('q','')),tx)
                if m: qs.append(dict(q,match=m)); tot['ok']+=1
            if qs: out['concepts'].append(dict(c,quotes=qs))
        for n in d.get('numbers',[]):
            tot['items']+=1; m=find(norm(n.get('q','')),tx)
            if m: out['numbers'].append(dict(n,match=m)); tot['ok']+=1
        for r in d.get('relations',[]):
            tot['items']+=1; m=find(norm(r.get('q','')),tx)
            if m: out['relations'].append(dict(r,match=m)); tot['ok']+=1
        json.dump(out,open(f'verified/{i}.json','w'))
        tot['files']+=1
    print(tot, 'pass rate', round(tot['ok']/max(1,tot['items']),3))
if __name__=='__main__': run(sorted(glob.glob('extract/*.json')))
