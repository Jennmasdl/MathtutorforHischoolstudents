// 힌트 단계별 차감 점수
const DEDUCTIONS: Record<1 | 2 | 3, number> = { 1: 5, 2: 10, 3: 20 }
const CUMULATIVE: Record<1 | 2 | 3, number> = { 1: 5, 2: 15, 3: 35 }

interface Props {
  hintLevel: 1 | 2 | 3
  onConfirm: () => void
  onCancel: () => void
}

export default function HintModal({ hintLevel, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">&#128269;</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              힌트 {hintLevel}단계 보기
            </h2>
            <p className="text-sm text-gray-500">
              확인하면 힌트가 공개됩니다
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 space-y-1">
          <p className="text-sm text-amber-800 font-medium">
            &#9888;&#65039; 이 힌트를 보면{' '}
            <span className="font-bold text-amber-900">
              -{DEDUCTIONS[hintLevel]}점
            </span>{' '}
            이 차감됩니다.
          </p>
          <p className="text-xs text-amber-600">
            누적 차감 합계: -{CUMULATIVE[hintLevel]}점 (1단계 -5 / 2단계 -10 / 3단계 -20)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-semibold transition"
          >
            확인, 차감 동의
          </button>
        </div>
      </div>
    </div>
  )
}
