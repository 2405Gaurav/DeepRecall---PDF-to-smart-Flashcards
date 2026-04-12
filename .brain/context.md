# Cue Maths — flashcard lab (living context)

## What this product is
- Landing + onboarding that feels like Cuemath’s calm lab vibe (teal / coral / mint grid), but the product name for recall is **DeepRecall** (not only math).
- **North star**: long-term retention over cramming — **active recall** + **spaced repetition** + **honest progress** + **deck management at scale** + a bit of **delight**.

## Product principles (flashcard engine)
1. **Ingestion quality** — Gemini prompts aim for comprehensive, teacher-like cards (concepts, definitions, relationships, edge cases, examples); depth over shallow volume.
2. **Spaced repetition** — `lib/spaced-repetition.ts`: SM-2-inspired day intervals; review queue orders **due first** (most overdue first), then upcoming — no random shuffle that breaks scheduling.
3. **Progress / mastery** — NEW → LEARNING → FAMILIAR → MASTERED; deck + profile surfaces due counts and mastery without overwhelming.
4. **Deck management** — Search, sort (due first, then last practiced), many decks supported.
5. **Delight** — Motion and lab palette; keep UI friendly for children.

## Flows
- **Studio**: PDF upload → Gemini makes flashcards → Postgres. User must onboard first.
- **Deck view**: mastery buckets, paginated list, start practice.
- **Practice**: ordered queue, flip card, rate how well they knew it — saves to DB (`ReviewLog`, `masteryLevel`, `nextReview`, counts).
- **Profile**: analytics punchline + charts.

## Stack worth remembering
- Next.js 15 App Router, Tailwind, shadcn/ui, Framer Motion, Recharts, Prisma + PostgreSQL, Gemini for generation.
- Session cookie for user; deck ownership checks on APIs.

## Decisions already made
- Enum literals in `lib/db-enums.ts` so APIs don’t break if Prisma client is stale on Windows.
- `/deck/[id]` redirects to `/studio/deck/[id]`.
- Navbar must not pass server lambdas into client components (`onGetStarted` optional).

## What I care about in UI
- Child-friendly, not cramped; studio was scaled up ~“125% feel” at 100% zoom.
- Lab teal / sky accents; marketing pages stay lab-themed.

_Update this file when scope shifts so the assistant doesn’t argue with old assumptions._
