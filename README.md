# OpenHormozi

A knowledge graph and Claude Code skill built from the public teaching of a business speaker. The skill answers offer, pricing, lead and sales questions with a framework name, a paraphrased definition, and a quoted line linked to its video and timestamp.

**Not affiliated with, endorsed by, or approved by Alex Hormozi.** The name refers to the speaker whose talks the method was built on.

## What this repo contains

- `SKILL.md`: the Claude Code skill definition.
- `EXTRACT_PROMPT.md`: the instructions an LLM agent follows to extract concepts from one transcript, with verbatim quotes only.
- `verify.py`: checks every quote against its transcript and drops any it cannot find. Writes `verified/`.
- `build_graph.py`: merges verified extractions into `graph.json` (concepts, domains, co-occurrence and relation links).
- `query.py`: prints the concepts that match a term, with their quotes.

## What this repo does not contain

No transcripts in the tooling. The speaker's videos are copyrighted, so build your own graph from transcripts you are allowed to use. The `docs/` folder is the public website at https://akshaymenon.qd.je: machine-written summaries plus short quotes, each attributed and linked to its video.

## Build your own graph

1. Put your transcripts in `transcripts/<id>.txt`, one line per passage, prefixed with `[m:ss]`. Get them however the platform and the content owner allow.
2. Describe each source in `sources_meta.json` (see `sources_meta.example.json`). The key is the transcript id.
3. Run an LLM extraction per transcript following `EXTRACT_PROMPT.md`, writing `extract/<id>.json`.
4. `python3 verify.py` (writes `verified/`), then `python3 build_graph.py` (writes `graph.json`).
5. `python3 query.py offer`

## Use as a skill

Copy `SKILL.md` into `.claude/skills/open-hormozi/` in a project that contains your `graph.json`, or point Claude Code at this repo.

## Quality

Quotes are checked word for word against the transcript, but definitions are paraphrases and some add detail the quote does not contain. Read the quote before you rely on a definition. Caption text is auto-generated and can be wrong.

## Licence

Code: MIT (see `LICENSE`). The MIT license does not cover the quotes in `docs/`, which belong to their speakers. Your transcripts and any text generated from them are subject to the rights of their owners.
