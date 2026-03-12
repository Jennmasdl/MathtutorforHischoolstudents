import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { useQuiz } from '../context/QuizContext'
import { gradeSubmission } from '../utils/claude'
import { calculateFinalScore } from '../utils/scoring'
import Timer from '../components/Timer'
import MathInput, { type MathInputHandle } from '../components/MathInput'
import MathPalette from '../components/MathPalette'
import HintModal from '../components/HintModal'
import ResubmitModal from '../components/ResubmitModal'
import FeedbackPanel from '../components/FeedbackPanel'

function hasLatex(text: string) {
  return text.includes('\\') || text.includes('$') || text.includes('^') || text.includes('_')
}

function RenderProblemText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\\[\(\[][^\\]*\\[\)\]])/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          try { return <InlineMath key={i} math={part.slice(1, -1)} /> }
          catch { return <span key={i}>{part}</span> }
        }
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          try { return <InlineMath key={i} math={part.slice(2, -2)} /> }
          catch { return <span key={i}>{part}</span> }
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

function SafeInlineMath({ math }: { math: string }) {
  try { return <InlineMath math={math} /> }
  catch { return <span className="text-rose-500 text-xs">[수식 오류]</span> }
}

type ModalType = 'hint' | 'resubmit' | 'finish-confirm' | null

export default function QuizPage() {
  const navigate = useNavigate()
  const { settings, questions, currentIndex, answers, totalScore, elapsedSeconds, isFinished, setCurrentIndex, updateStep, addStep, removeStep, useHint, submitQuestion, setGradeResult, resubmitQuestion, finishQuiz } = useQuiz()
  const [modal, setModal] = useState<ModalType>(null)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null)
  const mqRefs = useRef<Map<string, MathInputHandle>>(new Map())
  const questionStartRef = useRef<number>(0)

  useEffect(() => { questionStartRef.current = elapsedSeconds }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!settings) navigate('/') }, [settings, navigate])

  if (!settings || questions.length === 0) return null
  if (isFinished) return <ResultsScreen />

  const q = questions[currentIndex]
  const ans = answers[q.id] ?? { steps: [{ id: 'init', latex: '' }], hintsUsed: 0, submitted: false, grading: false, pointsEarned: 0, gradeResult: undefined }
  const submittedCount = questions.filter((question) => answers[question.id]?.submitted).length
  const allSubmitted = submittedCount === questions.length
  const nextHintLevel = ans.hintsUsed + 1
  const canShowHint = nextHintLevel <= 3 && nextHintLevel <= q.hints.length

  function handlePaletteInsert(action: { type: 'cmd' | 'write'; value: string }) {
    const targetId = focusedStepId ?? ans.steps[ans.steps.length - 1]?.id
    if (!targetId) return
    const handle = mqRefs.current.get(targetId)
    if (!handle) return
    if (action.type === 'cmd') handle.cmd(action.value)
    else handle.insertLatex(action.value)
  }

  function navigateTo(index: number) {
    if (index === currentIndex) return
    const targetQ = questions[index]
    if (answers[targetQ.id]?.submitted) { setPendingIndex(index); setModal('resubmit') }
    else { setCurrentIndex(index); setShowHints(false) }
  }

  function confirmHint() { useHint(q.id); setModal(null); setShowHints(true) }

  function confirmResubmit() {
    if (pendingIndex !== null) { resubmitQuestion(questions[pendingIndex].id); setCurrentIndex(pendingIndex); setPendingIndex(null) }
    setModal(null); setShowHints(false)
  }

  function cancelResubmit() {
    if (pendingIndex !== null) { setCurrentIndex(pendingIndex); setPendingIndex(null) }
    setModal(null); setShowHints(false)
  }

  async function handleSubmit() {
    submitQuestion(q.id)
    const studentLatex = ans.steps.map((s) => s.latex)
    const questionElapsed = elapsedSeconds - questionStartRef.current
    try {
      const result = await gradeSubmission(q, studentLatex)
      const finalScore = calculateFinalScore(result.totalScore, ans.hintsUsed, questionElapsed)
      setGradeResult(q.id, result, finalScore)
    } catch {
      const fallbackScore = calculateFinalScore(100, ans.hintsUsed, questionElapsed)
      setGradeResult(q.id, { stepResults: ans.steps.map((_, i) => ({ stepIndex: i, status: 'correct' as const, errorType: null, explanation: null })), totalScore: 100, overallFeedback: 'AI 채점 서버에 연결할 수 없습니다. 모범 답안을 참고해 주세요.' }, fallbackScore)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1">
            {questions.map((question, i) => {
              const a = answers[question.id]
              const isActive = i === currentIndex
              const done = a?.submitted
              return (
                <button key={question.id} type="button" onClick={() => navigateTo(i)} className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm font-bold transition-all border-2 ${isActive ? 'bg-primary text-white border-primary shadow-md scale-105' : done ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-100 hover:border-primary-300'}`}>
                  {done ? (a.grading ? '⏳' : '✓') : `Q${i + 1}`}
                </button>
              )
            })}
          </div>
          <Timer seconds={elapsedSeconds} />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 rounded-full text-sm font-bold text-primary shadow-sm whitespace-nowrap">
            {settings.nickname} · {Math.round(totalScore / questions.length)}점
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${q.category === 'algebra' ? 'bg-blue-500' : 'bg-purple-500'}`}>{q.category === 'algebra' ? '대수' : '미적분'}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${q.level === 1 ? 'bg-emerald-400' : q.level === 2 ? 'bg-amber-400' : 'bg-rose-400'}`}>Level {q.level}</span>
            <span className="ml-auto text-sm text-gray-400">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="text-gray-800 text-lg leading-relaxed"><RenderProblemText text={q.title} /></div>
        </div>

        {showHints && ans.hintsUsed > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-amber-700">힌트 공개됨</h3>
            {q.hints.slice(0, ans.hintsUsed).map((hint, i) => (
              <div key={i} className="flex gap-2 text-sm text-amber-800">
                <span className="font-bold text-amber-500">{i + 1}.</span>
                <RenderProblemText text={hint} />
              </div>
            ))}
          </div>
        )}

        {!ans.submitted && <MathPalette onInsert={handlePaletteInsert} />}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">풀이 단계</h2>
            {ans.submitted && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ans.grading ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                {ans.grading ? '채점 중...' : `채점 완료 (+${ans.pointsEarned}점)`}
              </span>
            )}
          </div>
          {ans.steps.map((step, i) => (
            <div key={step.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-xs text-gray-400 font-medium">단계 {i + 1}</span>
                {!ans.submitted && ans.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(q.id, step.id)} className="ml-auto text-gray-300 hover:text-rose-400 transition text-lg leading-none">&#x2715;</button>
                )}
              </div>
              {ans.submitted ? (
                <div className="min-h-[44px] px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  {step.latex ? hasLatex(step.latex) ? <SafeInlineMath math={step.latex} /> : <span className="text-gray-700">{step.latex}</span> : <span className="text-gray-300 text-sm">비어 있음</span>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">LaTeX 입력</p>
                    <MathInput ref={(el) => { if (el) mqRefs.current.set(step.id, el); else mqRefs.current.delete(step.id) }} latex={step.latex} onChange={(latex) => updateStep(q.id, step.id, latex)} onFocus={() => setFocusedStepId(step.id)} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">실시간 미리보기</p>
                    <div className="min-h-[44px] px-3 py-2 bg-primary-50 border border-primary-100 rounded-lg flex items-center">
                      {step.latex ? hasLatex(step.latex) ? <SafeInlineMath math={step.latex} /> : <span className="text-gray-700">{step.latex}</span> : <span className="text-gray-300 text-sm">수식을 입력하세요</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!ans.submitted && (
            <button type="button" onClick={() => addStep(q.id)} className="w-full py-2.5 border-2 border-dashed border-primary-200 text-primary-500 rounded-2xl text-sm font-medium hover:bg-primary-50 hover:border-primary transition">+ 단계 추가</button>
          )}
        </div>

        {ans.submitted && <FeedbackPanel question={q} steps={ans.steps} gradeResult={ans.gradeResult} isLoading={ans.grading} finalScore={ans.pointsEarned} />}

        {!ans.submitted && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">힌트</p>
              <p className="text-xs text-gray-400">사용됨: {ans.hintsUsed} / 3단계{ans.hintsUsed > 0 && <span className="text-amber-500 ml-2">(-{[0, 5, 15, 35][ans.hintsUsed]}점 차감됨)</span>}</p>
            </div>
            <div className="flex gap-2">
              {ans.hintsUsed > 0 && <button type="button" onClick={() => setShowHints((v) => !v)} className="px-3 py-2 rounded-xl border border-amber-200 text-amber-600 text-sm font-medium hover:bg-amber-50 transition">{showHints ? '힌트 접기' : '힌트 보기'}</button>}
              {canShowHint && <button type="button" onClick={() => setModal('hint')} className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition">힌트 {nextHintLevel}단계 보기 &#128269;</button>}
              {!canShowHint && ans.hintsUsed === 0 && <span className="text-xs text-gray-300">힌트 없음</span>}
            </div>
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-gray-100 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3">
          <button type="button" onClick={() => navigateTo(currentIndex - 1)} disabled={currentIndex === 0} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold disabled:opacity-30 hover:border-primary-300 hover:text-primary transition">&#8592; 이전 문제</button>
          {ans.submitted ? (
            currentIndex < questions.length - 1 ? (
              <button type="button" onClick={() => navigateTo(currentIndex + 1)} className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-700 text-white font-bold transition">다음 문제 &#8594;</button>
            ) : allSubmitted ? (
              <button type="button" onClick={() => setModal('finish-confirm')} className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition">퀴즈 완료 &#127881;</button>
            ) : (
              <button type="button" disabled className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed">미완성 문제 남음</button>
            )
          ) : (
            <button type="button" onClick={() => { void handleSubmit() }} disabled={ans.grading} className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-700 active:scale-[0.98] text-white font-bold transition-all disabled:opacity-60">제출 &#8594;</button>
          )}
        </div>
      </footer>

      {modal === 'hint' && <HintModal hintLevel={nextHintLevel as 1 | 2 | 3} onConfirm={confirmHint} onCancel={() => setModal(null)} />}
      {modal === 'resubmit' && <ResubmitModal onConfirm={confirmResubmit} onCancel={cancelResubmit} />}
      {modal === 'finish-confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up text-center">
            <p className="text-4xl mb-4">&#127881;</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">퀴즈를 완료할까요?</h2>
            <p className="text-gray-500 text-sm mb-6">현재 획득 점수: <span className="font-bold text-primary text-lg">{Math.round(totalScore / questions.length)}점</span></p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">계속 풀기</button>
              <button onClick={finishQuiz} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition">완료!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsScreen() {
  const navigate = useNavigate()
  const { settings, questions, answers, totalScore, elapsedSeconds } = useQuiz()
  if (!settings) return null
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')
  const ss = String(elapsedSeconds % 60).padStart(2, '0')
  const displayScore = Math.round(totalScore / questions.length)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-slide-up">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">&#127881;</p>
          <h1 className="text-3xl font-extrabold text-gray-800">퀴즈 완료!</h1>
          <p className="text-gray-500 mt-1">{settings.nickname}님, 수고하셨습니다!</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-5">
          <div className="flex items-center justify-around mb-6">
            <div className="text-center"><p className="text-xs text-gray-400 mb-1">총 점수</p><p className="text-4xl font-extrabold text-primary">{displayScore}점</p><p className="text-sm text-gray-400">/ 100점</p></div>
            <div className="w-px h-16 bg-gray-100" />
            <div className="text-center"><p className="text-xs text-gray-400 mb-1">정답률</p><p className="text-4xl font-extrabold text-emerald-500">{displayScore}%</p></div>
            <div className="w-px h-16 bg-gray-100" />
            <div className="text-center"><p className="text-xs text-gray-400 mb-1">소요 시간</p><p className="text-4xl font-extrabold text-gray-700 font-mono">{mm}:{ss}</p></div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2"><div className="bg-gradient-to-r from-primary to-emerald-400 h-3 rounded-full" style={{ width: `${displayScore}%` }} /></div>
          <p className="text-right text-xs text-gray-400">{displayScore}점 / 100점</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">문제별 결과</h2>
          {questions.map((question, i) => {
            const a = answers[question.id]
            return (
              <div key={question.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{question.title.replace(/\$[^$]+\$/g, '(수식)').replace(/\\[\(\[][^\\]*\\[\)\]]/g, '(수식)')}</p>
                  <p className="text-xs text-gray-400">{question.category === 'algebra' ? '대수' : '미적분'} · Level {question.level}{a?.gradeResult?.totalScore != null && ` · AI점수 ${a.gradeResult.totalScore}`}{a?.hintsUsed ? ` · 힌트 ${a.hintsUsed}단계` : ''}</p>
                </div>
                <span className={`text-sm font-bold ${a?.submitted ? 'text-emerald-500' : 'text-gray-300'}`}>{a?.submitted ? `+${a.pointsEarned}` : '-'}점</span>
              </div>
            )
          })}
        </div>
        <button type="button" onClick={() => navigate('/')} className="w-full py-4 bg-primary hover:bg-primary-700 text-white text-lg font-bold rounded-2xl shadow-md transition">다시 시작하기</button>
      </div>
    </div>
  )
}
