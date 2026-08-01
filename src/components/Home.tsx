import { Link } from 'react-router-dom'
import { exams } from '../data'
import { loadAttempts } from '../lib/storage'

export default function Home() {
  const attempts = loadAttempts()
  const totalTests = exams.reduce((n, e) => n + e.tests.length, 0)

  return (
    <div className="home">
      <section className="hero">
        <h1>Prepare for TOEFL, SAT &amp; IELTS</h1>
        <p>
          Timed practice tests with instant scoring and answer explanations.
          Track your progress across {totalTests} practice sets — no account needed.
        </p>
      </section>

      <section className="exam-grid">
        {exams.map((exam) => (
          <Link
            key={exam.id}
            to={`/exam/${exam.id}`}
            className="exam-card"
            style={{ ['--accent' as string]: exam.color }}
          >
            <div className="exam-card-top">
              <span className="exam-name">{exam.name}</span>
              <span className="exam-count">{exam.tests.length} tests</span>
            </div>
            <p className="exam-full">{exam.fullName}</p>
            <p className="exam-blurb">{exam.blurb}</p>
          </Link>
        ))}
      </section>

      {attempts.length > 0 && (
        <section className="recent">
          <h2>Recent attempts</h2>
          <ul className="recent-list">
            {attempts.slice(0, 5).map((a, i) => {
              const pct = Math.round((a.correct / a.total) * 100)
              return (
                <li key={i} className="recent-item">
                  <span className="recent-title">{a.testTitle}</span>
                  <span className="recent-score">
                    {a.correct}/{a.total} ({pct}%)
                  </span>
                  <span className="recent-date">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
