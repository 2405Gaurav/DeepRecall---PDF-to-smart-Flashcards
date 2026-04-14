# /research — Topic Research Brief Generator

> Agent-style command file (Part 2 of How To AI guide).
> In Claude Code this would be `.claude/commands/research.md`.
> In Cursor + Claude Opus 4.6, I reference this file when I need to research a topic.

## What this agent does

When I need to understand a topic before implementing it (e.g., "how does SM-2 work?", "what are best practices for confetti animations?"), this workflow produces a structured brief.

## Instructions for the AI

When I say "research [topic]" or "I need a brief on [topic]":

1. **Search the web** for the latest information on the topic
2. **Create a structured brief** with:
   ```markdown
   # Research: [Topic]
   _Date: [today]_

   ## Summary
   [2-3 paragraph overview]

   ## Key Facts
   - [bullet points of important details]

   ## Interesting Angles
   - [non-obvious insights, edge cases, or creative approaches]

   ## How This Applies to DeepRecall
   - [specific ways this knowledge could improve our project]

   ## Sources
   - [list of URLs consulted]
   ```
3. **Save to** `.brain/research/[date]-[topic-slug].md`

## Why this exists

Several features (spaced repetition algorithm, streak psychology, confetti animations) required research before building. This agent standardizes how I gather and store that knowledge.
