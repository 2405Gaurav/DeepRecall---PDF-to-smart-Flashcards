<div align="center">

# 🧠 DeepRecall
### *by Cuemath — AI Builder Challenge, Problem 1: The Flashcard Engine*

**Turn any PDF into a smart, practice-ready flashcard deck.**  
Active recall · Spaced repetition · Streaks · Badges · Delight.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-0f766e?style=for-the-badge)](https://deeprecall.netlify.app)
[![Tech Stack](https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js)](./TECHNICAL.md)
[![AI Built](https://img.shields.io/badge/Built%20with-Antigravity%20AI-6d28d9?style=for-the-badge)](https://github.com)

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

### The Tool: Antigravity + Claude Opus

I didn't have access to **Claude Code** (the tool described in the How-To-AI guide), so I built using **Antigravity** — a similar agentic AI assistant powered by Claude Opus 4.6 — that runs alongside my editor and can read/write files, run terminal commands, and build features through conversation.

The core principle from the guide applied perfectly:

> **You focus on WHAT. Claude figures out the HOW.**

I described what I wanted. Antigravity figured out the architecture, wrote the components, debugged the errors, and kept the codebase consistent.

### The `.brain` Folder — My Second Brain

The How-To-AI guide talks about creating a **Brain folder** — a local knowledge base of markdown files that the AI reads every session so it never starts from zero. I built my own `.brain/` folder inside the project:

```
.brain/
├── context.md          ← Living product context: what it is, principles, stack, schema, decisions
├── prompts-journal.md  ← Build log: what was tried, what broke, tradeoffs, what I'd improve
├── config.json         ← Persistent AI assistant configuration
├── prompt              ← System prompt for the AI
└── README.md           ← How to use the brain folder
```

**`context.md`** is the equivalent of the guide's *about-me.md* + *my-goals.md* + product brief — I updated it each session as scope shifted. Antigravity reads it at the start of every conversation so it has full context without re-explanation.

**`prompts-journal.md`** documents every session: what was built, what broke, tradeoffs made, algorithm decisions, what I'd do differently. This is the "process thinking" artifact the challenge asks for.

This gave me the same superpower the guide describes:
> *Your local files ARE the AI's memory. The better you organize them, the smarter Claude becomes.*

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
```

Every session: I described the feature → Antigravity built it → I tested → fed errors back → iterate.

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

Built by Gaurav · Cuemath AI Builder Challenge 2025

*"Flashcard apps are notoriously boring. Yours doesn't have to be."*

</div>
