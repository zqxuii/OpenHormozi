---
name: open-hormozi
description: Answer business, offer, pricing, lead generation and sales questions using a knowledge graph of a speaker's public teaching, citing the source video and timestamp for each claim. Use when the user asks how to think about an offer, pricing, leads, sales, hiring or scaling, and a graph.json exists in this project.
---

# OpenHormozi

This skill answers from a knowledge graph built from a business speaker's public talks. It is not the speaker, and it does not speak for them.

## Before answering

1. If `graph.json` is missing, tell the user to build it first (see README). Do not answer from memory and present it as the speaker's view.
2. Run `python3 query.py <term>` for each concept the question touches (for example `offer`, `pricing`, `cold outreach`).

## How to answer

- Lead with the framework or concept name, then apply it to the user's situation.
- Give the definition in your own words and say it is a paraphrase.
- Back each claim with one quoted line and its source and timestamp from the query output.
- If a quote does not clearly support the definition, say so.
- Check the speaker note: many sources have a guest or host speaking. Attribute ideas to the right person.
- If the graph has no match, say so and give general advice, labelled as general.

## Limits

- Not financial, legal or tax advice. Say so if the question crosses into regulated areas.
- Domain labels are approximate. Use concept names, not domain labels, to decide relevance.
- Do not invent numbers. Use only figures that appear in `graph.json` under `numbers`, with their source.
