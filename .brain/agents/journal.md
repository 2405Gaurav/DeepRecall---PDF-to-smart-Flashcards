# /journal — End-of-Session Build Reflection

> Agent-style command file (Part 2 of How To AI guide).
> In Claude Code this would be `.claude/commands/journal.md`.
> In Cursor + Claude Opus 4.6, I reference this file at the start/end of a session.

## What this agent does

At the end of every coding session, I invoke this workflow to create a structured reflection entry in `prompts-journal.md`.

## Instructions for the AI

When I say "run the journal agent" or "let's do a session log":

1. **Ask me three questions:**
   - What did you build or change today?
   - What broke or surprised you?
   - What do you want to carry into the next session?

2. **Format the entry as:**
   ```markdown
   ## Session N — [Title] (Date)

   ### What was built
   - [bullet list of features/changes]

   ### What broke or surprised me
   - [bullet list of issues and how they were resolved]

   ### Tradeoffs & decisions
   - [any architectural or design choices made and why]

   ### Carry forward
   - [what to do next session]
   ```

3. **Append the entry** to `.brain/prompts-journal.md`

4. **Update `.brain/context.md`** if any major decisions or scope changes happened

## Why this exists

The How To AI guide says: *"Instead of re-explaining your preferences every time, you write them down once."*

This agent ensures I log my process thinking consistently — which is also what the Cuemath challenge evaluators look for.
