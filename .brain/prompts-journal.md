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
| Cursor IDE + Claude Opus 4.6 | AI pair programmer — architecture, code generation, debugging, component design |
| Next.js 15 | App framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Prisma + Neon | Database |
| Gemini API | Card generation |
| shadcn/ui | UI primitives |
| Recharts | Analytics charts |

> Note: I don't have access to Claude Code CLI. Instead I used **Cursor IDE + Claude Opus 4.6** as the AI building partner, following the same WHAT/HOW philosophy from the How-To-AI guide. The `.brain` folder structure mirrors the guide's Brain folder concept with context files (Part 1), agent command files (Part 2), and the app itself as the tool (Part 3).

---

## Session 6 — Brain Folder Overhaul & How To AI Alignment (Day 7-8)

### What was built
1. **Restructured `.brain/` to fully map to the How To AI PDF guide** — every section of the guide now has a corresponding file or folder.
2. **New context files (Part 1):**
   - `about-me.md` — who I am, skills, how I work with AI (mirrors guide's Exercise 1.2)
   - `my-goals.md` — project goals + 6-month goals (mirrors guide's Exercise 1.3)
3. **New agents folder (Part 2):**
   - `agents/journal.md` — end-of-session reflection workflow (mirrors guide's Exercise 2.1)
   - `agents/research.md` — topic research brief generator (mirrors guide's Exercise 2.2)
   - `agents/review-code.md` — pre-commit code review checklist (mirrors guide's Exercise 2.3)
4. **Updated all existing files** — replaced "Antigravity" references with "Cursor + Claude Opus 4.6"
5. **Updated main README.md** — rewrote the "How I Used AI" section to explain Cursor + Claude Opus 4.6 setup and map to all 3 parts of the guide
6. **Updated `config.json`** to v3 with full guide mappings for Parts 0–3

### Why this matters
The How To AI guide describes three levels:
- **Level 1: Context** — markdown files the AI reads every session
- **Level 2: Agents** — saved instructions for repeatable workflows
- **Level 3: Tools** — visual interfaces built through AI conversation

The previous `.brain/` only covered Level 1. Now it covers all three, with explicit mappings in `config.json` and `README.md` showing evaluators exactly how each file maps to the guide.

### Adaptation: Cursor + Claude Opus 4.6 instead of Claude Code
I don't have Claude Code access. The guide's workflow is:
- `cd ~/Documents/Brain && claude` → terminal AI reads local files
- Obsidian open alongside → see files in real-time

My equivalent:
- Open project in Cursor → Claude Opus 4.6 reads `.brain/` files in the project
- Cursor's editor shows the same files the AI reads → same split-screen effect
- Agent files live in `.brain/agents/` instead of `.claude/commands/`

Same philosophy, different tools. The WHAT/HOW principle is tool-agnostic.

### Carry forward
- Could add more agent files as workflows emerge
- Could add a `research/` folder for storing research briefs
- The context files should be updated every major session
