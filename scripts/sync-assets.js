// Copies the skill, agent and setup prompt from site/ into assets/ so the npm package works offline for installs.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'assets');
fs.mkdirSync(out, { recursive: true });
for (const [src, dst] of [['site/skill/SKILL.md', 'SKILL.md'], ['site/agent.md', 'agent.md'], ['SETUP.md', 'setup.md'], ['site/index.html', 'board.html']])
  fs.copyFileSync(path.join(root, src), path.join(out, dst));
console.log('assets synced');
