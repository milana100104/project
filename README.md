# Exam Prep — TOEFL · SAT · IELTS

A lightweight web app for practicing standardized English and college-admission
exams. Take timed multiple-choice practice tests, get instant scoring, and
review every answer with explanations. Progress is saved locally in the browser
— no account or backend required.

## Features

- **Three exams** — TOEFL, SAT and IELTS, each with its own practice sets.
- **Timed tests** — a countdown timer per test; the test auto-submits at 0:00.
- **Instant grading** — score, pass/fail badge and time taken.
- **Answer review** — see the correct option, your choice, and an explanation
  for every question.
- **Progress tracking** — recent attempts and best score per test, stored in
  `localStorage`.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for dev server and build
- [React Router](https://reactrouter.com/) for navigation
- No backend — all content ships in the bundle, progress lives in the browser.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## Project structure

```
src/
  data/            Exam content (one file per exam) + lookup helpers
    toefl.ts
    sat.ts
    ielts.ts
    index.ts
  components/
    Home.tsx       Landing page with exam cards and recent attempts
    ExamPage.tsx   Test list for a single exam
    TestRunner.tsx Timed test-taking flow
    Results.tsx    Score + per-question review
  lib/
    storage.ts     localStorage helpers for attempts
  types.ts         Shared types (Exam, Test, Question, Attempt)
```

## Adding content

Each exam is a plain data object. To add a test, append a `Test` to the
relevant exam's `tests` array in `src/data/<exam>.ts`:

```ts
{
  id: 'toefl-reading-2',
  exam: 'toefl',
  title: 'Reading — Practice Set 2',
  description: '...',
  durationMin: 18,
  questions: [
    {
      id: 'toefl-r2-q1',
      section: 'reading',
      passage: 'Optional passage text...',
      prompt: 'The question...',
      options: ['A', 'B', 'C', 'D'],
      answer: 2,          // index of the correct option
      explanation: 'Why C is correct.',
    },
  ],
}
```

Question IDs must be unique across the app so attempt data stays consistent.

## Roadmap ideas

- Writing / Speaking sections with free-text and rubric-based self-scoring
- Vocabulary flashcards with spaced repetition
- Full-length exam simulations with section timing
- User accounts and cross-device sync (would add a backend)
