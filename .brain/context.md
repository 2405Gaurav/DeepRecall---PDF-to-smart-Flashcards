# DeepRecall — Cuemath Flashcard Engine

> Living context file. Updated every session so the AI assistant doesn't argue with stale assumptions.

## What this product is

A flashcard engine that turns **any PDF** into a smart, practice-ready deck of flashcards — built for **Cuemath's AI Builder challenge** (Problem 1: The Flashcard Engine).

The product name is **DeepRecall**. It's not math-only — it handles any subject (French Revolution, biology, quadratic equations). The visual language borrows Cuemath's calm **teal & coral lab** palette but the product stands alone.

**North star**: Long-term retention over cramming — **active recall** + **spaced repetition** + **honest progress** + **deck management at scale** + a lot of **delight**.

**Target audience**: Children & students — UI must be fun, animated, encouraging, and never overwhelming.

---

## Evaluation criteria mapping

| Dimension | How we address it |
|---|---|
| **Does it work?** | Fully functional: upload PDF → Gemini generates comprehensive cards → practice with SR scheduling → profile analytics. Deployed on public URL. |
| **Smart choices** | SM-2 inspired algorithm, Gemini prompt engineered for teacher-quality cards (3 presets), session cookies (no OAuth complexity), Prisma + Neon PostgreSQL for serverless edge. |
| **Delight** | 3D card flip, confetti bursts, streak counter, mascot reactions, floating particles, badge celebrations, animated loader, rainbow progress bars — all child-friendly. |
| **Process thinking** | Documented in `prompts-journal.md` — what was tried, what broke, tradeoffs made, what we'd improve. |
| **Security** | `.env.example` has placeholders only. API keys server-side only. No credentials in repo. `.env` in `.gitignore`. |

---

## Product principles

1. **Ingestion quality** — Gemini prompts aim for comprehensive, teacher-like cards (concepts, definitions, relationships, edge cases, examples); depth over shallow volume. Three preset levels: light (6-12), balanced (15-28), deep (30-50).
2. **Spaced repetition** — `lib/spaced-repetition.ts`: SM-2-inspired day intervals; review queue orders **due first** (most overdue first), then upcoming.
3. **Progress / mastery** — NEW → LEARNING → FAMILIAR → MASTERED; deck + profile surfaces due counts and mastery without overwhelming.
4. **Deck management** — Search, sort (due first, then last practiced), emoji mastery indicators. Scales to dozens of decks.
5. **Streaks & badges** — Daily practice streaks tracked in DB. Badges at 3, 5, 7, 10, 15, 21, 30, 50, 100 day milestones. Total-days badges too. Trophy wall on profile.
6. **Delight** — Confetti, 3D flips, streak counter, mascot emoji, floating particles, rainbow progress, bouncy micro-interactions, animated loader with rotating tips.

---

## Flows

| Flow | Description |
|---|---|
| **Home** | Marketing page with floating emoji particles, interactive feature showcase (image changes on click), 7 FAQs, streak banner for logged-in users |
| **Onboarding** | Multi-step modal with animated emojis per step, smooth transitions, playful grade selector |
| **Studio** | PDF upload → choose card count preset → Gemini makes flashcards → Postgres. Streak banner + badge wall shown |
| **Deck view** | Animated progress ring with gradient & emoji, mastery bucket stats, paginated card list, pulse-glow practice CTA |
| **Practice** | Crown jewel — 3D card flip, streak counter, mascot reactions, confetti, badge celebration popups, rainbow progress bar, session completion with stats |
| **Profile** | Full streak banner, badge wall, analytics bar charts, top cards, recent activity |

---

## Stack

- Next.js 15 App Router, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- Prisma + PostgreSQL (Neon serverless)
- Google Gemini API for card generation
- Session cookie auth (no OAuth — intentional simplicity)

---

## Schema summary

| Model | Purpose |
|---|---|
| `User` | Auth, profile, streak fields (currentStreak, longestStreak, lastPracticeDate, totalPracticeDays) |
| `Badge` | Earned achievements — slug, title, emoji, description, unlockedAt. Unique per user+slug |
| `Deck` | PDF-sourced card collection, belongs to user |
| `Flashcard` | Individual card with SR fields: interval, nextReview, masteryLevel, easyCount/hardCount |
| `ReviewLog` | Every review outcome logged for analytics |

---

## Key decisions

- **Enum literals** in `lib/db-enums.ts` so APIs don't break if Prisma client is stale on Windows.
- `/deck/[id]` redirects to `/studio/deck/[id]`.
- Navbar must not pass server lambdas into client components.
- `.env.example` uses **placeholder values only** — security requirement.
- Streak tracking happens alongside card review (non-blocking) — if streak DB write fails, card save still succeeds.
- CueMathLoader component used consistently across all loading states.

---

## Animation system

**CSS keyframes** in `globals.css`: wiggle, bounce-in, pulse-glow, rainbow-shimmer, float-gentle, sparkle, slide-up-bounce, card-flip, gradient-flow, celebration-burst.

**3D CSS helpers**: `.perspective-600`, `.preserve-3d`, `.backface-hidden`, `.rotate-y-180`.

**Custom components**: `Confetti.tsx`, `FloatingParticles.tsx`, `StreakCounter.tsx`, `BadgeDisplay.tsx`, `CueMathLoader.tsx`.

---

_Update this file when scope shifts._
