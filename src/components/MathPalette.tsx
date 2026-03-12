interface PaletteItem {
  label: string
  title: string
  action: { type: 'cmd' | 'write'; value: string }
}

const ITEMS: PaletteItem[] = [
  { label: '∫dx', title: '적분', action: { type: 'cmd', value: '\\int' } },
  { label: 'lim', title: '극한', action: { type: 'write', value: '\\lim_{}' } },
  { label: 'Σ', title: '시그마(합)', action: { type: 'cmd', value: '\\sum' } },
  { label: '√', title: '제곱근', action: { type: 'cmd', value: '\\sqrt' } },
  { label: 'xⁿ', title: '거듭제곱', action: { type: 'cmd', value: '^' } },
  { label: 'a/b', title: '분수', action: { type: 'cmd', value: '\\frac' } },
  { label: "f′", title: '미분(프라임)', action: { type: 'write', value: "'" } },
  { label: '∞', title: '무한대', action: { type: 'write', value: '\\infty' } },
  { label: 'π', title: '파이', action: { type: 'write', value: '\\pi' } },
  { label: '≤', title: '작거나 같음', action: { type: 'write', value: '\\le' } },
  { label: '≥', title: '크거나 같음', action: { type: 'write', value: '\\ge' } },
  { label: '±', title: '플러스마이너스', action: { type: 'write', value: '\\pm' } },
]

interface Props {
  onInsert: (action: { type: 'cmd' | 'write'; value: string }) => void
}

export default function MathPalette({ onInsert }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="w-full text-xs text-gray-400 mb-1 font-medium">수식 팔레트</p>
      {ITEMS.map((item) => (
        <button
          key={item.label}
          type="button"
          title={item.title}
          className="palette-btn"
          onMouseDown={(e) => {
            e.preventDefault()
            onInsert(item.action)
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
