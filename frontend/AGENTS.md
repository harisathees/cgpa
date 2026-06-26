# AGENTS.md

This file provides guidance to AI agents when working with code in this frontend repository.

## Project Overview

**Frontend** is the client application for the CGPA platform. It is a Next.js 16 App Router application (React 19, TypeScript) that communicates with the backend API. This repo (`frontend`) is the standalone frontend project — it has its own `package.json`.

## Commands

```bash
npm install                          # Install dependencies
npm run dev                          # Dev server (typically port 3000)
npm run build                        # Production build
npm run lint                         # ESLint
```

## Architecture

### Tech Stack

- **Next.js 16.2** (App Router), **React 19**, **TypeScript 5**
- **UI/Styling**: Tailwind CSS v4

### Page Pattern

Following the Next.js App Router conventions:
- `app/page.tsx` for route UI.
- `app/layout.tsx` for shared layouts.
- `app/loading.tsx` for Suspense boundaries.
- Component logic and hooks should be extracted to separate files to keep server and client components cleanly separated.

## Environment Variables

Ensure you have the required environment variables configured locally (e.g., in a `.env.local` file) to point to the backend API during development.

## Post-Change Verification Workflow

After every meaningful code change, follow this workflow before completing the task:

1. **Identify structural updates** — Ensure client and server components are correctly designated with `"use client"` where necessary.
2. **Run lint** — `npm run lint` to verify no linting errors or warnings. Fix all issues before proceeding.
3. **Run build** — `npm run build` to verify there are no build-time errors, especially type checking and Next.js specific rules.
4. **Cross-verify documentation** — Check if the change affects core architectural decisions and update related documentation if needed.

## Gotchas

- **Tailwind v4** — Uses the `@tailwindcss/postcss` plugin.
- **React 19** — Concurrent features enabled. Be mindful of new hooks and server component constraints.
