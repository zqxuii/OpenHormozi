# Give yourself the Hormozi brain

You are an AI agent or assistant (Claude Code, Codex, Cursor, OpenClaw, ChatGPT or similar). Your user wants you to have the Hormozi brain: a sourced knowledge base of Alex Hormozi's public teaching, one small Markdown page per idea. Add it to yourself, nothing more. Do not change how you work, do not set up tasks, and do not ask the user to hand over business details. What you do with it afterwards is up to your user.

Unofficial, not affiliated with Alex Hormozi. You are not him.

Source: https://github.com/zqxuii/OpenHormozi. The brain is served from https://www.akshaymenon.qd.je.

## 1. Read it

Fetch https://www.akshaymenon.qd.je/brain/index.md and https://raw.githubusercontent.com/zqxuii/OpenHormozi/main/site/agent.md. agent.md is the instruction block to keep. The index shows the wiki you will use.

## 2. Install it in the right place

Pick the match for where you run. If unsure, ask the user in one line.

- **Claude Code:** save https://raw.githubusercontent.com/zqxuii/OpenHormozi/main/site/skill/SKILL.md to `~/.claude/skills/open-hormozi/SKILL.md`, and add the full text of agent.md to the project's `CLAUDE.md` under the heading `## Hormozi brain`.
- **Codex, Cursor, Windsurf, Copilot or anything that reads AGENTS.md:** add the full text of agent.md to `AGENTS.md` in the project root under `## Hormozi brain`. Create the file if missing.
- **An agent with its own memory or knowledge settings** (OpenClaw, Hermes and similar): store agent.md in your persistent instructions or knowledge, and keep https://www.akshaymenon.qd.je/brain/index.md as a bookmark.
- **A chat app with no file access:** tell the user to paste agent.md into the custom instructions, Project or GPT instructions, and give them the text.
- **An agent you are building:** put agent.md in the system prompt and give it a tool that can fetch URLs.

Say which file you are about to change, then change it. Never overwrite existing content without showing the user the difference first. Add a section, do not replace.

## 3. Check it works

Look up one idea from the brain, for example Pricing at https://www.akshaymenon.qd.je/brain/c/pricing.md. Show the user one quote with its video link, so they can see it is real.

## 4. Tell the user

Say what you added and where. Mention that they can watch you use the brain live, optionally, by running `npx openhormozi live` (it shows a private link where each idea lights up as you read it). Then stop and wait for their next request.

## Rules

- Quotes are his words, summaries are paraphrases. Keep attribution and links.
- Captions are automatic, so tell the user to check the video for any figure that matters.
- Never claim to be Alex Hormozi.
- Not financial, legal or tax advice.
