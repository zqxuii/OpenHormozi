#!/usr/bin/env node
// OpenHormozi CLI. Zero dependencies. Unofficial, not affiliated with Alex Hormozi.
const fs = require('fs'), os = require('os'), path = require('path');
const BASE = process.env.OPENHORMOZI_URL || 'https://www.akshaymenon.qd.je';
const A = (f) => fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8');
const TOPICS = ['offers', 'leads-marketing', 'sales', 'money-unit-economics', 'people-operations', 'mindset-self', 'scaling-strategy', 'wealth-investing'];

const HELP = `openhormozi: the Hormozi brain as a skill, an agent or an MCP server

  npx openhormozi skill            install the /open-hormozi skill for Claude Code
  npx openhormozi agent            add the business agent to this project (auto-detects Claude Code or AGENTS.md)
  npx openhormozi mcp              run as an MCP server (Claude Desktop, Cursor, Codex, any MCP client)
  npx openhormozi prompt           print the setup prompt to paste into any AI assistant
  npx openhormozi search <term>    look up concepts with quotes and video links

Options: --project (install skill in ./.claude instead of ~/.claude)  --codex (agent: write AGENTS.md)  --force (overwrite)
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
  console.log('Done. In Claude Code run: /open-hormozi how do I price my agency?');
}

function installAgent(flags) {
  const cwd = process.cwd();
  const claude = !flags.has('--codex') && (fs.existsSync(path.join(cwd, '.claude')) || fs.existsSync(path.join(cwd, 'CLAUDE.md')) || flags.has('--claude'));
  const body = A('agent.md').split('\n').slice(1).join('\n').trim();
  if (claude) {
    const fm = '---\nname: hormozi\ndescription: Business operator that works on the user\'s business using OpenHormozi, a sourced map of Alex Hormozi\'s public teaching. Use for bottlenecks, offers, pricing, leads, sales and scaling.\n---\n\n';
    write(path.join(cwd, '.claude', 'agents', 'hormozi.md'), fm + '# OpenHormozi agent\n\n' + body + '\n', flags.has('--force'));
    console.log('Done. In Claude Code ask: use the hormozi agent to find my bottleneck');
  } else {
    const file = path.join(cwd, 'AGENTS.md'), tag = '<!-- openhormozi -->';
    const block = `${tag}\n## OpenHormozi\n\n${body}\n${tag}\n`;
    let cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (cur.includes(tag)) cur = cur.replace(new RegExp(`${tag}[\\s\\S]*?${tag}\\n?`), block);
    else cur = (cur ? cur.replace(/\n*$/, '\n\n') : '') + block;
    fs.writeFileSync(file, cur);
    console.log('wrote ' + file + '\nDone. Codex, Cursor, Windsurf and Copilot read AGENTS.md. Ask: interview me about my business and start.');
  }
}

let cache;
async function data() {
  if (cache) return cache;
  const f = path.join(os.homedir(), '.cache', 'openhormozi', 'concepts.json');
  try { if (Date.now() - fs.statSync(f).mtimeMs < 864e5) return (cache = JSON.parse(fs.readFileSync(f, 'utf8'))); } catch {}
  try {
    const r = await fetch(BASE + '/concepts.json'); if (!r.ok) throw new Error(r.status);
    const t = await r.text(); cache = JSON.parse(t);
    try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); } catch {}
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

async function mcp() {
  const tools = [
    { name: 'search_concepts', description: 'Search the OpenHormozi map of Alex Hormozi\'s public teaching. Returns matching concepts with a paraphrased summary and quotes with video links.',
      inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } },
    { name: 'get_topic', description: 'Get a whole topic file as Markdown. Topics: ' + TOPICS.join(', '),
      inputSchema: { type: 'object', properties: { topic: { type: 'string', enum: TOPICS } }, required: ['topic'] } },
    { name: 'get_agent_instructions', description: 'Get the operating instructions for the Hormozi business agent (intake, constraint, one move, cite sources).', inputSchema: { type: 'object', properties: {} } },
  ];
  const send = (o) => process.stdout.write(JSON.stringify(o) + '\n');
  const text = (t) => ({ content: [{ type: 'text', text: t }] });
  async function call(name, a = {}) {
    if (name === 'search_concepts') { const r = find(await data(), String(a.query || ''), Math.min(a.limit || 5, 15)); return text(r.length ? r.map((c) => fmt(c)).join('\n\n') : 'No match. Say so and label any answer as general advice.'); }
    if (name === 'get_topic') { if (!TOPICS.includes(a.topic)) throw new Error('unknown topic'); const r = await fetch(`${BASE}/topics/${a.topic}.md`); return text(await r.text()); }
    if (name === 'get_agent_instructions') return text(A('agent.md'));
    throw new Error('unknown tool ' + name);
  }
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (ch) => {
    buf += ch; let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
      let m; try { m = JSON.parse(line); } catch { continue; }
      if (m.id === undefined) continue; // notification
      const ok = (result) => send({ jsonrpc: '2.0', id: m.id, result });
      if (m.method === 'initialize') ok({ protocolVersion: m.params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'openhormozi', version: '0.1.0' } });
      else if (m.method === 'tools/list') ok({ tools });
      else if (m.method === 'tools/call') call(m.params.name, m.params.arguments).then(ok, (e) => ok({ ...text('Error: ' + e.message), isError: true }));
      else if (m.method === 'ping') ok({});
      else send({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'method not found' } });
    }
  });
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = new Set(rest.filter((x) => x.startsWith('--'))), args = rest.filter((x) => !x.startsWith('--'));
  if (cmd === 'skill') return installSkill(flags);
  if (cmd === 'agent') return installAgent(flags);
  if (cmd === 'mcp') return mcp();
  if (cmd === 'prompt') return console.log(`Read ${BASE}/setup.md and follow it to set up a Hormozi business agent for me.`);
  if (cmd === 'search') {
    if (!args.length) { console.error('usage: openhormozi search <term>'); process.exit(1); }
    const r = find(await data(), args.join(' ')); return console.log(r.length ? r.map((c) => fmt(c)).join('\n\n') : 'No match.');
  }
  console.log(HELP); process.exit(cmd && cmd !== 'help' && cmd !== '--help' ? 1 : 0);
})().catch((e) => { console.error(e.message); process.exit(1); });
