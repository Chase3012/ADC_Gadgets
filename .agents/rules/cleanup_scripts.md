---
name: Cleanup Scratch Scripts
description: Rule to ensure agents always delete temporary scripts after execution
---

# Cleanup Scratch Scripts Rule

When you write temporary scripts (such as Node.js `.js` scripts or Python `.py` scripts) in the project root to perform automated modifications, migrations, or batch replacements:

1. You MUST remember to delete these scripts immediately after they have successfully executed and verified their task.
2. The root folder should not be cluttered with `fix_*.js`, `update_*.py`, or similar throwaway injection/migration scripts.
3. Be careful not to delete critical application files like `server.js` or `vite.config.js`.

Always leave the workspace as clean as you found it.
