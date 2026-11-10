// OpenHormozi board relay. Cloudflare Pages advanced mode. Needs a D1 binding named DB.
// POST /api/board/<id>     header x-key: <secret>   body {kind:'read'|'use', concepts:[names]}
// GET  /api/board/<id>/activity?since=<ms>          returns the latest events for that board
// GET  /b/<id>                                      serves the brain page, which polls the endpoint above
const ID = /^[a-f0-9]{16,64}$/;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map((b) => b.toString(16).padStart(2, '0')).join('');

export default {
  async fetch(req, env) {
    const u = new URL(req.url), p = u.pathname;
    const m = p.match(/^\/api\/board\/([a-f0-9]{16,64})(\/activity)?$/);
    if (m) {
      if (!env.DB) return json({ error: 'not configured' }, 503);
      const id = m[1];
      if (m[2]) {
        if (req.method !== 'GET') return json({ error: 'method' }, 405);
        const since = Math.max(0, +u.searchParams.get('since') || 0);
        const r = await env.DB.prepare('SELECT t, kind, concepts FROM events WHERE board = ?1 AND t > ?2 ORDER BY t DESC LIMIT 60').bind(id, since).all();
        return json(r.results.reverse().map((e) => ({ t: e.t, kind: e.kind, concepts: JSON.parse(e.concepts) })));
      }
      if (req.method !== 'POST') return json({ error: 'method' }, 405);
      const key = req.headers.get('x-key') || '';
      if (!ID.test(key)) return json({ error: 'key' }, 401);
      let body;
      try { const raw = await req.text(); if (raw.length > 2048) return json({ error: 'size' }, 413); body = JSON.parse(raw); } catch { return json({ error: 'json' }, 400); }
      const kind = body.kind === 'use' ? 'use' : body.kind === 'read' ? 'read' : null;
      const concepts = Array.isArray(body.concepts) ? body.concepts.filter((c) => typeof c === 'string').map((c) => c.slice(0, 80)).slice(0, 8) : [];
      if (!kind || !concepts.length) return json({ error: 'body' }, 400);
      const hash = await sha(key), now = Date.now();
      const row = await env.DB.prepare('SELECT key_hash FROM boards WHERE id = ?1').bind(id).first();
      if (!row) await env.DB.prepare('INSERT OR IGNORE INTO boards (id, key_hash, created, last) VALUES (?1, ?2, ?3, ?3)').bind(id, hash, now).run();
      else if (row.key_hash !== hash) return json({ error: 'key' }, 403);
      await env.DB.batch([
        env.DB.prepare('INSERT INTO events (board, t, kind, concepts) VALUES (?1, ?2, ?3, ?4)').bind(id, now, kind, JSON.stringify(concepts)),
        env.DB.prepare('UPDATE boards SET last = ?2 WHERE id = ?1').bind(id, now),
        env.DB.prepare('DELETE FROM events WHERE board = ?1 AND id NOT IN (SELECT id FROM events WHERE board = ?1 ORDER BY id DESC LIMIT 100)').bind(id),
      ]);
      if (Math.random() < 0.02) { // tidy boards idle for 7 days
        const cut = now - 7 * 864e5;
        await env.DB.batch([env.DB.prepare('DELETE FROM events WHERE board IN (SELECT id FROM boards WHERE last < ?1)').bind(cut), env.DB.prepare('DELETE FROM boards WHERE last < ?1').bind(cut)]);
      }
      return json({ ok: true, t: now });
    }
    if (/^\/b\/[a-f0-9]{16,64}\/?$/.test(p)) {
      const r = await env.ASSETS.fetch(new Request(new URL('/', u), { method: 'GET', headers: req.headers }));
      const h = new Headers(r.headers);
      h.set('x-robots-tag', 'noindex, nofollow'); h.set('referrer-policy', 'no-referrer');
      return new Response(r.body, { status: r.status, headers: h });
    }
    return env.ASSETS.fetch(req);
  },
};
