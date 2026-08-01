import type { Exam, ExamId, Test } from '../types'
import { toefl } from './toefl'
import { sat } from './sat'
import { ielts } from './ielts'

export const exams: Exam[] = [toefl, sat, ielts]

export function getExam(id: ExamId): Exam | undefined {
  return exams.find((e) => e.id === id)
}

export function getTest(testId: string): Test | undefined {
  for (const exam of exams) {
    const test = exam.tests.find((t) => t.id === testId)
    if (test) return test
  }
  return undefined
}
