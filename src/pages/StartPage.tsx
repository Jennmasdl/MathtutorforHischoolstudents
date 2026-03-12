import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { selectQuestions } from '../data/questions'
import type { Category, Level, QuestionCount, QuizSettings } from '../types'

const CATEGORIES: { id: Category; label: string; icon: string; desc: string }[] = [
  { id: 'algebra', label: '대수', icon: '∑', desc: '방정식 · 수열 · 함수' },
  { id: 'calculus', label: '미적분', icon: '∫', desc: '극한 · 미분 · 적분' },
  { id: 'mixed', label: '혼합', icon: '⚡', desc: '대수 + 미적분' },
]

const LEVELS: { id: Level; label: string; desc: string; color: string }[] = [
  { id: 1, label: 'Level 1', desc: '기본', color: 'bg-emerald-400' },
  { id: 2, label: 'Level 2', desc: '표준', color: 'bg-amber-400' },
  { id: 3, label: 'Level 3', desc: '심화', color: 'bg-rose-400' },
]

const COUNTS: QuestionCount[] = [3, 5, 10]

export default function StartPage() {
  const navigate = useNavigate()
  const { startQuiz } = useQuiz()
  const [category, setCategory] = useState<Category>('algebra')
  const [level, setLevel] = useState<Level>(1)
  const [count, setCount] = useState<QuestionCount>(5)
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  function handleStart() {
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setError('')
    const settings: QuizSettings = { category, level, count, nickname: nickname.trim() }
    const questions = selectQuestions(category, level, count)
    if (questions.length === 0) { setError('선택한 조건에 맞는 문제가 없습니다.'); return }
    startQuiz(settings, questions)
    navigate('/quiz')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl shadow-lg mb-4 text-white text-4xl font-bold rotate-3">M</div>
        <h1 className="text-5xl font-extrabold text-primary tracking-tight">MathQuest</h1>
        <p className="text-gray-500 mt-2 text-lg">고2 수학 · 단계별 풀이 퀴즈</p>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 space-y-8 animate-slide-up">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">단원 선택</h2>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`category-card ${category === c.id ? 'selected' : ''}`}>
                <span className="text-3xl">{c.icon}</span>
                <span className="text-base font-bold">{c.label}</span>
                <span className="text-xs text-gray-400">{c.desc}</span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">난이도</h2>
          <div className="flex gap-3">
            {LEVELS.map((lv) => (
              <button key={lv.id} type="button" onClick={() => setLevel(lv.id)} className={`level-chip flex-1 flex flex-col items-center gap-0.5 py-3 ${level === lv.id ? 'selected' : ''}`}>
                <span className="font-bold text-sm">{lv.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${lv.color} ${level === lv.id ? 'opacity-100' : 'opacity-60'}`}>{lv.desc}</span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">문제 수</h2>
          <div className="flex gap-3">
            {COUNTS.map((n) => (
              <button key={n} type="button" onClick={() => setCount(n)} className={`level-chip flex-1 py-3 text-base ${count === n ? 'selected' : ''}`}>{n}문제</button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">닉네임</h2>
          <input type="text" value={nickname} onChange={(e) => { setNickname(e.target.value); if (error) setError('') }} onKeyDown={(e) => e.key === 'Enter' && handleStart()} placeholder="이름을 입력하세요" maxLength={12} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-base outline-none focus:border-primary transition placeholder-gray-300" />
          {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
        </section>
        <button type="button" onClick={handleStart} className="w-full py-4 bg-primary hover:bg-primary-700 active:bg-primary-800 text-white text-lg font-bold rounded-2xl shadow-md transition-all duration-150 active:scale-[0.98]">시작하기 →</button>
      </div>
      <p className="text-gray-400 text-xs mt-6">2026 · MathQuest · 고2 수학 퀴즈</p>
    </div>
  )
}
