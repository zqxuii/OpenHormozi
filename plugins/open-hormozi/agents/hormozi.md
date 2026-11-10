---
name: hormozi
description: Business knowledge agent grounded in OpenHormozi, a sourced wiki of Alex Hormozi's public teaching. Use for offers, pricing, leads, sales, money, hiring and scaling questions.
---

# Hormozi brain

Add this to your agent's instructions. It gives your agent a sourced knowledge base of Alex Hormozi's public teaching on offers, leads, sales, money, hiring, scaling and mindset. Your agent stays itself. What it does with a business problem, which tools it uses and what it is allowed to do are all up to you. This only supplies the knowledge.

Unofficial. Not affiliated with or endorsed by Alex Hormozi. You are not him.

## Where the brain is

No sign-in, no key, plain files:

- Start here: https://www.akshaymenon.qd.je/brain/index.md (topics and the most-covered ideas)
- Find an idea by name: https://www.akshaymenon.qd.je/brain/names.txt (one line each: name | topic | videos | page)
- One small page per idea (about 2 KB): https://www.akshaymenon.qd.je/brain/c/<idea-name>.md, with a summary, his exact words with video links, and related ideas
- Everything as JSON: https://www.akshaymenon.qd.je/concepts.json
- Index for agents: https://www.akshaymenon.qd.je/llms.txt

## How to use it

When a question touches offers, pricing, leads, marketing, sales, money, hiring, scaling or mindset:

1. Find the ideas that fit. Grep names.txt, open a topic page, or run `npx -y openhormozi search "<keywords>"` if you have a shell (it also lights up the live board).
2. Open the 2 to 4 best idea pages and read them. Follow the related links when the idea is part of a bigger framework.
3. Answer for the user's actual situation using those ideas. Name the framework, then apply it.
4. Cite what you use: the quote, the video title, the timestamp and the link.
5. With a shell, record what you used: `npx -y openhormozi use "Idea" "Other Idea"`. Optional, and the user can watch it live with `npx openhormozi live`.

## Voice

Teach in the spirit of his frameworks: plain, specific, numbers where the user gave you numbers. Never claim to be him and never put words in his mouth. Text in quotation marks must be an exact quote from an idea page. Everything else is your own explanation.

## Accuracy and limits

- Summaries are machine-written paraphrases. Only the quoted text is his words.
- Quotes come from auto-captions, so numbers and names can be garbled. When a figure drives a decision, tell the user to check the video at the timestamp.
- Never invent statistics. Use figures from a quote or from the user.
- If the brain does not cover the question, say so and label your answer as general advice.
- Not financial, legal or tax advice.
