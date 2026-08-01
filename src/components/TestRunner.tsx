import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTest } from '../data'
import { saveAttempt } from '../lib/storage'
import type { Attempt } from '../types'
import Results from './Results'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TestRunner() {
  const { testId } = useParams<{ testId: string }>()
  const test = getTest(testId ?? '')

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [remaining, setRemaining] = useState((test?.durationMin ?? 0) * 60)
  const startRef = useRef(Date.now())
  const savedRef = useRef(false)

  const total = test?.questions.length ?? 0
  const answeredCount = Object.keys(answers).length

  const result = useMemo<Attempt | null>(() => {
    if (!submitted || !test) return null
    let correct = 0
    for (const q of test.questions) {
      if (answers[q.id] === q.answer) correct++
    }
    return {
      testId: test.id,
      exam: test.exam,
      testTitle: test.title,
      date: new Date().toISOString(),
      correct,
      total,
      elapsedSec: Math.round((Date.now() - startRef.current) / 1000),
      answers,
    }
  }, [submitted, test, answers, total])

  // Countdown timer.
  useEffect(() => {
    if (submitted || !test) return
    if (remaining <= 0) {
      setSubmitted(true)
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, submitted, test])

  // Persist the attempt exactly once.
  useEffect(() => {
    if (result && !savedRef.current) {
      savedRef.current = true
      saveAttempt(result)
    }
  }, [result])

  if (!test) {
    return (
      <div className="notice">
        <p>Test not found.</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  if (submitted && result) {
    return <Results test={test} result={result} />
  }

  const q = test.questions[current]
  const isLast = current === total - 1
  const lowTime = remaining <= 30

  return (
    <div className="runner">
      <div className="runner-bar">
        <Link to={`/exam/${test.exam}`} className="runner-exit">
          ✕ Exit
        </Link>
        <span className="runner-title">{test.title}</span>
        <span className={`runner-timer ${lowTime ? 'low' : ''}`}>
          ⏱ {formatTime(remaining)}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      <div className="question-card">
        <div className="question-index">
          Question {current + 1} of {total}
        </div>

        {q.passage && <div className="passage">{q.passage}</div>}

        <h2 className="prompt">{q.prompt}</h2>

        <div className="options">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i
            return (
              <button
                key={i}
                className={`option ${selected ? 'selected' : ''}`}
                onClick={() =>
                  setAnswers((a) => ({ ...a, [q.id]: i }))
                }
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="runner-controls">
        <button
          className="btn"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          ← Previous
        </button>

        <span className="answered-count">
          {answeredCount}/{total} answered
        </span>

        {isLast ? (
          <button
            className="btn btn-primary"
            onClick={() => setSubmitted(true)}
          >
            Submit test
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
