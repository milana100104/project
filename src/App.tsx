import { Link, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import ExamPage from './components/ExamPage'
import TestRunner from './components/TestRunner'

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">EP</span>
          <span>Exam&nbsp;Prep</span>
        </Link>
        <nav className="site-nav">
          <Link to="/exam/toefl">TOEFL</Link>
          <Link to="/exam/sat">SAT</Link>
          <Link to="/exam/ielts">IELTS</Link>
        </nav>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/test/:testId" element={<TestRunner />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="site-footer">
        Practice for TOEFL · SAT · IELTS. Progress is saved locally in your browser.
      </footer>
    </div>
  )
}
