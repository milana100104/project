export type ExamId = 'toefl' | 'sat' | 'ielts'

export type SectionId =
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'math'
  | 'grammar'

/** A single multiple-choice question. */
export interface Question {
  id: string
  section: SectionId
  /** Optional passage / prompt shown above the question. */
  passage?: string
  prompt: string
  options: string[]
  /** Index into `options` of the correct answer. */
  answer: number
  /** Short explanation shown after the test is graded. */
  explanation?: string
}

export interface Test {
  id: string
  exam: ExamId
  title: string
  description: string
  /** Time limit in minutes. */
  durationMin: number
  questions: Question[]
}

export interface Exam {
  id: ExamId
  name: string
  fullName: string
  blurb: string
  /** Accent color used across the UI. */
  color: string
  tests: Test[]
}

/** Result of a completed test attempt, persisted to localStorage. */
export interface Attempt {
  testId: string
  exam: ExamId
  testTitle: string
  /** ISO timestamp. */
  date: string
  correct: number
  total: number
  /** Seconds spent. */
  elapsedSec: number
  /** Map of questionId -> chosen option index. */
  answers: Record<string, number>
}
