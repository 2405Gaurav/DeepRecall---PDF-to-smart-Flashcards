# 🛠️ DeepRecall — Technical Reference

> [← Back to main README](./README.md)

A complete technical breakdown of the architecture, stack, APIs, and how to run DeepRecall locally.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server components, edge-ready, file-based routing |
| **Styling** | Tailwind CSS + custom tokens | Speed + custom teal/coral lab palette |
| **Animations** | Framer Motion | Smooth spring/tween animations, AnimatePresence |
| **Charts** | Recharts (lazy-loaded) | Lightweight, responsive bar charts for analytics |
| **Database** | PostgreSQL via [Neon](https://neon.tech) (serverless) | Serverless-friendly pooling, great for Vercel |
| **ORM** | Prisma + `@prisma/adapter-pg` | Type-safe queries, migrations, schema first |
| **AI** | Google Gemini API (`gemini-2.0-flash`) | Card generation from PDF text — generous free tier |
| **Auth** | JWT cookies (`jose`) + `bcryptjs` | httpOnly session cookie — no OAuth required |
| **PDF parsing** | `pdf-parse` | Text extraction from uploaded PDFs |

---

## Project Structure

```
deeprecall/
├── app/
│   ├── page.tsx                  ← Home (marketing + auth for logged-in)
│   ├── profile/page.tsx          ← Full analytics + streak + badges
│   ├── studio/
│   │   ├── page.tsx              ← Studio: upload + deck list
│   │   ├── deck/[id]/page.tsx    ← Deck detail + card list
│   │   └── practice/[id]/page.tsx← Practice session
│   └── api/
│       ├── auth/login            ← POST: login → JWT cookie
│       ├── auth/logout           ← POST: clear cookie
│       ├── auth/register         ← POST: signup
│       ├── me/                   ← GET: current user, analytics, streak
│       ├── onboarding/           ← POST: complete onboarding
│       ├── decks/[id]/           ← GET/DELETE deck, GET cards
│       ├── flashcard/[id]/       ← PATCH: review outcome (SM-2)
│       └── upload/               ← POST: PDF → Gemini → cards saved
│
├── components/
│   ├── home/
│   │   ├── ui/                   ← AuthModal, OnboardingModal, HeroSection
│   │   ├── CuemathHomeShell.tsx  ← Home page shell with Suspense
│   │   ├── CueFlashcardSection.tsx← Interactive feature showcase
│   │   ├── FeaturesSection.tsx
│   │   └── FaqSection.tsx
│   ├── studio/
│   │   ├── ui/                   ← ProgressRing, DeckStatCard, FlashcardItem, DeckActionsBar
│   │   ├── StudioClient.tsx      ← Upload entry + deck list
│   │   ├── StudioDeckClient.tsx  ← Deck detail view
│   │   ├── StudioUploadForm.tsx  ← PDF upload + Gemini flow
│   │   ├── CreateFlashcardsModal.tsx
│   │   └── PracticeSession.tsx   ← Full practice session
│   ├── profile/
│   │   ├── ui/                   ← ProfileHeader, StreakSection, AnalyticsStatCard, MiniStat
│   │   └── ProfileClientBento.tsx← Profile dashboard
│   ├── layout/
│   │   └── Navbar.tsx
│   └── ui/                       ← Shared custom UI
│       ├── BadgeDisplay.tsx      ← StreakBanner, BadgeWall, NewBadgeCelebration
│       ├── Confetti.tsx
│       ├── CueMathLoader.tsx
│       ├── FloatingParticles.tsx
│       ├── SlideCtaButton.tsx
│       └── StreakCounter.tsx
│
├── lib/
│   ├── spaced-repetition.ts      ← SM-2 interval algorithm
│   ├── streaks.ts                ← Streak calculation + badge unlock logic
│   ├── user-analytics.ts         ← Analytics aggregation queries
│   ├── jwt.ts                    ← Token sign/verify (jose)
│   ├── auth-session.ts           ← getSessionUser() helper
│   ├── db.ts                     ← Prisma singleton
│   ├── db-enums.ts               ← Enum literals (avoids stale Prisma client)
│   └── types.ts                  ← Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma             ← Database schema
│   └── seed.ts                   ← Demo user seeder (16-day streak + 2 badges)
│
└── .brain/
    ├── context.md                ← Living product context (AI reads every session)
    ├── prompts-journal.md        ← Build log: decisions, breakages, tradeoffs
    ├── config.json               ← AI assistant configuration
    └── prompt                    ← System prompt
```

---

## Database Schema

```prisma
model User {
  id                    String    @id @default(uuid())
  username              String    @unique
  passwordHash          String
  displayName           String
  childName             String?
  grade                 String?
  onboardingCompletedAt DateTime?

  // streak tracking
  currentStreak      Int       @default(0)
  longestStreak      Int       @default(0)
  lastPracticeDate   DateTime?
  totalPracticeDays  Int       @default(0)

  decks   Deck[]
  badges  Badge[]
}

model Badge {
  id          String   @id @default(uuid())
  userId      String
  slug        String
  title       String
  emoji       String
  description String
  unlockedAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  @@unique([userId, slug])
}

model Deck {
  id         String      @id @default(uuid())
  userId     String
  title      String
  createdAt  DateTime    @default(now())
  flashcards Flashcard[]
  user       User        @relation(fields: [userId], references: [id])
}

model Flashcard {
  id           String   @id @default(uuid())
  deckId       String
  question     String
  answer       String
  cardType     String?
  masteryLevel String   @default("NEW")   // NEW | LEARNING | FAMILIAR | MASTERED
  interval     Int      @default(1)        // days until next review
  nextReview   DateTime @default(now())
  easyCount    Int      @default(0)
  hardCount    Int      @default(0)
  deck         Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  reviewLogs   ReviewLog[]
}

model ReviewLog {
  id          String    @id @default(uuid())
  flashcardId String
  outcome     String    // EASY | FAMILIAR | HARD | LEARNING | MASTERED
  reviewedAt  DateTime  @default(now())
  flashcard   Flashcard @relation(fields: [flashcardId], references: [id], onDelete: Cascade)
}
```

---

## Spaced Repetition Algorithm

File: `lib/spaced-repetition.ts`

```
Outcome →  New Mastery Level  →  Next Review Interval
─────────────────────────────────────────────────────
EASY       +1 level            interval × 2.2  (min 1d, max 30d)
FAMILIAR   stay                interval × 1.3
HARD       -1 level            1 day (back to soon)
LEARNING   stay at LEARNING    1 day
```

Review queue sorts by `nextReview ASC NULLS LAST` — most overdue cards always appear first.

---

## Key API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account + set JWT cookie |
| POST | `/api/auth/login` | Validate credentials + set JWT cookie |
| POST | `/api/auth/logout` | Clear `cue_session` cookie |
| GET | `/api/me` | Current user profile |
| GET | `/api/me/analytics` | 7-day chart, top/struggle cards, stat counts |
| GET | `/api/me/streak` | Current streak + earned badges |
| POST | `/api/onboarding` | Save displayName, childName, grade |
| POST | `/api/upload` | PDF → Gemini → save deck + flashcards |
| GET | `/api/decks/:id` | Deck metadata + mastery stats |
| GET | `/api/decks/:id/cards` | All flashcards in deck |
| DELETE | `/api/decks/:id` | Delete deck + cascade flashcards |
| PATCH | `/api/flashcard/:id` | Record review outcome (SM-2 update) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd deeprecall
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY

# 3. Push schema to database
npx prisma generate
npx prisma db push

# 4. Seed the test user (optional)
npm run db:seed
# → Creates test123 / pass123 with 16-day streak + 2 badges

# 5. Run the dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."        # Neon connection string
JWT_SECRET="your-long-random-secret"   # Min 32 chars
GEMINI_API_KEY="your-gemini-api-key"   # From Google AI Studio
```

---

## Authentication Flow

```
User submits login form
  → POST /api/auth/login
  → bcrypt.compare(password, passwordHash)
  → jose.SignJWT({ userId, username })
  → Set-Cookie: cue_session=<token>; HttpOnly; SameSite=Lax

Protected API routes:
  → Read cookies().get('cue_session')
  → verifyToken(token) → { userId }
  → Query Prisma with userId
```

No OAuth, no third-party auth libraries. Session stored in a signed JWT cookie. Expires in 30 days.

---

## Badge Milestone List

| Slug | Badge | Milestone |
|---|---|---|
| `streak-3` | 🌱 First Steps | 3-day streak |
| `streak-5` | 🌿 Growing Strong | 5-day streak |
| `streak-7` | ⭐ One Week Strong | 7-day streak |
| `streak-10` | 🔥 Ten Day Torch | 10-day streak |
| `streak-15` | 🏅 Half-Month Hero | 15-day streak |
| `streak-21` | 💎 Three Week Diamond | 21-day streak |
| `streak-30` | 👑 Monthly Master | 30-day streak |
| `streak-50` | 🚀 Fifty Day Flyer | 50-day streak |
| `streak-100` | 🌟 Century Scholar | 100-day streak |
| `days-25` | 🎯 Quarter Century | 25 total days |
| `days-50` | 🏆 Fifty Sessions | 50 total days |
| `days-100` | 🦁 Centurion | 100 total days |
| `days-200` | ✨ Legend | 200 total days |

---

## Performance Optimizations Applied

- **Lazy-loaded Recharts** — imported via `React.lazy()` + `Suspense`, only bundled when the analytics section is viewed
- **Modular component architecture** — `studio/ui/` and `profile/ui/` sub-folders with barrel exports for tree-shaking
- **`AnimatePresence mode="wait"`** — ensures clean crossfade (no overlap) when the feature showcase image changes
- **Fixed image dimensions** — `width`/`height` props + `sizes` on all `<Image>` components prevent layout shift (CLS)
- **`priority`** prop on above-the-fold images
- **2-keyframe Framer Motion animations only** — avoids the spring engine's "only two keyframes" runtime error
- **Server Components by default** — client components are marked `'use client'` only where necessary
- **`Suspense` fallbacks** on all async client boundaries

---

## Security Notes

- `.env` is in `.gitignore` — never committed
- `.env.example` contains **placeholder values only**
- All API keys are server-side only (never in client bundles)
- JWT signed with `jose` using `HS256`
- Passwords hashed with `bcryptjs` cost factor 12
- All Prisma queries use parameterised inputs (no raw SQL injection surface)

---

> [← Back to main README](./README.md)
