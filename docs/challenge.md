# Frontend Challenge — Concourse

**Stack:** Your choice — React + TypeScript required

---

## Overview

Build a **GitHub Profile Chat UI** — a web app that simulates a conversational interface where a user can ask questions about a GitHub profile and its contribution activity graph.

[contribution activity graph](/docs/github-stats.webp)

The data is **fully mocked**: you don't need to hit any real API. The goal is to demonstrate your UI skills, attention to detail, UI consistent among all pages and how you approach an open-ended problem

---

## What to build

### The interface has two main areas:

**1. Profile Panel**

Display a mocked GitHub user profile. Include at minimum:

- Avatar, name, username, bio
- Stats (repos, followers, following)
- A **contribution chart** (the green heatmap grid — the one GitHub shows on profile pages)

The contribution data should be mocked with realistic-looking data (varied activity across ~52 weeks).

**2. Chat Panel / Chat Page**

A chat interface where the user can type questions and receive responses.

**The responses are mocked** — you define them ( no need to intagrate any API).

They should feel contextual, as if an AI is answering questions about the profile and revealing its thought process and reasoning.

Some example interactions to support:

- _"How active has this user been in the last 3 months?"_
- _"What's their busiest day of the week?"_
- _"Do they contribute on weekends?"_
- _"What's their longest streak?"_

---

## What we're evaluating

This challenge is intentionally underspecified. We want to see how you navigate ambiguity.

**UI & Visual Design**

- Does it look polished and intentional?
- Typography, spacing, color — is there a clear visual hierarchy?
- Does it feel like something a real product would ship?

**Animations & Micro-interactions**

- Loading states, message transitions, typing indicators
- Hover states, focus states
- Contribution chart interactions (tooltip on hover, etc.)

**Attention to Detail**

- Edge cases handled gracefully (empty states, long messages, etc.)
- Consistent visual language throughout

**Code Quality**

- Folder structure and file organization
- Component design and reusability
- TypeScript usage (types, interfaces — avoid `any`)
- Scalability: could another engineer pick this up and extend it easily?

**Creativity**

- We're curious what you add that we didn't ask for
- Surprises are welcome

---

## Rules & guidelines

- React + TypeScript are required. Everything else is your call (Vite, Next.js, Zod, any component library or none at all)
- No real API calls needed — all data can be mocked locally
- **AI tools are allowed and encouraged.** How you use them is part of what we're evaluating
- Don't over-engineer the backend/logic side — the focus is on the frontend experience

---

## Deliverable

A GitHub repo (public or shared with us) with:

- A working app we can run locally with `npm, yarn, pnpm` (or equivalent)
- A `README.md` with:
  - How to run it
  - Any decisions or tradeoffs you made
  - What you would improve with more time

## Evaluation criteria (in order of priority)

1. Visual quality & attention to detail & Creativity
2. TypeScript and React best practices
3. Code structure and scalability
4. Animations and interactivity

---

Good luck — we're looking forward to seeing what you build.
