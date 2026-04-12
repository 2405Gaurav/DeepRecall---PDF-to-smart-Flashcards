# Cue Maths — PDF flashcards

A Next.js app that extracts text from PDFs with `pdf-parse`, generates 15–25 revision flashcards with the Gemini API, stores them in **PostgreSQL (Neon)** via **Prisma**, and runs a simple spaced-repetition review (due cards, interval doubling on Easy, reset on Hard).

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database
- A [Gemini API key](https://aistudio.google.com/apikey)

## Setup

1. **Clone and install**

   ```bash
   cd project
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — Neon **pooled** connection string (for the app).
   - `DIRECT_URL` — Neon **direct** connection string (for `prisma migrate`; can match `DATABASE_URL` for local dev if you use a single URL).
   - `GEMINI_API_KEY` — your Google Generative AI key.
   - Optional: `GEMINI_MODEL` — defaults to `gemini-2.5-flash` if unset.

3. **Database (Neon)**

   Ensure the project is awake in the Neon dashboard, then generate the client and apply migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   The first time (or in CI/production), apply existing migrations without prompts:

   ```bash
   npm run db:deploy
   ```

   Scripts: `db:generate` (Prisma Client), `db:migrate` (`migrate dev`), `db:deploy` (`migrate deploy`), `db:push` (schema push without migrations), `db:studio`.

   If you previously used the old Supabase SQL on the same database, drop conflicting tables or use a fresh Neon database before migrating.

   Quick prototype without migration history:

   ```bash
   npm run db:push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), upload a PDF, then open a deck to review due cards.

## API overview

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/upload` | Multipart PDF → extract text → Gemini → deck + cards |
| `GET` | `/api/decks` | List decks with stats (due, mastered, in progress) |
| `GET` | `/api/decks/[id]` | Deck metadata + stats |
| `GET` | `/api/decks/[id]/review` | Shuffled due cards (`nextReview <= now`) |
| `PATCH` | `/api/flashcard/[id]` | Review outcome: `{ "outcome": "EASY" \| "HARD" }` |
| `PATCH` | `/api/decks/[id]` | Rename: `{ "title": "..." }` |
| `DELETE` | `/api/decks/[id]` | Delete deck |

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS  
- Prisma + PostgreSQL (Neon)  
- `@google/generative-ai`, `pdf-parse`

Keys stay on the server; the browser only calls your API routes.
