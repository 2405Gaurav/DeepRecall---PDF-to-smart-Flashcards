# Cue Maths — flashcard lab (living context)

## What this product is
- Landing + onboarding that feels like Cuemath’s calm lab vibe (teal / coral / mint grid), but the product name for recall is **DeepRecall** (not only math).
- **Studio**: PDF upload → Gemini makes flashcards → Postgres. User must onboard first.
- **Deck view**: mastery buckets (new / learning / familiar / mastered), grid, start practice.
- **Practice**: full deck, flip card, rate how well they knew it — saves to DB (`ReviewLog`, `masteryLevel`, counts).
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
- Purple accent in studio AI header; marketing pages stay lab-themed.

_Update this file when scope shifts so the assistant doesn’t argue with old assumptions._
