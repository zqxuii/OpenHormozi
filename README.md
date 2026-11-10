<div align="center">

```
░▒▓ OpenHormozi
```

### Give your AI the Hormozi brain.

A map of everything Alex Hormozi teaches about offers, leads, sales, money and scaling, built from 1,058 of his public videos.<br>
Your AI looks things up in it, answers with his real words, and links the exact moment in the video.

[![npm](https://img.shields.io/npm/v/openhormozi?color=ffb454&label=npm&style=flat-square)](https://www.npmjs.com/package/openhormozi)
[![downloads](https://img.shields.io/npm/dm/openhormozi?color=4cc9f0&style=flat-square)](https://www.npmjs.com/package/openhormozi)
[![stars](https://img.shields.io/github/stars/zqxuii/OpenHormozi?color=f9c74f&style=flat-square)](https://github.com/zqxuii/OpenHormozi)
[![license](https://img.shields.io/badge/license-MIT-90be6d?style=flat-square)](LICENSE)

[**Explore the brain**](https://www.akshaymenon.qd.je) · [Install](#install) · [Brain board](#watch-your-ai-think) · [How it works](#how-it-works)

<img src=".github/img/hero.jpg" alt="The OpenHormozi brain, drawn in ASCII" width="860">

</div>

<br>

**1,434 concepts · 10,938 ideas found · 1,058 videos · every claim has a quote and a timestamp**

No account. No API key. Free.

## Install

Pick the one that fits how you work.

### Just paste this into your AI

Works in Claude, ChatGPT, Codex, Cursor, anything that can read a link. It sets itself up, asks about your business, and gets to work.

```
Read https://raw.githubusercontent.com/zqxuii/OpenHormozi/main/SETUP.md and follow it to set up a Hormozi business agent for me.
```

### Claude Code plugin

```
/plugin marketplace add zqxuii/OpenHormozi
/plugin install open-hormozi --marketplace zqxuii/OpenHormozi
```

You get a `/open-hormozi` command and a `hormozi` agent.

### Terminal

```bash
npx openhormozi skill      # adds /open-hormozi to Claude Code
npx openhormozi agent      # adds the business agent to this project
npx openhormozi board      # opens your brain board
```

`agent` writes `.claude/agents/hormozi.md` for Claude Code, or an `AGENTS.md` section for Codex, Cursor, Windsurf and Copilot.

## What you can do with it

**Ask a question.** Run `/open-hormozi how do I price my agency?` and get an answer built from his teaching, with the quote and a link to the moment he said it.

**Hand it your business.** The agent interviews you, finds the one thing holding you back, picks one move for the week, and drafts the work: offer text, outreach scripts, pricing tables. Next week it checks the numbers and picks the next move.

```
You:    interview me about my business and start
Agent:  What do you sell, to whom, and at what price? How many leads a month, and how many close?
...
Agent:  Your constraint is leads, not the offer. Move for the next 7 days: ...
        "..." (video title @ 12:34) https://youtube.com/...
```

## Watch your AI think

Every install comes with a brain board. Run:

```bash
npx openhormozi board
```

It opens the whole brain on your machine. While your AI works, the ideas it reads light up, and the ones it uses to answer get a golden pulse. You can see what it is drawing on, as it does.

<div align="center">
<img src=".github/img/board.jpg" alt="The brain board with a live feed of the ideas an agent just used" width="760">
</div>

Running this on a server over SSH? Your browser can't reach the server's `localhost`. On your own computer run `ssh -L 4747:localhost:4747 user@your-server`, then open http://localhost:4747.

Scroll to pull the brain apart into its eight regions, scroll back to put it together, click any idea to read the quotes behind it.

<div align="center">
<img src=".github/img/zoom.jpg" alt="The brain pulled apart" width="760">
</div>

## How it works

```
 1,058 videos ──▶ ideas + exact quotes ──▶ checked word for word ──▶ the brain
                                                                         │
        you ask ──▶ your AI searches the brain ──▶ answers with quotes ◀─┘
                              │
                              └──▶ lights up on your brain board
```

1. Every video was read and broken into ideas, with the exact words he used.
2. Each quote was matched word for word against the video's captions. Anything that did not match was thrown out.
3. The ideas are linked into one map, grouped into eight areas: Offers, Leads and Marketing, Sales, Money and Unit Economics, People and Operations, Mindset, Scaling and Strategy, Wealth.
4. Your AI searches that map instead of guessing from memory.

## FAQ

**Is this Alex Hormozi?** No. This is an unofficial project and he has nothing to do with it. Nothing here is written by him or approved by him.

**Can I trust the numbers?** The quotes come from automatic captions, so a figure can be garbled. Every quote has a timestamp, so check the video before you rely on a number. The short summaries are machine-written paraphrases, and only the text in quotation marks is his.

**Does it cost anything?** No.

**Is this financial or legal advice?** No. Get a qualified professional for anything that matters.

**Where does the data live?** As plain files at [akshaymenon.qd.je](https://www.akshaymenon.qd.je): [`llms.txt`](https://www.akshaymenon.qd.je/llms.txt), [`concepts.json`](https://www.akshaymenon.qd.je/concepts.json) and one Markdown file per topic. Any agent can read them.

<details>
<summary><b>For builders</b></summary>

<br>

- `site/`: the public website and agent files (deployed to Cloudflare Pages). `site/skill/SKILL.md` and `site/agent.md` are the source of truth. `SETUP.md` is the paste-a-prompt guide.
- `bin/openhormozi.js`: the zero-dependency command line tool. `npm run prepack` copies the site files into `assets/`.
- `.claude-plugin/` and `plugins/open-hormozi/`: the Claude Code marketplace and plugin.
- The brain board reads `~/.openhormozi/activity.jsonl`, which `search`, `topic` and `use` write to.

### Build your own graph

1. Put your transcripts in `transcripts/<id>.txt`, one line per passage, prefixed with `[m:ss]`. Get them however the platform and the content owner allow.
2. Describe each source in `sources_meta.json` (see `sources_meta.example.json`). The key is the transcript id.
3. Run an LLM extraction per transcript following `EXTRACT_PROMPT.md`, writing `extract/<id>.json`.
4. `python3 verify.py` (writes `verified/`), then `python3 build_graph.py` (writes `graph.json`).
5. `python3 query.py offer`

</details>

## Licence

Code: MIT (see [`LICENSE`](LICENSE)). The MIT license does not cover the quotes in `site/`, which belong to their speakers. Your transcripts and any text generated from them are subject to the rights of their owners.
