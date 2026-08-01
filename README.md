# Beacon

A study workspace for the **TOEFL (2026 format)**, **IELTS** and **SAT** — real
questions, marked the moment you answer. Reading and Listening are free with
instant checks; Writing and Speaking are marked *in development*.

Built as a simple static site (plain HTML / CSS / JS, no build step). Dark navy +
gold theme, designed to read as hand-made rather than machine-generated: a serif
with character for display (Fraunces), a clean grotesk for body (Hanken Grotesk),
a mono for the "instrument" numbers (IBM Plex Mono) and a quick hand for accents
(Caveat) — plus a hand-drawn lighthouse chart, wavy underlines and a nautical
"route" motif that recurs across pages.

## Running it

No build. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

## Pages

| File | What it is |
|------|------------|
| `index.html` | Marketing landing (hero, three exams, honest logbook, webinars preview) |
| `toefl.html` | TOEFL **working** page — skills → question types (workspace, no marketing) |
| `sat.html` | SAT **working** page — Math & Reading/Writing by domain + random mix |
| `ielts.html` | IELTS skills page — Reading & Listening practice, Writing/Speaking in dev |
| `practice.html` | The one-question-at-a-time runner (`?exam=&skill=&type=` or `?fav=1`) |
| `webinars.html` | Webinar listings (rendered from the store) |
| `auth.html` | Login / register / verify-email / forgot-password (`?view=`) |
| `account.html` | Profile · Favorites · Progress (`?tab=`) |
| `admin.html` | Admin-only: add questions, manage webinars |

## Assets

| File | Role |
|------|------|
| `assets/app.css` | Marketing + shared theme (landing, IELTS, auth, account, admin) |
| `assets/workspace.css` | Working-interface theme (TOEFL/SAT workspace + practice) |
| `assets/app.js` | `BeaconStore` (question bank, favorites, progress), `renderWorkspace`, practice engine |
| `assets/auth.js` | Client-side auth + header state injection |
| `assets/beacon-logo-icon.jpg` | **Drop the provided logo here.** Until then a built-in SVG placeholder shows; the jpg layers on top automatically once added. |

## How the content model works

Questions live in `BeaconStore` (seeded with a starter bank in `app.js`, then
persisted to `localStorage`). Each question has an `exam`, `skill`, `type`,
`difficulty`, a `prompt`, and type-specific fields:

- **choice** — `choices[]` + `answer` index (multiple choice, best response, T/F/NG…)
- **complete-the-words** — `parts[]` of `{text}` or `{stem, blank}` (fill missing letters inline)
- **text** — `answer` + optional `accept[]`

Admins add more via `admin.html`. Solved questions stay out of the normal flow
until the pool is cleared; **Favorites** are a separate, repeatable pool.

## Status vs. the brief

**Working now:** landing + brand system, TOEFL/IELTS/SAT Reading & Listening
practice with instant checks and explanations, favorites + no-repeat logic,
progress tracking, client-side auth (with email-verification demo) and an admin
panel for questions & webinars.

**Deliberately in development (per brief):** all of TOEFL/IELTS Writing &
Speaking, and the full adaptive SAT test — shown with clear "in development"
states, no active practice button.

## Notes / not production-ready

- **Auth is a front-end demo.** "Passwords" are lightly obscured (not securely
  hashed) and the verification code is shown on screen instead of emailed. Wire a
  real backend before shipping. Admin login: `Admin` / `Adminspeaknest`.
- **Data is per-browser** (`localStorage`) — no server, no cross-device sync yet.
- **Logo** is a placeholder; drop in the two provided brand files.
- **Listening audio** uses a placeholder player; transcripts stand in until an
  admin uploads real audio.
