import type { Exam } from '../types'

export const toefl: Exam = {
  id: 'toefl',
  name: 'TOEFL',
  fullName: 'Test of English as a Foreign Language',
  blurb:
    'Academic English for university admission. Measures reading, listening, speaking and writing.',
  color: '#2563eb',
  tests: [
    {
      id: 'toefl-reading-1',
      exam: 'toefl',
      title: 'Reading — Practice Set 1',
      description: 'Academic passage with inference and vocabulary questions.',
      durationMin: 18,
      questions: [
        {
          id: 'toefl-r1-q1',
          section: 'reading',
          passage:
            'The migration of the monarch butterfly is one of the most remarkable phenomena in the natural world. Each autumn, millions of these insects travel up to 4,800 kilometers from Canada and the northern United States to a handful of forests in central Mexico. Remarkably, no single butterfly completes the round trip; the journey spans several generations, yet each new generation unerringly finds the same overwintering sites its ancestors used.',
          prompt: 'The word "unerringly" in the passage is closest in meaning to:',
          options: ['occasionally', 'accurately', 'slowly', 'reluctantly'],
          answer: 1,
          explanation:
            '"Unerringly" means without making mistakes — i.e. accurately. The passage stresses that each generation finds the exact same sites.',
        },
        {
          id: 'toefl-r1-q2',
          section: 'reading',
          passage:
            'The migration of the monarch butterfly is one of the most remarkable phenomena in the natural world. Each autumn, millions of these insects travel up to 4,800 kilometers from Canada and the northern United States to a handful of forests in central Mexico. Remarkably, no single butterfly completes the round trip; the journey spans several generations, yet each new generation unerringly finds the same overwintering sites its ancestors used.',
          prompt: 'According to the passage, which statement is true about a single monarch butterfly?',
          options: [
            'It flies the full round trip between Canada and Mexico.',
            'It never migrates.',
            'It does not complete the entire round-trip journey.',
            'It always returns to Canada in autumn.',
          ],
          answer: 2,
          explanation:
            'The passage explicitly states "no single butterfly completes the round trip" — the journey spans several generations.',
        },
        {
          id: 'toefl-r1-q3',
          section: 'reading',
          prompt:
            'The author most likely describes the migration as "remarkable" in order to:',
          options: [
            'criticize scientists who study butterflies',
            'emphasize how extraordinary and puzzling the behavior is',
            'suggest the migration is a recent development',
            'argue that the migration is harmful to the butterflies',
          ],
          answer: 1,
          explanation:
            'The tone and details (multi-generational, precise navigation) are used to highlight how extraordinary the phenomenon is.',
        },
      ],
    },
    {
      id: 'toefl-listening-1',
      exam: 'toefl',
      title: 'Listening — Vocabulary in Context',
      description: 'Short campus-conversation style questions.',
      durationMin: 10,
      questions: [
        {
          id: 'toefl-l1-q1',
          section: 'listening',
          prompt:
            'A professor says: "I\'d like you to hand in a rough draft by Friday." What does the professor want?',
          options: [
            'A final, polished essay',
            'An early, unfinished version of the essay',
            'A verbal presentation',
            'A list of sources only',
          ],
          answer: 1,
          explanation:
            'A "rough draft" is an early, incomplete version of a piece of writing.',
        },
        {
          id: 'toefl-l1-q2',
          section: 'listening',
          prompt:
            'A student says the lecture "went over my head." This means the student:',
          options: [
            'understood the lecture very well',
            'did not understand the lecture',
            'fell asleep during the lecture',
            'thought the lecture was too easy',
          ],
          answer: 1,
          explanation:
            'The idiom "go over one\'s head" means something was too difficult to understand.',
        },
      ],
    },
  ],
}
