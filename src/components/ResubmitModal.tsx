interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export default function ResubmitModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">&#128260;</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">이미 제출한 문제</h2>
            <p className="text-sm text-gray-500">이 문제는 이미 제출되었습니다.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 bg-blue-50 border border-blue-100 rounded-xl p-3">
          재제출하면 <span className="font-semibold text-blue-700">기존 획득 점수가 초기화</span>되고,
          다시 답안을 작성하여 제출해야 합니다.
          <br />
          <span className="text-xs text-gray-400 mt-1 block">힌트 차감은 유지됩니다.</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            그냥 보기
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-semibold transition"
          >
            재제출하기
          </button>
        </div>
      </div>
    </div>
  )
}
