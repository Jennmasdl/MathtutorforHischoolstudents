export interface Question {
  id: string
  category: 'algebra' | 'calculus'
  level: 1 | 2 | 3
  title: string
  answer: string
  solutionSteps: string[]
  hints: string[]
  structureMap: {
    goal: string
    given: string
    strategy: string[]
    tools: string[]
  }
  priorKnowledge: {
    grade: string
    topic: string
  }[]
}

export type Category = 'algebra' | 'calculus' | 'mixed'
export type Level = 1 | 2 | 3
export type QuestionCount = 3 | 5 | 10

export interface QuizSettings {
  category: Category
  level: Level
  count: QuestionCount
  nickname: string
}

export interface StepEntry {
  id: string
  latex: string
}

// ── Claude 채점 결과 ──────────────────────────────────────────────────────
export type ErrorType =
  | '개념 오류'
  | '적용 오류'
  | '계산 오류'
  | '구조 오류'
  | '선행 지식 누락'

export interface StepResult {
  stepIndex: number
  status: 'correct' | 'incorrect' | 'partially_correct'
  errorType?: ErrorType | null
  explanation?: string | null
}

export interface GradeResult {
  stepResults: StepResult[]
  totalScore: number        // 0~100
  overallFeedback: string   // 한국어 총평 1-2문장
}

// ── 문제별 답안 상태 ──────────────────────────────────────────────────────
export interface QuestionState {
  steps: StepEntry[]
  hintsUsed: number
  submitted: boolean
  grading: boolean           // AI 채점 진행 중
  pointsEarned: number       // 최종 확정 점수 (grading 완료 후 확정)
  gradeResult?: GradeResult  // AI 채점 결과
}

// ── Context 타입 ──────────────────────────────────────────────────────────
export interface QuizContextType {
  settings: QuizSettings | null
  questions: Question[]
  currentIndex: number
  answers: Record<string, QuestionState>
  totalScore: number
  elapsedSeconds: number
  isFinished: boolean
  startQuiz: (settings: QuizSettings, questions: Question[]) => void
  setCurrentIndex: (index: number) => void
  updateStep: (questionId: string, stepId: string, latex: string) => void
  addStep: (questionId: string) => void
  removeStep: (questionId: string, stepId: string) => void
  useHint: (questionId: string) => void
  submitQuestion: (questionId: string) => void
  setGradeResult: (questionId: string, result: GradeResult, finalScore: number) => void
  resubmitQuestion: (questionId: string) => void
  finishQuiz: () => void
  tickTimer: () => void
}
