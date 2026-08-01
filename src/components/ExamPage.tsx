import { Link, useParams } from 'react-router-dom'
import { getExam } from '../data'
import { bestScore } from '../lib/storage'
import type { ExamId } from '../types'

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const exam = getExam(examId as ExamId)

  if (!exam) {
    return (
      <div className="notice">
        <p>Exam not found.</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  return (
    <div className="exam-page" style={{ ['--accent' as string]: exam.color }}>
      <div className="exam-header">
        <h1>{exam.name}</h1>
        <p className="exam-full">{exam.fullName}</p>
        <p className="exam-blurb">{exam.blurb}</p>
      </div>

      <div className="test-list">
        {exam.tests.map((test) => {
          const best = bestScore(test.id)
          return (
            <div key={test.id} className="test-row">
              <div className="test-info">
                <h3>{test.title}</h3>
                <p>{test.description}</p>
                <div className="test-meta">
                  <span>{test.questions.length} questions</span>
                  <span>·</span>
                  <span>{test.durationMin} min</span>
                  {best !== null && (
                    <>
                      <span>·</span>
                      <span className="test-best">
                        Best: {Math.round(best * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Link to={`/test/${test.id}`} className="btn btn-primary">
                Start
              </Link>
            </div>
          )
        })}
      </div>

      <Link to="/" className="back-link">
        ← All exams
      </Link>
    </div>
  )
}
