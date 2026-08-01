import { Link } from 'react-router-dom'
import type { Attempt, Test } from '../types'

interface Props {
  test: Test
  result: Attempt
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function Results({ test, result }: Props) {
  const pct = Math.round((result.correct / result.total) * 100)
  const passed = pct >= 70

  return (
    <div className="results">
      <div className={`score-badge ${passed ? 'pass' : 'fail'}`}>
        <span className="score-pct">{pct}%</span>
        <span className="score-frac">
          {result.correct} / {result.total} correct
        </span>
      </div>

      <p className="results-summary">
        {passed
          ? 'Great work! Review the explanations below to lock it in.'
          : 'Keep practicing — the explanations below show what to focus on.'}{' '}
        Time: {formatElapsed(result.elapsedSec)}.
      </p>

      <div className="review">
        {test.questions.map((q, i) => {
          const chosen = result.answers[q.id]
          const correct = chosen === q.answer
          const unanswered = chosen === undefined
          return (
            <div
              key={q.id}
              className={`review-item ${correct ? 'correct' : 'incorrect'}`}
            >
              <div className="review-head">
                <span className="review-num">Q{i + 1}</span>
                <span className="review-mark">
                  {correct ? '✓ Correct' : unanswered ? '— Skipped' : '✗ Incorrect'}
                </span>
              </div>
              <p className="review-prompt">{q.prompt}</p>
              <ul className="review-options">
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answer
                  const isChosen = oi === chosen
                  return (
                    <li
                      key={oi}
                      className={[
                        'review-option',
                        isAnswer ? 'is-answer' : '',
                        isChosen && !isAnswer ? 'is-wrong-choice' : '',
                      ].join(' ')}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                      {isAnswer && <span className="tag">correct</span>}
                      {isChosen && !isAnswer && (
                        <span className="tag tag-wrong">your answer</span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {q.explanation && (
                <p className="review-explanation">{q.explanation}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="results-actions">
        <Link to={`/test/${test.id}`} className="btn btn-primary">
          Retry test
        </Link>
        <Link to={`/exam/${test.exam}`} className="btn">
          Back to {test.exam.toUpperCase()}
        </Link>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  )
}
