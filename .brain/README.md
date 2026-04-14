# `.brain/` — The Second Brain (How To AI Style)

> *"Your local files ARE the AI's memory. The better you organize them, the smarter Claude becomes."*

This folder is the **Brain** for this project — modeled after the [How To AI](https://howtoclaude.ai) guide's core concept. Instead of explaining context in every chat, we maintain **living markdown files** that the AI reads every session.

## The Setup (Adapted from Part 0)

The PDF guide describes a **Claude Code + Obsidian** split-screen setup. I don't have Claude Code, so I adapted the same philosophy using:

| Guide recommends | What I actually use |
|---|---|
| **Claude Code** (terminal AI) | **Cursor IDE** with **Claude Opus 4.6** (composer / agent mode) |
| **Obsidian** (markdown viewer) | **Cursor's built-in editor** (sees the same files the AI reads) |
| `~/Documents/Brain/` folder | `.brain/` folder inside the project repo |
| `cd ~/Documents/Brain && claude` | Open project in Cursor → AI already sees `.brain/` |

Same principle, different tools. The AI reads these files at the start of every session, so it never starts from zero.

---

## File Map (How each file maps to the guide)

```
.brain/
├── README.md              ← You are here. Explains the Brain setup.
├── context.md             ← Part 1: Living product context (about-me + goals + brief combined)
├── about-me.md            ← Part 1: Who I am, skills, background
├── my-goals.md            ← Part 1: What I want to achieve
├── config.json            ← Part 0: Workspace config (how tools are wired)
├── prompt                 ← Part 2: Standing instructions (lightweight "agent" defaults)
├── prompts-journal.md     ← Process thinking log — what was tried, what broke, iterations
├── agents/                ← Part 2: Saved workflows (agent-style command files)
│   ├── journal.md         ← /journal — end-of-session reflection
│   ├── research.md        ← /research — topic research brief generator
│   └── review-code.md     ← /review-code — code review checklist
└── ignore                 ← Paths the AI should skip (secrets, node_modules, etc.)
```

---

## How This Maps to the Three Levels

### Level 1: Context (Part 1 of the guide)
> *"If you find yourself repeating something to Claude, put it in a file instead."*

- **`context.md`** — Product brief, architecture decisions, schema, flows. Updated every session.
- **`about-me.md`** — Who I am, my skills, what I'm learning.
- **`my-goals.md`** — What I want from this project and in the near term.

These files mean Claude Opus 4.6 in Cursor knows my full context without me re-explaining it.

### Level 2: Agents (Part 2 of the guide)
> *"An agent compresses a complex, repeatable workflow into a single command."*

The guide uses `.claude/commands/` for saved agents. Since I'm using Cursor (not Claude Code), I keep my agent-style instructions in `.brain/agents/`. I reference them at the start of a session or paste them in as needed.

- **`agents/journal.md`** — End-of-session build log template
- **`agents/research.md`** — Structured topic research
- **`agents/review-code.md`** — Pre-commit code review checklist

### Level 3: Tools (Part 3 of the guide)
> *"Tools give you visual interfaces for managing complex work."*

The DeepRecall app itself is the tool — a visual flashcard dashboard built through AI conversation. Every feature was described as a WHAT and built by Claude Opus 4.6 as the HOW.

---

## The Core Principle

> **You focus on WHAT. Claude figures out the HOW.**

I describe the outcome I want. Cursor + Claude Opus 4.6 figures out the implementation. When something breaks, I paste the error. When I want something different, I describe what's different.

---

_Not using Claude Code CLI — using **Cursor IDE + Claude Opus 4.6** with the same WHAT/HOW philosophy the PDF describes._
