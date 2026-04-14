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

Drop any PDF — textbook chapter, class notes, revision sheets — and get back a **teacher-quality flashcard deck** that schedules itself. Cards you nail fade away; cards you struggle with come back sooner.

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
- Drop any text-based PDF and let **CuemathsAI (powered by Google Gemini)** extract it into comprehensive cards
- **3 quality presets**: Light (6–12 cards), Balanced (15–28), Deep (30–50)
- Cards cover: key concepts, definitions, relationships, edge cases, worked examples
- Not shallow bullet dumps — teacher-quality, recall-heavy questions

> [!NOTE]
> **About card generation & the Gemini API** 😅  
> Flashcard generation is powered by the **Google Gemini API (free tier)**. The free plan has rate limits and occasional outages — if generation fails, please **use the pre-existing demo decks** on the test account instead of retrying repeatedly. The session experience (practice, streaks, badges, confetti — the fun stuff) works perfectly regardless!  
> I'm on the free tier for now and I know it's a limitation, but the passion for building with AI is very much alive in me 🔥🚀

### 🔁 Spaced Repetition (SM-2 Inspired)
- Four mastery levels: `NEW → LEARNING → FAMILIAR → MASTERED`
- Growing review intervals: 1d → 3d → 7d → 14d → 30d
- Most overdue cards always surface first in the practice queue
- Easy cards fast-track to mastered; hard cards reset and return sooner

### 🎮 Practice Session — The Crown Jewel
- **3D card flip** with CSS perspective transform
- **3 outcome buttons**: 😅 Hard / 🤔 OK / ✅ Easy — simple enough for kids
- **Live streak counter** with escalating messages (*"🔥 Nice!" → "🚀 Unstoppable!" → "✨ PERFECT RUN!"*)
- **Mascot emoji** reacts to performance · **Confetti burst** on milestones
- **Rainbow progress bar** at 100% · **Session summary** with animated stats

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
| 🎊 **Confetti system** | Colorful shapes fire on mastery & completion |
| 🌊 **Floating particles** | Ambient emoji particles drift across the hero section |
| 🌀 **CueMathLoader** | Consistent animated loader with cycling emojis + rotating tips |
| 🧩 **Modular architecture** | `studio/ui/`, `profile/ui/` sub-component folders with barrel exports |
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

| Level | Guide concept | My implementation |
|---|---|---|
| **L1: Context** | Local files = AI memory | `context.md`, `about-me.md`, `my-goals.md` — updated each session |
| **L2: Agents** | Repeatable workflow commands | `.brain/agents/` — journal, research, review-code markdown templates |
| **L3: Tools** | Visual interfaces for complex work | **DeepRecall itself** — every feature described as WHAT, built by Claude as HOW |

Supporting files: `prompt` (standing instructions), `prompts-journal.md` (process thinking log — the artifact the challenge asks for), `config.json`, `ignore`.

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

Session 7: Card Status Consistency
  → Intent-based mastery (not interval), split analytics queries, profile fix
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
