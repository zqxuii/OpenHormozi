# OpenHormozi

The Hormozi brain for your AI. A sourced map of what Alex Hormozi teaches: **1,434 concepts** from 1,058 public videos, each with a summary, verified quotes and timestamped video links. Install it as a skill, an agent or an MCP server. No account, no API key.

Explore it: https://www.akshaymenon.qd.je

**Unofficial. Not affiliated with, endorsed by, or approved by Alex Hormozi.**

## Install

Pick one. Each takes one line.

### 1. Paste a prompt (any AI assistant)

Works in Claude, Codex, Cursor, ChatGPT, anything that can read a link. The assistant installs the right files for where it is running, then interviews you and builds your business agent.

```
Read https://www.akshaymenon.qd.je/setup.md and follow it to set up a Hormozi business agent for me.
```

### 2. Claude Code plugin (marketplace)

```bash
/plugin marketplace add zqxuii/OpenHormozi
/plugin install open-hormozi --marketplace zqxuii/OpenHormozi
```

Adds the `/open-hormozi` skill and the `hormozi` agent.

### 3. Skill only

```bash
npx openhormozi skill
```

Then in Claude Code: `/open-hormozi how do I price my agency?`

### 4. Agent in your project

```bash
npx openhormozi agent
```

Writes `.claude/agents/hormozi.md` for Claude Code, or adds an `## OpenHormozi` section to `AGENTS.md` (Codex, Cursor, Windsurf, Copilot). Add `--codex` to force `AGENTS.md`.

### 5. MCP server

```bash
claude mcp add openhormozi -- npx -y openhormozi mcp
```

Other clients (Claude Desktop, Cursor, Codex): add this to the MCP config.

```json
{ "mcpServers": { "openhormozi": { "command": "npx", "args": ["-y", "openhormozi", "mcp"] } } }
```

Tools: `search_concepts`, `get_topic`, `get_agent_instructions`.

### 6. Plain files (build your own)

No install needed. Point any agent at https://www.akshaymenon.qd.je/llms.txt. Data: [`concepts.json`](https://www.akshaymenon.qd.je/concepts.json) and `topics/*.md`, all CORS-open.

## Try it from the terminal

```bash
npx openhormozi search "grand slam offer"
```

## What the agent does

Interviews you about your business, finds the one constraint holding growth back, picks one move for the next 7 days, drafts the work (offer text, scripts, pricing), cites a quote with its video link for each framework claim, and reviews the numbers next week. It never spends money or sends anything without your yes.

## Accuracy

Summaries are machine-written paraphrases. Only text under `quotes` is his words, matched word for word against YouTube auto-captions, so numbers and names can be garbled. Check the video at the timestamp before relying on a figure. Not financial, legal or tax advice.

## Repo layout

- `site/`: the public website and agent files (deployed to Cloudflare Pages). `site/skill/SKILL.md`, `site/agent.md` and `site/setup.md` are the source of truth.
- `bin/openhormozi.js`: the zero-dependency CLI and MCP server. `npm run prepack` copies the site files into `assets/`.
- `.claude-plugin/` and `plugins/open-hormozi/`: the Claude Code marketplace and plugin.
- `EXTRACT_PROMPT.md`, `verify.py`, `build_graph.py`, `query.py`, `SKILL.md`: the pipeline that builds the map from transcripts.

## Build your own graph


1. Put your transcripts in `transcripts/<id>.txt`, one line per passage, prefixed with `[m:ss]`. Get them however the platform and the content owner allow.
2. Describe each source in `sources_meta.json` (see `sources_meta.example.json`). The key is the transcript id.
3. Run an LLM extraction per transcript following `EXTRACT_PROMPT.md`, writing `extract/<id>.json`.
4. `python3 verify.py` (writes `verified/`), then `python3 build_graph.py` (writes `graph.json`).
5. `python3 query.py offer`

## Licence

Code: MIT (see `LICENSE`). The MIT license does not cover the quotes in `site/`, which belong to their speakers. Your transcripts and any text generated from them are subject to the rights of their owners.
