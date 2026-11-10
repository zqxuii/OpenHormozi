# Set up a Hormozi business agent

You are an AI assistant (Claude Code, Codex, Cursor, ChatGPT or similar). Your user wants an agent that runs their business using OpenHormozi, a sourced map of Alex Hormozi's public teaching. Follow these steps in order. Unofficial, not affiliated with Alex Hormozi.

Base URL: https://www.akshaymenon.qd.je

## 1. Read the brain

Fetch https://www.akshaymenon.qd.je/agent.md and https://www.akshaymenon.qd.je/llms.txt. agent.md is the agent's operating instructions. llms.txt lists the knowledge files (topic Markdown files and concepts.json).

## 2. Work out where you are running

Pick the matching install. If unsure, ask the user in one line.

- Claude Code:
  - Skill: save https://www.akshaymenon.qd.je/skill/SKILL.md to `~/.claude/skills/open-hormozi/SKILL.md`.
  - Agent: create `.claude/agents/hormozi.md` with frontmatter `name: hormozi`, a one-line `description`, then the full text of agent.md as the body.
- Codex, Cursor, Windsurf, Copilot or anything that reads AGENTS.md: append the full text of agent.md to `AGENTS.md` in the project root under the heading `## OpenHormozi`. Create the file if missing.
- A chat app with no file access (ChatGPT, Gemini web): tell the user to paste agent.md into a custom GPT or Project instructions, and give them the text.
- A custom agent you are building: put agent.md in its system prompt and give it a fetch tool that can read the URLs above.

Say which files you are about to write, then write them. Never overwrite an existing file without showing the user the difference first.

## 3. Create the business profile

Ask the user, in one message, for what you do not already know: what they sell and to whom, price, leads per month, close rate, monthly revenue, gross margin, cash on hand, team size, and what feels stuck. Save the answers to `hormozi-business.md` next to the agent file. The agent reads it at the start of every session and updates it when numbers change.

## 4. Run the first diagnosis

Using the agent's loop: find the single constraint, read the matching topic file, pick one move for the next 7 days, quote the source with its video link, and draft the first piece of work (offer text, script or pricing table).

## Rules

- Quotes in the files are his words; summaries are machine paraphrases. Keep attribution and links.
- Captions are automatic. Tell the user to check the video for any figure that drives a decision.
- Not financial, legal or tax advice.
- Do not spend money, send messages or sign anything for the user without their clear yes.
