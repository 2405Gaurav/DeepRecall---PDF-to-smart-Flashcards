# /review-code — Pre-Commit Code Review Checklist

> Agent-style command file (Part 2 of How To AI guide).
> In Claude Code this would be `.claude/commands/review-code.md`.
> In Cursor + Claude Opus 4.6, I reference this before pushing code.

## What this agent does

Before I commit or push changes, this workflow runs a structured code review against our project standards.

## Instructions for the AI

When I say "review the code" or "pre-commit check":

1. **Check the recent changes** (look at modified files or the files I specify)

2. **Run through this checklist:**

   ### Next.js / React
   - [ ] Client components have `"use client"` directive
   - [ ] No functions passed from Server → Client components
   - [ ] Loading/error/empty states handled

   ### Styling
   - [ ] Uses existing Tailwind tokens (lab-teal, lab-coral, etc.)
   - [ ] Responsive on mobile, tablet, desktop
   - [ ] Animations don't cause layout shift

   ### Data / Prisma
   - [ ] Uses `lib/db-enums.ts` literals (not raw Prisma enums)
   - [ ] Error handling around DB calls
   - [ ] No N+1 queries

   ### Security
   - [ ] No secrets in code or committed files
   - [ ] API keys only used server-side
   - [ ] User input sanitized

   ### Delight (for kid-facing features)
   - [ ] Animations present and smooth
   - [ ] Empty states have encouraging messages
   - [ ] Loading states use CueMathLoader

3. **Report findings** as a concise list: ✅ passing, ⚠️ warnings, ❌ must-fix

## Why this exists

This is my version of Exercise 2.3 from the guide — *"Think of a workflow you do repeatedly."* Code review before commits is that workflow.
