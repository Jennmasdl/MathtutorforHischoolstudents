import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type {
  QuizContextType,
  QuizSettings,
  Question,
  QuestionState,
  StepEntry,
  GradeResult,
} from '../types'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function defaultQuestionState(): QuestionState {
  return {
    steps: [{ id: makeId(), latex: '' }],
    hintsUsed: 0,
    submitted: false,
    grading: false,
    pointsEarned: 0,
    gradeResult: undefined,
  }
}

interface QuizState {
  settings: QuizSettings | null
  questions: Question[]
  currentIndex: number
  answers: Record<string, QuestionState>
  elapsedSeconds: number
  isFinished: boolean
}

type Action =
  | { type: 'START'; settings: QuizSettings; questions: Question[] }
  | { type: 'SET_INDEX'; index: number }
  | { type: 'ADD_STEP'; qId: string }
  | { type: 'UPDATE_STEP'; qId: string; stepId: string; latex: string }
  | { type: 'REMOVE_STEP'; qId: string; stepId: string }
  | { type: 'USE_HINT'; qId: string }
  | { type: 'SUBMIT'; qId: string }
  | { type: 'SET_GRADE_RESULT'; qId: string; result: GradeResult; finalScore: number }
  | { type: 'RESUBMIT'; qId: string }
  | { type: 'FINISH' }
  | { type: 'TICK' }

function patchAnswer(
  answers: Record<string, QuestionState>,
  qId: string,
  patch: Partial<QuestionState> | ((prev: QuestionState) => Partial<QuestionState>),
): Record<string, QuestionState> {
  const prev = answers[qId] ?? defaultQuestionState()
  const updates = typeof patch === 'function' ? patch(prev) : patch
  return { ...answers, [qId]: { ...prev, ...updates } }
}

function applyStep(fn: (steps: StepEntry[]) => StepEntry[]) {
  return (prev: QuestionState): Partial<QuestionState> => ({ steps: fn(prev.steps) })
}

const initialState: QuizState = {
  settings: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  elapsedSeconds: 0,
  isFinished: false,
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'START': {
      const answers: Record<string, QuestionState> = {}
      action.questions.forEach((q) => {
        answers[q.id] = defaultQuestionState()
      })
      return { ...initialState, settings: action.settings, questions: action.questions, answers }
    }
    case 'SET_INDEX':
      return { ...state, currentIndex: action.index }
    case 'ADD_STEP':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, applyStep((steps) => [
          ...steps,
          { id: makeId(), latex: '' },
        ])),
      }
    case 'UPDATE_STEP':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, applyStep((steps) =>
          steps.map((s) => (s.id === action.stepId ? { ...s, latex: action.latex } : s)),
        )),
      }
    case 'REMOVE_STEP':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, applyStep((steps) =>
          steps.length <= 1 ? steps : steps.filter((s) => s.id !== action.stepId),
        )),
      }
    case 'USE_HINT':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, (prev) => ({
          hintsUsed: Math.min(prev.hintsUsed + 1, 3),
        })),
      }
    case 'SUBMIT':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, () => ({
          submitted: true,
          grading: true,
          pointsEarned: 0,
          gradeResult: undefined,
        })),
      }
    case 'SET_GRADE_RESULT':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, () => ({
          grading: false,
          gradeResult: action.result,
          pointsEarned: action.finalScore,
        })),
      }
    case 'RESUBMIT':
      return {
        ...state,
        answers: patchAnswer(state.answers, action.qId, () => ({
          submitted: false,
          grading: false,
          pointsEarned: 0,
          gradeResult: undefined,
        })),
      }
    case 'FINISH':
      return { ...state, isFinished: true }
    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
    default:
      return state
  }
}

const QuizContext = createContext<QuizContextType | null>(null)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.settings && !state.isFinished) {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.settings, state.isFinished])

  const totalScore = Object.values(state.answers).reduce(
    (sum, a) => sum + a.pointsEarned,
    0,
  )

  const ctx: QuizContextType = {
    settings: state.settings,
    questions: state.questions,
    currentIndex: state.currentIndex,
    answers: state.answers,
    totalScore,
    elapsedSeconds: state.elapsedSeconds,
    isFinished: state.isFinished,
    startQuiz: (settings, questions) => dispatch({ type: 'START', settings, questions }),
    setCurrentIndex: (index) => dispatch({ type: 'SET_INDEX', index }),
    updateStep: (qId, stepId, latex) => dispatch({ type: 'UPDATE_STEP', qId, stepId, latex }),
    addStep: (qId) => dispatch({ type: 'ADD_STEP', qId }),
    removeStep: (qId, stepId) => dispatch({ type: 'REMOVE_STEP', qId, stepId }),
    useHint: (qId) => dispatch({ type: 'USE_HINT', qId }),
    submitQuestion: (qId) => dispatch({ type: 'SUBMIT', qId }),
    setGradeResult: (qId, result, finalScore) =>
      dispatch({ type: 'SET_GRADE_RESULT', qId, result, finalScore }),
    resubmitQuestion: (qId) => dispatch({ type: 'RESUBMIT', qId }),
    finishQuiz: () => dispatch({ type: 'FINISH' }),
    tickTimer: () => dispatch({ type: 'TICK' }),
  }

  return <QuizContext.Provider value={ctx}>{children}</QuizContext.Provider>
}

export function useQuiz(): QuizContextType {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider')
  return ctx
}
