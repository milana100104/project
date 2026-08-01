import type { Exam } from '../types'

export const ielts: Exam = {
  id: 'ielts',
  name: 'IELTS',
  fullName: 'International English Language Testing System',
  blurb:
    'English proficiency for study, work and migration. Scored on a 9-band scale across four skills.',
  color: '#dc2626',
  tests: [
    {
      id: 'ielts-reading-1',
      exam: 'ielts',
      title: 'Reading — True / False / Not Given',
      description: 'Classic IELTS statement-matching against a passage.',
      durationMin: 15,
      questions: [
        {
          id: 'ielts-r1-q1',
          section: 'reading',
          passage:
            'Bamboo is one of the fastest-growing plants on Earth. Certain species can grow nearly one metre in a single day under ideal conditions. Although it looks like a tree, bamboo is actually a type of grass. It is widely used in construction across Asia because its strength-to-weight ratio rivals that of steel.',
          prompt:
            'Statement: "Bamboo is classified as a tree." Choose the correct answer based on the passage.',
          options: ['True', 'False', 'Not Given'],
          answer: 1,
          explanation:
            'The passage says bamboo "is actually a type of grass", which makes the statement False.',
        },
        {
          id: 'ielts-r1-q2',
          section: 'reading',
          passage:
            'Bamboo is one of the fastest-growing plants on Earth. Certain species can grow nearly one metre in a single day under ideal conditions. Although it looks like a tree, bamboo is actually a type of grass. It is widely used in construction across Asia because its strength-to-weight ratio rivals that of steel.',
          prompt:
            'Statement: "Bamboo is more expensive than steel." Choose the correct answer based on the passage.',
          options: ['True', 'False', 'Not Given'],
          answer: 2,
          explanation:
            'The passage compares strength-to-weight ratio but says nothing about price, so this is Not Given.',
        },
        {
          id: 'ielts-r1-q3',
          section: 'reading',
          passage:
            'Bamboo is one of the fastest-growing plants on Earth. Certain species can grow nearly one metre in a single day under ideal conditions. Although it looks like a tree, bamboo is actually a type of grass. It is widely used in construction across Asia because its strength-to-weight ratio rivals that of steel.',
          prompt:
            'Statement: "Some bamboo can grow almost a metre per day." Choose the correct answer based on the passage.',
          options: ['True', 'False', 'Not Given'],
          answer: 0,
          explanation:
            'The passage states certain species "can grow nearly one metre in a single day", so this is True.',
        },
      ],
    },
    {
      id: 'ielts-vocab-1',
      exam: 'ielts',
      title: 'Vocabulary — Band-boosting Words',
      description: 'Synonyms and collocations to raise your writing band.',
      durationMin: 8,
      questions: [
        {
          id: 'ielts-v1-q1',
          section: 'grammar',
          prompt:
            'Choose the most academic synonym for "big" in the phrase "a big increase in prices".',
          options: ['huge', 'substantial', 'giant', 'fat'],
          answer: 1,
          explanation:
            '"Substantial" is the most formal, academic collocation with "increase".',
        },
        {
          id: 'ielts-v1-q2',
          section: 'grammar',
          prompt: 'Which word best completes: "The government should ___ measures to reduce pollution."',
          options: ['do', 'make', 'implement', 'give'],
          answer: 2,
          explanation:
            '"Implement measures" is the correct academic collocation.',
        },
      ],
    },
  ],
}
