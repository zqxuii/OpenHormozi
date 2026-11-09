# Extraction task: Business-teaching knowledge extraction (verbatim-evidence only)

You are building a verified knowledge base about how a speaker thinks about business. You will be given a list of transcript IDs. Transcripts live at
`transcripts/<ID>.txt` (lines look like `[12:30] spoken text...`). They are YouTube auto-captions, so spelling of names and numbers can be wrong.
Video titles/channels are in `sources_meta.json` (a JSON object keyed by ID); read only the entries for your IDs (use a short python/jq one-liner).

For EACH transcript: read the whole thing (use Read with offset/limit if it is long), then write ONE file `extract/<ID>.json` (use the Write tool; valid JSON only):

```
{
 "source_id": "<ID>",
 "speaker_note": "who is speaking (the speaker alone / the speaker + guest name / guest mainly)",
 "summary": "2 sentences max, what this source teaches",
 "concepts": [
   {"name": "Value Equation", "type": "framework|principle|tactic|metric|mindset|story|tool|belief",
    "definition": "one sentence in your words, strictly supported by the quote(s)",
    "quotes": [{"t": "12:30", "q": "VERBATIM contiguous words copied from the transcript, 8 to 40 words"}]}
 ],
 "numbers": [
   {"claim": "what number/stat is asserted and by whom", "t": "5:10", "q": "VERBATIM contiguous words containing the number"}
 ],
 "relations": [
   {"from": "Concept A", "to": "Concept B", "rel": "part_of|enables|requires|contrasts_with|example_of|precedes", "t": "7:00", "q": "VERBATIM words that show this relation"}
 ]
}
```

Rules (these are checked by a script that rejects anything it cannot find in the transcript):
1. Every quote must be copied EXACTLY, contiguous, from the transcript text of that same ID (ignore the [mm:ss] markers; do not stitch across timestamp markers; do not fix spelling). If you cannot quote it, do not include it.
2. Only include what the speaker actually says. No outside knowledge, no inference beyond the quote. If a guest (not the speaker) says it, say so in the definition.
3. Aim for 8 to 25 concepts per hour of content, favouring substantive teaching (frameworks, rules, tactics, numbers, mental models, stories with a lesson) over chit-chat. 2 to 6 relations. Numbers only when a concrete figure is stated (revenue, price, %, counts).
4. Use canonical names where one applies, exactly as spelled here: Value Equation; Grand Slam Offer; Core Four; Warm Outreach; Cold Outreach; Post Free Content; Paid Ads; Lead Getters; Rule of 100; More Better New; Money Models; Attraction Offer; Upsell Offer; Downsell Offer; Continuity Offer; CLOSER Framework; Hook Retain Reward; Constraint Theory; Scaling Roadmap; Dream Outcome; Perceived Likelihood of Achievement; Time Delay; Effort and Sacrifice; Volume Negates Luck; Skill Stacking; Leverage; Opportunity Cost; Unit Economics; LTV to CAC; Gross Profit; Cash Flow; Culture; Hiring; Management; Pricing; Guarantees; Scarcity and Urgency; Bonuses; Naming and Packaging; Niche and Market Selection; Sales Process; Lead Magnet; Content Strategy; Personal Brand; Acquisitions; Licensing; Stages of Growth; Discipline; Identity; Self-Worth; Wealth Building; Delegation; Systems and SOPs. For anything else, invent a short, specific, Title Case name (2 to 5 words) and reuse the same name for the same idea across transcripts.
5. After writing each file, immediately move to the next ID. Do not print file contents. Final reply: one line `done: N files written, skipped: <ids with reason or none>`.
