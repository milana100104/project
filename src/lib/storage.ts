import type { Attempt } from '../types'

const KEY = 'exam-prep:attempts'

export function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Attempt[]) : []
  } catch {
    return []
  }
}

export function saveAttempt(attempt: Attempt): void {
  const all = loadAttempts()
  all.unshift(attempt)
  // Keep the history bounded.
  const trimmed = all.slice(0, 100)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
}

export function attemptsForTest(testId: string): Attempt[] {
  return loadAttempts().filter((a) => a.testId === testId)
}

export function bestScore(testId: string): number | null {
  const attempts = attemptsForTest(testId)
  if (attempts.length === 0) return null
  return Math.max(...attempts.map((a) => a.correct / a.total))
}
