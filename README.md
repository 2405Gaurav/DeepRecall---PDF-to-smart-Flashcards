<div align="center">

# 🧠 DeepRecall
### *by Cuemath — AI Builder Challenge, Problem 1: The Flashcard Engine*

**Turn any PDF into a smart, practice-ready flashcard deck.**  
Active recall · Spaced repetition · Streaks · Badges · Delight.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-0f766e?style=for-the-badge)](https://deeprecall.netlify.app)
[![Tech Stack](https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js)](./TECHNICAL.md)
[![AI Built](https://img.shields.io/badge/Built%20with-Cursor%20%2B%20Claude%20Opus%204.6-6d28d9?style=for-the-badge)](https://cursor.sh)

</div>

---

## ✨ What is DeepRecall?

Most students study by **passively re-reading notes**. That doesn't work.

DeepRecall flips the script — drop in a PDF (a chapter on quadratic equations, French Revolution notes, biology diagrams) and get back a **teacher-quality flashcard deck** that schedules itself. Cards you nail fade away. Cards you struggle with come back sooner.

> North star: **Long-term retention over short-term cramming.**

---

## 🖼️ Feature Showcase

| Landing Page | Practice Session |
|---|---|
| Interactive feature demo, floating particles, hero animations | 3D card flip, streak counter, mascot reactions, confetti bursts |

| Profile Dashboard | Studio Upload |
|---|---|
| Analytics charts, streak banner, trophy wall, struggle cards | PDF drag-drop, 3 card presets, AI progress loader |

<div align="center">

![Teacher-quality flashcards](./public/images/child-flashcards.png)
*AI-generated cards that feel written by a great teacher, not scraped by a bot*

</div>

---

## 🚀 Core Features

### 📄 Ingestion — PDF → Smart Flashcards
- Drop any text-based PDF and let **Google Gemini** extract it into comprehensive cards
- **3 quality presets**: Light (6–12 cards), Balanced (15–28), Deep (30–50)
- Cards cover: key concepts, definitions, relationships, edge cases, worked examples
- Not shallow bullet dumps — teacher-quality, recall-heavy questions

### 🔁 Spaced Repetition (SM-2 Inspired)
- Four mastery levels: `NEW → LEARNING → FAMILIAR → MASTERED`
- Growing review intervals: 1d → 3d → 7d → 14d → 30d
- Most overdue cards always surface first in the practice queue
- Easy cards fast-track to mastered; hard cards reset and return sooner

### 🎮 Practice Session — The Crown Jewel
- **3D card flip** — CSS perspective transform reveals the answer cinematically
- **3 outcome buttons**: 😅 Hard / 🤔 OK / ✅ Easy — simple enough for kids
- **Live streak counter** with escalating messages: *"🔥 Nice!" → "🚀 Unstoppable!" → "✨ PERFECT RUN!"*
- **Mascot emoji** reacts to performance (😄 happy, 🤔 thinking, 🥳 celebrating)
- **Confetti burst** on deck completion and badge unlocks
- **Rainbow progress bar** — turns full rainbow at 100%
- **Session summary** with animated stats, best streak, and mastery breakdown

### 🔥 Streaks & 🏅 Badges
- Daily practice streaks tracked in the database (per-day, not per-card — no spam incentive)
- **9 streak milestone badges**: 3, 5, 7, 10, 15, 21, 30, 50, 100 days
- **4 total-days badges**: 25, 50, 100, 200 total practice days
- Badges are **permanent** — never revoked even if streak breaks (encouraging, not punishing)
- Full-screen badge celebration popup when a new milestone is hit
- "Next badge in X days" progress indicator keeps kids motivated

### 📊 Profile & Analytics
- Bar chart of reviews for the last 7 days (easy vs. hard split)
- Mastered / Reviews / Due Now / Decks stat cards
- **Struggle cards** — your hardest 5 cards across all decks
- **Strongest cards** — your personal hero cards
- Recent activity feed with outcomes
- Full streak banner + badge trophy wall

### 🗂️ Deck Management
- Browse all decks with mastery emoji indicators (🚀 → 📈 → 💪 → 🌟 → 🏆)
- Animated progress ring per deck
- Paginated card list with show/hide answers toggle
- Reset individual cards back to NEW
- Delete deck (with confirmation)

---

## 🎁 Bonus Features

| Feature | What it does |
|---|---|
| 🎊 **Confetti system** | Colorful shapes (circles, stars, squares) fire on mastery & completion |
| 🌊 **Floating particles** | Ambient emoji particles (📘✨🧠⭐) drift across the hero section |
| 🌈 **Rainbow progress** | Progress bar transforms to rainbow gradient at 100% |
| ⬆️ **Upload loader** | Rotating tips & stage messages while Gemini processes your PDF |
| 🔔 **Empty-state motivation** | Joyful gradient cards with motivational quotes when no streak/badge yet |
| 💤 **Lazy-loaded charts** | Recharts only loads when you scroll to the analytics section |
| 🧩 **Modular architecture** | `studio/ui/`, `profile/ui/` sub-component folders with barrel exports |
| 🌀 **CueMathLoader** | Consistent animated loader (cycling emojis + rotating tips) across all loading states |
| 🌐 **Responsive design** | Works on mobile, tablet, and desktop |
| 🔐 **Session auth** | httpOnly JWT cookies — no OAuth complexity, friendlier for kids |
| 🌱 **DB seed script** | `npm run db:seed` — seeds test user with 16-day streak + 2 badges |

---

## 🤖 How I Used AI to Build This

### The Tool: Cursor + Claude Opus 4.6

I didn't have access to **Claude Code** (the CLI tool described in the How-To-AI guide), so I adapted the same workflow using **Cursor IDE** paired with **Claude Opus 4.6** — Cursor's built-in AI assistant that can read project files, write code, run terminal commands, and build features through conversation.

The core principle from the guide applied perfectly:

> **You focus on WHAT. Claude figures out the HOW.**

I described what I wanted. Claude Opus 4.6 in Cursor figured out the architecture, wrote the components, debugged the errors, and kept the codebase consistent.

### How My Setup Maps to the Guide

| Guide recommends | What I used instead |
|---|---|
| **Claude Code** (terminal AI) | **Cursor IDE** with **Claude Opus 4.6** (composer / agent mode) |
| **Obsidian** (markdown viewer) | **Cursor's built-in editor** (sees the same files the AI reads) |
| `~/Documents/Brain/` folder | `.brain/` folder inside the project repo |
| `.claude/commands/` for agents | `.brain/agents/` for saved workflow instructions |
| Split screen: terminal left, Obsidian right | Split screen: editor left, AI chat right |

Same philosophy, different tools. The **WHAT / HOW** principle is tool-agnostic.

### The `.brain` Folder — My Second Brain (All 3 Levels)

The How-To-AI guide describes three levels of AI-native work. My `.brain/` folder covers all three:

#### Level 1: Context (Part 1 — Exercises 1.1–1.3)
> *"Your local files ARE the AI's memory."*

```
.brain/
├── context.md        ← Living product context: what it is, principles, stack, schema, decisions
├── about-me.md       ← Who I am, skills, how I work with AI (Exercise 1.2)
├── my-goals.md       ← Project goals + 6-month goals (Exercise 1.3)
```

**`context.md`** is updated each session as scope shifts. Claude Opus 4.6 reads it automatically so it has full context without re-explanation.

#### Level 2: Agents (Part 2 — Exercises 2.1–2.3)
> *"An agent compresses a complex, repeatable workflow into a single command."*

```
.brain/agents/
├── journal.md        ← End-of-session build reflection (Exercise 2.1)
├── research.md       ← Topic research brief generator (Exercise 2.2)
├── review-code.md    ← Pre-commit code review checklist (Exercise 2.3)
```

Since I'm not using Claude Code CLI (which supports `/command` syntax), I keep agent instructions as markdown files and reference them manually in Cursor when needed.

#### Level 3: Tools (Part 3)
> *"Tools give you visual interfaces for managing complex work."*

**DeepRecall itself is the tool** — a full visual dashboard/app built entirely through AI conversation. Every feature was described as a WHAT and built by Claude Opus 4.6 as the HOW.

#### Supporting files
```
.brain/
├── prompt                ← Standing instructions for the AI (project rules, code conventions)
├── prompts-journal.md    ← Process thinking log — every session documented
├── config.json           ← Workspace config with guide mappings
└── ignore                ← Paths the AI should skip (secrets, node_modules)
```

**`prompts-journal.md`** documents every session: what was built, what broke, tradeoffs made, algorithm decisions, what I'd do differently. This is the **"process thinking"** artifact the challenge asks for.

### The Build Flow

```
Session 1: Foundation
  → Architecture, auth, PDF upload, Gemini integration, Prisma schema

Session 2: Spaced Repetition
  → SM-2 algorithm, practice queue, review logging, profile analytics

Session 3: Delight Overhaul
  → 3D card flip, confetti, mascot, floating particles, rainbow progress

Session 4: Streaks & Badges
  → Streak tracking, 9 badge milestones, badge celebrations, trophy wall

Session 5: Polish & Modularization
  → Loader components, component architecture, lazy loading, README

Session 6: Brain Folder Overhaul
  → Full How To AI alignment, agent files, context files, README updates
```

Every session: I described the feature → Claude Opus 4.6 built it → I tested → fed errors back → iterate.

---

## 🧪 Try It Yourself

```
Username: test123
Password: pass123
```

This test account has a **16-day streak**, **2 badges earned** (⭐ One Week Strong, 🏅 Half-Month Hero), and sample decks ready to practice.

---

## What I'd Build Next

1. 🔊 **Sound effects** — satisfying "ding" on correct, "whoosh" on flip
2. 🌙 **Dark mode** — neon-style for older students
3. ✏️ **Card editing** — let users tweak AI-generated cards
4. 📱 **PWA** — install on phone, offline card review
5. 🤝 **Shared decks** — classmates can share decks
6. 📤 **Export** — download as Anki format or CSV

---

## 📚 Technical Documentation

> Want to know the stack, API routes, database schema, and how to run it locally?

**[→ Explore the Technical README](./TECHNICAL.md)**

---

<div align="center">

Built by Gaurav · Cuemath AI Builder Challenge 2026

*"Flashcard apps are notoriously boring. Yours doesn't have to be."*

</div>
