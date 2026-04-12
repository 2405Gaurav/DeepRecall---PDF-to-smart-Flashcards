# Cue Maths — flashcard lab (living context)

## What this product is
- Landing + onboarding that feels like Cuemath's calm lab vibe (teal / coral / mint grid), but the product name for recall is **DeepRecall** (not only math).
- **North star**: long-term retention over cramming — **active recall** + **spaced repetition** + **honest progress** + **deck management at scale** + a lot of **delight**.
- **Target audience**: Children & students — UI must be fun, animated, encouraging, and never overwhelming.

## Product principles (flashcard engine)
1. **Ingestion quality** — Gemini prompts aim for comprehensive, teacher-like cards (concepts, definitions, relationships, edge cases, examples); depth over shallow volume. Three preset levels: light (6-12), balanced (15-28), deep (30-50).
2. **Spaced repetition** — `lib/spaced-repetition.ts`: SM-2-inspired day intervals; review queue orders **due first** (most overdue first), then upcoming — no random shuffle that breaks scheduling.
3. **Progress / mastery** — NEW → LEARNING → FAMILIAR → MASTERED; deck + profile surfaces due counts and mastery without overwhelming.
4. **Deck management** — Search, sort (due first, then last practiced), many decks supported. Emoji indicators for mastery level.
5. **Delight** — Rich animations throughout: confetti bursts on mastery, streak counter with escalating messages, mascot emoji reactions, 3D card flip effects, floating particles, rainbow progress bars, bouncy micro-interactions on everything.

## Flows
- **Home**: Marketing page with floating emoji particles, bouncy feature cards, animated hero section with brain mascot.
- **Onboarding**: Multi-step modal with animated emojis per step, smooth transitions, playful grade selector.
- **Studio**: PDF upload → choose card count preset → Gemini makes flashcards → Postgres. Must onboard first.
- **Deck view**: Animated progress ring with gradient & emoji, mastery bucket stats, paginated card list, start practice with pulse-glow effect.
- **Practice**: The crown jewel — 3D card flip, streak counter (🔥 escalating messages), mascot reactions (😄🤔🥳), confetti on mastery, rainbow progress bar, session completion celebration with stats summary.
- **Profile**: Analytics with bar charts, top cards, recent activity.

## Stack worth remembering
- Next.js 15 App Router, Tailwind, shadcn/ui, Framer Motion, Recharts, Prisma + PostgreSQL (Neon), Gemini for generation.
- Session cookie for user; deck ownership checks on APIs.
- Custom UI components: `Confetti.tsx`, `FloatingParticles.tsx`, `StreakCounter.tsx` (+ `Mascot`), `SlideCtaButton.tsx`.

## Decisions already made
- Enum literals in `lib/db-enums.ts` so APIs don't break if Prisma client is stale on Windows.
- `/deck/[id]` redirects to `/studio/deck/[id]`.
- Navbar must not pass server lambdas into client components (`onGetStarted` optional).
- `.env.example` uses **placeholder values only** (no real keys!) — security requirement.
- `.env` is in `.gitignore` — never committed.

## Animation system
- `globals.css` has custom keyframes: wiggle, bounce-in, pulse-glow, rainbow-shimmer, float-gentle, sparkle, slide-up-bounce, card-flip, gradient-flow, celebration-burst.
- Utility classes: `.animate-wiggle`, `.animate-bounce-in`, `.animate-pulse-glow`, `.animate-rainbow-shimmer`, `.animate-float`, `.animate-celebration`, `.animate-gradient-flow`.
- 3D CSS helpers: `.perspective-600`, `.preserve-3d`, `.backface-hidden`, `.rotate-y-180`.

## What I care about in UI
- Child-friendly, not cramped; studio was scaled up ~"125% feel" at 100% zoom.
- Lab teal / sky accents; marketing pages stay lab-themed.
- Emojis used as visual indicators (🏆🌟💪📈🌱🔥) throughout for mastery levels.
- Micro-animations on every interactive element — nothing should feel static.
- Confetti and celebrations make kids feel rewarded for learning.

_Update this file when scope shifts so the assistant doesn't argue with old assumptions._
