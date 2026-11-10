#!/usr/bin/env node
// OpenHormozi CLI. Zero dependencies. Unofficial, not affiliated with Alex Hormozi.
const crypto = require('crypto');
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), cp = require('child_process');
const BASE = process.env.OPENHORMOZI_URL || 'https://www.akshaymenon.qd.je';
const HOME = process.env.OPENHORMOZI_HOME || path.join(os.homedir(), '.openhormozi');
const LOG = path.join(HOME, 'activity.jsonl');
const A = (f) => fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8');
const TOPICS = ['offers', 'leads-marketing', 'sales', 'money-unit-economics', 'people-operations', 'mindset-self', 'scaling-strategy', 'wealth-investing'];

const HELP = `openhormozi: the Hormozi brain for your AI

  npx openhormozi skill            install the /open-hormozi skill for Claude Code
  npx openhormozi agent            add the business agent to this project (Claude Code or AGENTS.md)
  npx openhormozi board            open your brain board and watch your agent use the brain live
  npx openhormozi board --share    same, with a private link you can open from any device (for servers)
  npx openhormozi search <term>    look up concepts with quotes and video links
  npx openhormozi topic <name>     print a whole topic (${TOPICS.join(', ')})
  npx openhormozi use <concept>... record the concepts an answer used (lights up the board)
  npx openhormozi prompt           print the setup prompt for any AI assistant

Options: --project (skill in ./.claude)  --codex (agent: write AGENTS.md)  --force (overwrite)  --port <n> --no-open --share (board)
Site: ${BASE}   Unofficial. Not affiliated with Alex Hormozi.`;

function write(file, text, force) {
  if (fs.existsSync(file) && !force && fs.readFileSync(file, 'utf8') !== text) {
    console.error(`exists: ${file}\nRe-run with --force to overwrite.`); process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log('wrote ' + file);
}

function installSkill(flags) {
  const dir = flags.has('--project') ? path.join(process.cwd(), '.claude') : path.join(os.homedir(), '.claude');
  write(path.join(dir, 'skills', 'open-hormozi', 'SKILL.md'), A('SKILL.md'), flags.has('--force'));
  console.log('Done. In Claude Code run: /open-hormozi how do I price my agency?\nWatch the brain work: npx openhormozi board');
}

function installAgent(flags) {
  const cwd = process.cwd();
  const claude = !flags.has('--codex') && (fs.existsSync(path.join(cwd, '.claude')) || fs.existsSync(path.join(cwd, 'CLAUDE.md')) || flags.has('--claude'));
  const body = A('agent.md').split('\n').slice(1).join('\n').trim();
  if (claude) {
    const fm = '---\nname: hormozi\ndescription: Business operator that works on the user\'s business using OpenHormozi, a sourced map of Alex Hormozi\'s public teaching. Use for bottlenecks, offers, pricing, leads, sales and scaling.\n---\n\n';
    write(path.join(cwd, '.claude', 'agents', 'hormozi.md'), fm + '# OpenHormozi agent\n\n' + body + '\n', flags.has('--force'));
    console.log('Done. In Claude Code ask: use the hormozi agent to find my bottleneck\nWatch the brain work: npx openhormozi board');
  } else {
    const file = path.join(cwd, 'AGENTS.md'), tag = '<!-- openhormozi -->';
    const block = `${tag}\n## OpenHormozi\n\n${body}\n${tag}\n`;
    let cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (cur.includes(tag)) cur = cur.replace(new RegExp(`${tag}[\\s\\S]*?${tag}\\n?`), block);
    else cur = (cur ? cur.replace(/\n*$/, '\n\n') : '') + block;
    fs.writeFileSync(file, cur);
    console.log('wrote ' + file + '\nDone. Codex, Cursor, Windsurf and Copilot read AGENTS.md. Ask: interview me about my business and start.\nWatch the brain work: npx openhormozi board');
  }
}

// ---- data ----
let cache;
async function data() {
  if (cache) return cache;
  const f = path.join(HOME, 'concepts.json');
  try { if (Date.now() - fs.statSync(f).mtimeMs < 864e5) return (cache = JSON.parse(fs.readFileSync(f, 'utf8'))); } catch {}
  try {
    const r = await fetch(BASE + '/concepts.json'); if (!r.ok) throw new Error(r.status);
    const t = await r.text(); cache = JSON.parse(t);
    try { fs.mkdirSync(HOME, { recursive: true }); fs.writeFileSync(f, t); } catch {}
    return cache;
  } catch (e) {
    try { return (cache = JSON.parse(fs.readFileSync(f, 'utf8'))); } catch { throw new Error('could not load ' + BASE + '/concepts.json: ' + e.message); }
  }
}
function find(d, q, n = 5) {
  const t = q.toLowerCase().split(/\s+/).filter(Boolean);
  const score = (c) => { const nm = c.name.toLowerCase(), sm = (c.summary || '').toLowerCase(); let s = 0;
    for (const w of t) { if (nm === w) s += 10; else if (nm.includes(w)) s += 5; if (sm.includes(w)) s += 1; }
    return s * 100 + Math.min(c.source_count || 0, 99); };
  return d.concepts.map((c) => [score(c), c]).filter(([s]) => s >= 100).sort((a, b) => b[0] - a[0]).slice(0, n).map(([, c]) => c);
}
function fmt(c, nq = 2) {
  const qs = (c.quotes || []).slice(0, nq).map((q) => `> "${q.text}" (${q.video_title} @ ${q.timestamp}) ${q.url}`).join('\n');
  return `## ${c.name} [${c.topic}] (${c.source_count} videos)\n${c.summary} (paraphrase)\n${qs}`;
}

// ---- activity log (read by the board) ----
function log(kind, q, concepts) {
  try {
    fs.mkdirSync(HOME, { recursive: true });
    fs.appendFileSync(LOG, JSON.stringify({ t: Date.now(), kind, q, concepts }) + '\n');
    if (fs.statSync(LOG).size > 512 * 1024) { const lines = fs.readFileSync(LOG, 'utf8').trim().split('\n'); fs.writeFileSync(LOG, lines.slice(-200).join('\n') + '\n'); }
  } catch {}
}
function readLog(since) {
  try { return fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((e) => e && e.t > since).slice(-60); } catch { return []; }
}

function board(flags, port) {
  const html = A('board.html');
  const share = flags.has('--share');
  const token = crypto.randomBytes(12).toString('hex');
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (share) {
      const cookie = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith('ohk='));
      const ok = u.searchParams.get('k') === token || (cookie && cookie.slice(4) === token);
      if (!ok) { res.writeHead(401, { 'content-type': 'text/plain' }); return res.end('Open the full link printed by openhormozi board --share'); }
      if (u.searchParams.get('k') === token) res.setHeader('set-cookie', `ohk=${token}; HttpOnly; SameSite=Lax; Path=/`);
    }
    if (u.pathname === '/__activity') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify(readLog(+u.searchParams.get('since') || 0)));
    }
    if (u.pathname === '/' || u.pathname === '/index.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html); }
    res.writeHead(404); res.end('not found');
  });
  srv.on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `port ${port} is busy. Try --port ${port + 1}` : e.message); process.exit(1); });
  srv.listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}`;
    console.log(`Your brain board is live at ${url}\nWhen your agent looks something up or uses an idea, it lights up here. Ctrl+C to stop.`);
    if (share) {
      let tun;
      try { tun = cp.spawn('cloudflared', ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${port}`], { stdio: ['ignore', 'ignore', 'pipe'] }); }
      catch { tun = null; }
      const fail = () => console.error('\n--share needs cloudflared (free, from Cloudflare). Install it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ and run this again.');
      if (!tun) return fail();
      tun.on('error', fail);
      let shown = false;
      tun.stderr.on('data', (d) => { const m = !shown && /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(String(d)); if (m) { shown = true; console.log(`\nOpen this link on any device:\n  ${m[0]}/?k=${token}\nIt works only while this command runs, and only with the key in the link. Anyone you give the link to can see what your agent looks up. Ctrl+C to stop.`); } });
      process.on('exit', () => { try { tun.kill(); } catch {} });
      process.on('SIGINT', () => process.exit(0));
      return;
    }
    const remote = !!process.env.SSH_CONNECTION || (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY);
    if (remote) {
      const host = (process.env.SSH_CONNECTION || '').split(' ')[2] || '<this-machine-address>';
      console.log(`\nThis looks like a remote or headless machine, so no browser can open here.\nEasiest: stop this and run  npx openhormozi board --share  to get a private link you can open on any device.\nOr, on the computer with your browser, run:\n  ssh -L ${port}:localhost:${port} ${os.userInfo().username}@${host}\nthen open ${url} there.`);
    }
    if (!flags.has('--no-open') && !remote) {
      const [c, a] = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
      try { cp.spawn(c, a, { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch {}
    }
  });
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const pi = rest.indexOf('--port');
  const port = pi >= 0 ? +rest[pi + 1] || 4747 : 4747;
  const flags = new Set(rest.filter((x) => x.startsWith('--'))), args = rest.filter((x, i) => !x.startsWith('--') && !(pi >= 0 && i === pi + 1));
  if (cmd === 'skill') return installSkill(flags);
  if (cmd === 'agent') return installAgent(flags);
  if (cmd === 'board') return board(flags, port);
  if (cmd === 'prompt') return console.log('Read https://raw.githubusercontent.com/zqxuii/OpenHormozi/main/SETUP.md and follow it to set up a Hormozi business agent for me.');
  if (cmd === 'search') {
    if (!args.length) { console.error('usage: openhormozi search <term>'); process.exit(1); }
    const q = args.join(' '), r = find(await data(), q);
    log('read', q, r.slice(0, 3).map((c) => c.name));
    return console.log(r.length ? r.map((c) => fmt(c)).join('\n\n') : 'No match. Say so and label any answer as general advice.');
  }
  if (cmd === 'topic') {
    if (!TOPICS.includes(args[0])) { console.error('usage: openhormozi topic <' + TOPICS.join('|') + '>'); process.exit(1); }
    const r = await fetch(`${BASE}/topics/${args[0]}.md`); if (!r.ok) throw new Error('could not load topic');
    log('read', 'topic: ' + args[0], []);
    return console.log(await r.text());
  }
  if (cmd === 'use') {
    if (!args.length) { console.error('usage: openhormozi use "Concept Name" ...'); process.exit(1); }
    log('use', '', args); return console.log('logged: ' + args.join(', '));
  }
  console.log(HELP); process.exit(cmd && cmd !== 'help' && cmd !== '--help' ? 1 : 0);
})().catch((e) => { console.error(e.message); process.exit(1); });
