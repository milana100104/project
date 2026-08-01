import type { Exam } from '../types'

export const sat: Exam = {
  id: 'sat',
  name: 'SAT',
  fullName: 'Scholastic Assessment Test',
  blurb:
    'US college admissions test covering Reading & Writing and Math. Digital, adaptive format.',
  color: '#059669',
  tests: [
    {
      id: 'sat-math-1',
      exam: 'sat',
      title: 'Math — No Calculator Basics',
      description: 'Algebra, linear equations and ratios.',
      durationMin: 15,
      questions: [
        {
          id: 'sat-m1-q1',
          section: 'math',
          prompt: 'If 3x + 5 = 20, what is the value of x?',
          options: ['3', '5', '15', '25'],
          answer: 1,
          explanation: '3x = 20 − 5 = 15, so x = 15 / 3 = 5.',
        },
        {
          id: 'sat-m1-q2',
          section: 'math',
          prompt:
            'A recipe uses 2 cups of flour for every 3 cups of sugar. How many cups of flour are needed for 12 cups of sugar?',
          options: ['6', '8', '9', '18'],
          answer: 1,
          explanation:
            'The ratio is 2:3. 12 cups sugar is 4× the 3, so flour = 4 × 2 = 8 cups.',
        },
        {
          id: 'sat-m1-q3',
          section: 'math',
          prompt: 'What is the slope of the line 2y = 6x + 4?',
          options: ['2', '3', '4', '6'],
          answer: 1,
          explanation:
            'Divide by 2: y = 3x + 2. In y = mx + b form the slope m = 3.',
        },
        {
          id: 'sat-m1-q4',
          section: 'math',
          prompt: 'If f(x) = x² − 4x + 3, what is f(3)?',
          options: ['0', '3', '6', '9'],
          answer: 0,
          explanation: 'f(3) = 9 − 12 + 3 = 0.',
        },
      ],
    },
    {
      id: 'sat-writing-1',
      exam: 'sat',
      title: 'Reading & Writing — Grammar',
      description: 'Standard English conventions: punctuation and agreement.',
      durationMin: 12,
      questions: [
        {
          id: 'sat-w1-q1',
          section: 'grammar',
          prompt:
            'Choose the option that correctly completes the sentence: "Each of the students ___ responsible for a project."',
          options: ['are', 'is', 'were', 'be'],
          answer: 1,
          explanation:
            '"Each" is singular, so it takes the singular verb "is".',
        },
        {
          id: 'sat-w1-q2',
          section: 'grammar',
          prompt:
            'Which sentence is punctuated correctly?',
          options: [
            'We visited three cities, Rome, Paris, and Berlin.',
            'We visited three cities: Rome, Paris, and Berlin.',
            'We visited three cities; Rome, Paris, and Berlin.',
            'We visited three cities Rome, Paris, and Berlin.',
          ],
          answer: 1,
          explanation:
            'A colon correctly introduces a list that follows an independent clause.',
        },
        {
          id: 'sat-w1-q3',
          section: 'grammar',
          prompt:
            'Select the best transition: "The results were inconclusive. ___, the team decided to repeat the experiment."',
          options: ['However', 'Therefore', 'For example', 'Nevertheless'],
          answer: 1,
          explanation:
            'The second sentence is a consequence of the first, so "Therefore" fits best.',
        },
      ],
    },
  ],
}
