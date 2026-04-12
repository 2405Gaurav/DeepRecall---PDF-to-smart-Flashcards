# Prompts Journal — Build Process Log

> This file documents the thought process, decisions, tradeoffs, failures, and iterations during the build. It's the "process thinking" artifact the challenge evaluators asked for.

---

## Session 1 — Foundation (Day 1-2)

### What was built
- Next.js 15 App Router project with Tailwind CSS, shadcn/ui
- Prisma schema for Users, Decks, Flashcards, ReviewLogs
- Neon PostgreSQL database (serverless — good for Vercel deployment)
- PDF upload API using `pdf-parse` to extract text
- Gemini API integration for flashcard generation
- Session cookie–based auth (no OAuth)

### Key decisions & tradeoffs
1. **No OAuth** — deliberate choice. For a flashcard app aimed at children, a simple onboarding modal (name, grade, child name) is friendlier than Google/GitHub login. Session cookies are stored server-side and sent via `httpOnly` cookies.
2. **Gemini over OpenAI** — Google AI Studio offers generous free tier. The prompt engineering was more important than the model choice.
3. **pdf-parse over OCR** — works for text-based PDFs out of the box. Image-based PDFs won't work, but thats an acceptable tradeoff for v1.
4. **Three card count presets** — rather than letting users type a number (which leads to bad outcomes like "500 cards"), we offer Light (6-12), Balanced (15-28), Deep (30-50). This guides toward quality.

### What broke
- `pdf-parse` needed `serverExternalPackages` in `next.config.ts` — took 20min to debug.
- Prisma Windows permission errors during `generate` — had to stop dev server first.

---

## Session 2 — Spaced Repetition & Practice (Day 2-3)

### What was built
- SM-2 inspired spaced repetition algorithm in `lib/spaced-repetition.ts`
- Practice session with card queue ordered by due date (most overdue first)
- Review logging — every answer is recorded for analytics
- Profile page with bar charts (Recharts), top cards, recent activity

### Algorithm design thinking
Considered three approaches:
1. **Leitner boxes** — simple but too rigid. Cards move between 5 boxes linearly.
2. **Full SM-2** — complex with quality grades 0-5. Overkill for children.
3. **SM-2 inspired** — our choice. Four mastery levels (NEW → LEARNING → FAMILIAR → MASTERED) with growing intervals (1d, 3d, 7d, 14d, 30d). Easy cards progress faster. Struggle cards reset.

This balances simplicity (kids understand 3 buttons) with effectiveness (intervals actually grow).

### The review queue problem
Initially shuffled cards randomly. This defeats the purpose — an SM-2 system needs **due cards first**. Fixed to sort by `nextReview` ascending so the most overdue card shows first. Cards not yet due appear after.

---

## Session 3 — Delight Overhaul (Day 4-5)

### Why delight matters here
The challenge specifically says "Flashcard apps are notoriously boring. Yours doesn't have to be." Also, our target users are children. We went deep on delight:

### What was built
1. **3D card flip** — CSS perspective transform + Framer Motion. Card literally flips in 3D when you reveal the answer.
2. **Confetti system** — `Confetti.tsx` fires colorful shapes (circles, stars, squares) on mastery and deck completion.
3. **Streak counter** — `StreakCounter.tsx` with escalating messages: "🔥 Nice!" → "🚀 Unstoppable!" → "✨ PERFECT RUN!"
4. **Mascot emoji** — reacts to student performance (😄 happy, 🤔 thinking, 🥳 celebrating).
5. **Floating particles** — ambient emoji particles (📘✨🧠⭐) drift across the hero section.
6. **Rainbow progress bar** — at 100% the progress bar gets a rainbow gradient.
7. **Session complete celebration** — animated stats summary with bouncing emoji and best streak display.

### Tradeoffs
- Used CSS/JS confetti instead of canvas — simpler, no WebGL dependency, SSR compatible
- Used emojis instead of custom SVG icons — universally rendered, children love them, much faster to implement
- Streak resets on wrong answer (not partial) — full reset is more motivating for kids to try harder

### What I'd do differently
- Sound effects would be amazing (satisfying "ding" on correct) but didn't have audio assets
- Haptic feedback on mobile devices

---

## Session 4 — Streaks, Badges & Milestones (Day 5-6)

### What was built
1. **Schema update** — Added `currentStreak`, `longestStreak`, `lastPracticeDate`, `totalPracticeDays` to User model. Created `Badge` model.
2. **Streak logic** — `lib/streaks.ts`: consecutive day tracking. Practice today + yesterday = +1 streak. Gap = reset to 1.
3. **Badge system** — 9 streak badges (3d through 100d) + 4 total-day badges. Each is unique per user (can't earn twice).
4. **API integration** — `recordPracticeDay()` runs after every card review. Non-blocking — if streak DB write fails, card save still succeeds.
5. **Badge celebration** — Full-screen popup when a new badge is earned during practice.
6. **UI surfaces** — Streak banner on homepage (compact), studio (compact), profile (full). Badge wall grid on studio & profile.

### Design decisions
- Streak tracking is **per day**, not per card — avoids rewarding spam reviews
- Badges are permanent (never revoked even if streak breaks) — Encouraging, not punishing
- "Next badge" progress indicator keeps kids motivated toward the next milestone
- Days-to-go counter creates a tangible goal

---

## Session 5 — Polish & Submission Prep (Day 6-7)

### What was built
1. **CueMathLoader** — reusable animated loader with cycling emojis, gradient ring, bouncing dots, rotating messages. Used across ALL loading states for consistency.
2. **UploadLoader** — specialized loader for PDF processing with stage progression and rotating tips ("AI is creating smart flashcards...", "Building questions that make you think...")
3. **Interactive feature showcase** — homepage section where clicking a feature on the right changes the image on the left with smooth AnimatePresence transitions.
4. **AI-generated images** — 4 illustrations of children studying (flashcards, spaced repetition, progress tracking, badges) for the feature showcase.
5. **3 new FAQs** — streaks & badges, spaced repetition algorithm details, mobile support.
6. **Security audit** — confirmed `.env.example` has only placeholders, no real keys anywhere in repo.
7. **Schema verification** — all required features have proper DB support.
8. **This documentation** — process thinking artifact.

### Final architecture check
```
User → Onboarding (name, grade, child)
     → Upload PDF → Gemini generates cards → Prisma saves deck
     → Practice session (SR queue) → Review logged → Streak updated → Badge check
     → Profile (analytics, streak banner, badge wall)
```

Every box in the chain works end-to-end.

### What I'd improve with more time
1. **OTP verification** — currently accepts dummy phone numbers
2. **Sound effects** — "ding" on correct, "whoosh" on flip
3. **Dark mode** — neon-style animations for older kids
4. **Achievement system v2** — XP points, leaderboards, avatar customization
5. **Card editing** — let users edit AI-generated cards
6. **Multi-PDF decks** — merge multiple PDFs into one deck
7. **Export** — export decks as CSV or Anki format
8. **PWA** — install on phone home screen, offline card review
9. **Collaborative decks** — shared decks between classmates

---

## Tools used

| Tool | Purpose |
|---|---|
| Antigravity (AI assistant) | Architecture, code generation, component design |
| Next.js 15 | App framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Prisma + Neon | Database |
| Gemini API | Card generation |
| shadcn/ui | UI primitives |
| Recharts | Analytics charts |

> Note: Used Antigravity (similar to Claude Code) as the AI building partner as suggested in the How-To-AI guide. The `.brain` folder structure follows that guide's context-file approach.
