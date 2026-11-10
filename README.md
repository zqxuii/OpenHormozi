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

It gives you a private link on the OpenHormozi site (and opens it) that shows the whole brain. While your AI works, the camera flies to each idea it reads or uses, one after another, with the quotes behind it. A live feed shows what it touched. It works the same on a laptop, a server or a cloud box, because the link lives on the web and nothing runs on your machine.

**What gets sent:** only the names of the ideas your agent looked up or used, to make your link show them. Never your questions, your business details or anything you type. Keep the link private, since anyone who has it can watch. Stop any time with `npx openhormozi board --off`. Want it fully offline? `npx openhormozi board --local` runs the board on your machine only.

<div align="center">
<img src=".github/img/board.jpg" alt="The brain board with a live feed of the ideas an agent just used" width="760">
</div>

Running your agent on a server? Use `npx openhormozi board --share`. It prints a private link you can open on any device. The link works only while the command runs and only with the key in it. This needs the free [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) tool.

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

**Is my board private?** It is unlisted and only people with your link can see it. Events are deleted after 7 days without activity, and only the last 100 are kept.

**Where does the data live?** As plain files at [akshaymenon.qd.je](https://www.akshaymenon.qd.je): [`llms.txt`](https://www.akshaymenon.qd.je/llms.txt), [`concepts.json`](https://www.akshaymenon.qd.je/concepts.json) and one Markdown file per topic. Any agent can read them.

<details>
<summary><b>For builders</b></summary>

<br>

- `site/`: the public website and agent files (deployed to Cloudflare Pages). `site/skill/SKILL.md` and `site/agent.md` are the source of truth. `SETUP.md` is the paste-a-prompt guide.
- `bin/openhormozi.js`: the zero-dependency command line tool. `npm run prepack` copies the site files into `assets/`.
- `.claude-plugin/` and `plugins/open-hormozi/`: the Claude Code marketplace and plugin.
- `search`, `topic` and `use` write to `~/.openhormozi/activity.jsonl`. If you ran `board`, they also send idea names to the relay (`site/_worker.js`, a Cloudflare Pages worker with a D1 database) that powers your `/b/<id>` link. `board --local` reads the file directly instead.

### Build your own graph

1. Put your transcripts in `transcripts/<id>.txt`, one line per passage, prefixed with `[m:ss]`. Get them however the platform and the content owner allow.
2. Describe each source in `sources_meta.json` (see `sources_meta.example.json`). The key is the transcript id.
3. Run an LLM extraction per transcript following `EXTRACT_PROMPT.md`, writing `extract/<id>.json`.
4. `python3 verify.py` (writes `verified/`), then `python3 build_graph.py` (writes `graph.json`).
5. `python3 query.py offer`

</details>

## Licence

Code: MIT (see [`LICENSE`](LICENSE)). The MIT license does not cover the quotes in `site/`, which belong to their speakers. Your transcripts and any text generated from them are subject to the rights of their owners.
