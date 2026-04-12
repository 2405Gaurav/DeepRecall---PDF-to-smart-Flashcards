# DeepRecall — Cuemath Flashcard Engine

> **Problem 1: The Flashcard Engine** — AI Builder Challenge

A flashcard app that turns **any PDF** into a smart, practice-ready deck of flashcards. Drop in a chapter on quadratic equations or class notes on the French Revolution — get back a clean set of cards written like a great teacher would write them. Then practice with spaced repetition, earn streak badges, and watch your mastery grow.

## ✨ What makes this special

### 1. Ingestion Quality
PDFs become **recall-heavy questions** — concepts, definitions, relationships, edge cases, worked examples. Not shallow trivia. Three presets:
- **Light** (6-12 cards) — quick review
- **Balanced** (15-28 cards) — recommended for most chapters
- **Deep** (30-50 cards) — comprehensive coverage

### 2. Spaced Repetition (SM-2 Inspired)
Cards you nail show up later. Cards you struggle with return sooner. The algorithm uses growing intervals: 1 day → 3 days → 7 days → 14 days → 30 days. Four mastery levels: NEW → LEARNING → FAMILIAR → MASTERED.

### 3. Progress & Mastery
Every deck shows what you've mastered, what's shaky, and what's coming up for review. Profile page has analytics charts, top cards, and recent activity.

### 4. Deck Management at Scale
Search, sort (due first, then last practiced), emoji mastery indicators, and it works for dozens of decks.

### 5. Streaks, Badges & Milestones 🏆
Daily practice streaks tracked in the database. Earn badges at 3, 5, 7, 10, 15, 21, 30, 50, and 100-day milestones. Full-screen celebrations when a new badge is earned. Trophy wall on your profile.

### 6. Delight 🎉
3D card flips, confetti bursts on mastery, animated mascot reactions, floating emoji particles, rainbow progress bars, an animated loader with rotating study tips, and bouncy micro-interactions everywhere. Because flashcard apps don't have to be boring.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
cd project
npm install
```

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your-gemini-api-key-here
```

Push schema to database:

```bash
npm run db:push
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
User Flow:
  Home → Onboarding (name, grade) → Studio
    ↓
  Upload PDF → Gemini generates cards → Saved to PostgreSQL
    ↓
  Practice Session (SR queue) → Review logged → Streak updated → Badge check
    ↓
  Profile (analytics, streak banner, badge wall)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Database | Prisma + PostgreSQL (Neon serverless) |
| AI | Google Gemini API |
| Charts | Recharts |
| PDF Parsing | pdf-parse |

### Database Schema

| Model | Purpose |
|-------|---------|
| `User` | Auth, profile, streak tracking (currentStreak, longestStreak, lastPracticeDate, totalPracticeDays) |
| `Badge` | Earned achievements — slug, title, emoji, description. Unique per user+slug. |
| `Deck` | Card collection from a PDF. Belongs to a user. |
| `Flashcard` | Individual card with SR fields: interval, nextReview, masteryLevel, easyCount/hardCount |
| `ReviewLog` | Every review outcome logged for analytics |

---

## 📡 API Routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/upload` | PDF → extract text → Gemini → deck + cards |
| `GET` | `/api/decks` | List decks with stats (due, mastered, in progress) |
| `GET` | `/api/decks/[id]` | Deck metadata + stats |
| `GET` | `/api/decks/[id]/review` | Due or all cards, sorted for SRS |
| `GET` | `/api/decks/[id]/cards` | All cards for a deck |
| `PATCH` | `/api/flashcard/[id]` | Review outcome + streak update + badge check |
| `GET` | `/api/me/session` | Current user session |
| `GET` | `/api/me/analytics` | User analytics (reviews, mastery, top cards) |
| `GET` | `/api/me/streak` | Streak data + earned badges |
| `POST` | `/api/onboarding` | Complete onboarding (name, grade, child) |

---

## 🔐 Security

- `.env.example` contains **only placeholder values** — no real keys
- `.env` is in `.gitignore` — never committed
- API keys are **server-side only** — browser never sees them
- Session cookies are `httpOnly`
- Deck ownership checks on all API routes

---

## 🎨 Key Decisions & Tradeoffs

1. **SM-2 inspired, not full SM-2** — Four simple mastery levels instead of quality grades 0-5. Kids understand 3 buttons better than a 6-point scale.

2. **Session cookies over OAuth** — For a children's app, a friendly onboarding modal beats Google login friction. Trade: no cross-device sync (acceptable for v1).

3. **Gemini over OpenAI** — Generous free tier, good instruction following for structured card generation.

4. **Three presets over free-form count** — Guides users toward quality. "500 cards" would give shallow results.

5. **Streak tracking per-day, not per-card** — Can't game it by reviewing the same card 100 times. Must come back tomorrow.

6. **Non-blocking streak updates** — If the streak DB write fails, the card save still succeeds. Streaks are nice-to-have; card progress is critical.

---

## 🔮 What I'd Improve With More Time

1. **OTP verification** — Currently accepts dummy phone numbers
2. **Sound effects** — "Ding" on correct, "whoosh" on card flip
3. **Card editing** — Let users modify AI-generated cards
4. **Dark mode** — Neon-style animations for teen users
5. **PWA** — Install on phone, offline card review
6. **Multi-PDF decks** — Merge multiple PDFs into one deck
7. **Export** — CSV or Anki-compatible format
8. **Collaborative decks** — Share between classmates
9. **Achievement system v2** — XP points, daily challenges, leaderboards

---

## 📁 Project Structure

```
project/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # All API endpoints
│   ├── studio/            # Studio pages (upload, deck view, practice)
│   └── profile/           # User profile & analytics
├── components/
│   ├── cuemath/           # Homepage, navbar, footer, onboarding
│   ├── studio/            # Upload form, practice session, deck client
│   ├── profile/           # Profile analytics client
│   └── ui/                # Shared UI (loader, confetti, badges, particles)
├── lib/                   # Core logic
│   ├── spaced-repetition.ts  # SM-2 inspired algorithm
│   ├── streaks.ts            # Streak tracking & badge awarding
│   ├── gemini.ts             # Card generation prompts
│   └── user-analytics.ts     # Analytics queries
├── prisma/
│   └── schema.prisma      # Database schema
├── public/images/         # AI-generated illustrations
└── .brain/                # Process thinking documentation
    ├── context.md         # Product context & architecture notes
    └── prompts-journal.md # Build process log
```

---

## 🛠️ Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push schema without migrations
npm run db:migrate   # Run migrations
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio
```

---

Built with ❤️ for the Cuemath AI Builder Challenge.
