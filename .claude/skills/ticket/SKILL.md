---
name: ticket
description: Turn the current conversation (or a described idea) into a ticket file for this project's hub board. Use when the owner says "make a ticket", "add this to the board", "ticket this", or when work is identified that should be done later.
---

1. Find the next id: highest `T-NNN` in `.lead/tickets/` + 1.
2. Copy `.lead/tickets/TEMPLATE.md` to `.lead/tickets/T-NNN.md`.
3. Fill frontmatter (`status: inbox`, today's date, priority, suggested effort) and the **Spec** from what was
   decided. Acceptance criteria must be checkable. Name files if known. State what is out of scope.
4. If something is undecided, list it as an open question at the end of the Spec instead of inventing it.
5. Reply with one line: `T-NNN — title (effort)`.

One ticket per independent piece of work. Do not write Plan or Summary.
