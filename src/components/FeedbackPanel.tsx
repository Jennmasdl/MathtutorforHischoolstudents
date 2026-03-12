import { useEffect, useRef, useState } from 'react'
import { InlineMath } from 'react-katex'
import type { Question, StepEntry, GradeResult, ErrorType } from '../types'

function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return count
}

function SafeMath({ math }: { math: string }) {
  if (!math.trim()) return <span className="text-gray-300 text-sm italic">비어 있음</span>
  try { return <InlineMath math={math} /> }
  catch { return <code className="text-xs text-rose-500">{math}</code> }
}

const ERROR_BADGE: Record<string, string> = {
  '개념 오류': 'bg-red-100 text-red-700 border-red-200',
  '적용 오류': 'bg-orange-100 text-orange-700 border-orange-200',
  '계산 오류': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '구조 오류': 'bg-blue-100 text-blue-700 border-blue-200',
  '선행 지식 누락': 'bg-gray-100 text-gray-600 border-gray-200',
}

function ErrorBadge({ type }: { type: ErrorType }) {
  const cls = ERROR_BADGE[type] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{type}</span>
}

const STATUS_ICON: Record<string, string> = { correct: '✅', incorrect: '❌', partially_correct: '🟡' }
const STATUS_LABEL: Record<string, string> = { correct: '정답', incorrect: '오답', partially_correct: '부분 정답' }

function SkeletonRow() {
  return (
    <div className="animate-pulse flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

function StepGradingTab({ steps, gradeResult, isLoading, finalScore }: { steps: StepEntry[]; gradeResult: GradeResult | undefined; isLoading: boolean; finalScore: number }) {
  const displayScore = useCountUp(isLoading ? 0 : finalScore)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl px-5 py-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">AI 채점 점수</p>
          <p className="text-3xl font-extrabold text-primary leading-none mt-1">
            {isLoading ? <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse" /> : <>{displayScore}<span className="text-lg font-semibold text-gray-400 ml-0.5">점</span></>}
          </p>
        </div>
        {!isLoading && gradeResult && (
          <div className="text-right">
            <p className="text-xs text-gray-400">전체 총평</p>
            <p className="text-sm text-gray-700 max-w-[220px] leading-snug mt-1">{gradeResult.overallFeedback}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: steps.length || 2 }).map((_, i) => <SkeletonRow key={i} />)
          : steps.map((step, i) => {
              const result = gradeResult?.stepResults.find((r) => r.stepIndex === i)
              const status = result?.status ?? 'partially_correct'
              return (
                <div key={step.id} className={`rounded-xl border p-3 ${status === 'correct' ? 'border-emerald-100 bg-emerald-50/50' : status === 'incorrect' ? 'border-rose-100 bg-rose-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 leading-none mt-0.5">{STATUS_ICON[status]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-gray-500">단계 {i + 1}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${status === 'correct' ? 'text-emerald-600 bg-emerald-100' : status === 'incorrect' ? 'text-rose-600 bg-rose-100' : 'text-amber-600 bg-amber-100'}`}>{STATUS_LABEL[status]}</span>
                        {result?.errorType && <ErrorBadge type={result.errorType as ErrorType} />}
                      </div>
                      <div className="text-sm text-gray-800"><SafeMath math={step.latex} /></div>
                      {result?.explanation && <p className="mt-1.5 text-xs text-rose-600 leading-snug">{result.explanation}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

function SolutionTab({ question }: { question: Question }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-3">각 단계를 순서대로 따라가며 이해해보세요.</p>
      {question.solutionSteps.map((step, i) => (
        <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-xl p-3">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
          <div className="flex-1"><SafeMath math={step} /></div>
        </div>
      ))}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-1">최종 정답</p>
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3"><SafeMath math={question.answer} /></div>
      </div>
    </div>
  )
}

type FlowColor = 'indigo' | 'blue' | 'purple' | 'emerald'
const FLOW_COLOR_MAP: Record<FlowColor, { border: string; bg: string; label: string; dot: string }> = {
  indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', label: 'text-indigo-500', dot: 'bg-indigo-400' },
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', label: 'text-blue-500', dot: 'bg-blue-400' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', label: 'text-purple-500', dot: 'bg-purple-400' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', label: 'text-emerald-500', dot: 'bg-emerald-400' },
}

function FlowNode({ label, content, color }: { label: string; content: string; color: FlowColor }) {
  const c = FLOW_COLOR_MAP[color]
  return (
    <div className={`w-full rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${c.label} mb-1`}>{label}</p>
      <p className="text-sm text-gray-700 leading-snug">{content}</p>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-3 bg-gray-300" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-300" />
    </div>
  )
}

function StructureMapTab({ question }: { question: Question }) {
  const { structureMap } = question
  return (
    <div className="flex flex-col items-center gap-0">
      <FlowNode label="목표 (Goal)" content={structureMap.goal} color="indigo" />
      <FlowArrow />
      <FlowNode label="주어진 것 (Given)" content={structureMap.given} color="blue" />
      <FlowArrow />
      <div className="w-full space-y-1">
        {structureMap.strategy.map((s, i) => (
          <div key={i}>
            <FlowNode label={`전략 ${i + 1}`} content={s} color="purple" />
            {i < structureMap.strategy.length - 1 && <div className="flex justify-center"><div className="w-px h-2 bg-purple-200" /></div>}
          </div>
        ))}
      </div>
      <FlowArrow />
      <div className="w-full">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 mb-2">사용 도구 (Tools)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {structureMap.tools.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getGradeStyle(grade: string): string {
  if (grade.startsWith('초')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (grade.startsWith('중')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (grade === '고1') return 'bg-purple-50 text-purple-700 border-purple-200'
  if (grade === '고2') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  return 'bg-gray-50 text-gray-600 border-gray-200'
}

function CurriculumTab({ question }: { question: Question }) {
  if (question.priorKnowledge.length === 0) return <p className="text-sm text-gray-400 text-center py-6">연결 교과과정 정보 없음</p>
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-2">이 문제를 풀기 위해 필요한 선행 학습 내용입니다.</p>
      {question.priorKnowledge.map((pk, i) => (
        <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${getGradeStyle(pk.grade)}`}>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-white/60 whitespace-nowrap">{pk.grade}</span>
          <span className="text-sm font-medium">{pk.topic}</span>
        </div>
      ))}
    </div>
  )
}

type TabId = 'grading' | 'solution' | 'structure' | 'curriculum'
const TABS: { id: TabId; label: string }[] = [
  { id: 'grading', label: '단계별 채점' },
  { id: 'solution', label: '모범 답안' },
  { id: 'structure', label: '문제 구조 맵' },
  { id: 'curriculum', label: '연결 교과과정' },
]

interface FeedbackPanelProps {
  question: Question
  steps: StepEntry[]
  gradeResult: GradeResult | undefined
  isLoading: boolean
  finalScore: number
}

export default function FeedbackPanel({ question, steps, gradeResult, isLoading, finalScore }: FeedbackPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('grading')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div ref={panelRef} className="bg-white rounded-2xl border border-primary-100 shadow-md overflow-hidden animate-slide-up">
      <div className="bg-gradient-to-r from-primary to-indigo-600 px-5 py-3 flex items-center gap-2">
        <span className="text-white text-lg">🤖</span>
        <h2 className="text-white font-bold text-sm">
          AI 채점 피드백
          {isLoading && (
            <span className="ml-2 inline-flex gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="inline-block w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </span>
          )}
        </h2>
        {isLoading && <span className="ml-auto text-white/70 text-xs">채점 중...</span>}
      </div>
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-primary-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{tab.label}</button>
        ))}
      </div>
      <div className="p-5">
        {activeTab === 'grading' && <StepGradingTab steps={steps} gradeResult={gradeResult} isLoading={isLoading} finalScore={finalScore} />}
        {activeTab === 'solution' && <SolutionTab question={question} />}
        {activeTab === 'structure' && <StructureMapTab question={question} />}
        {activeTab === 'curriculum' && <CurriculumTab question={question} />}
      </div>
    </div>
  )
}
