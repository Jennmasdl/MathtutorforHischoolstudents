interface TimerProps {
  seconds: number
}

export default function Timer({ seconds }: TimerProps) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-gray-200 rounded-full text-sm font-mono font-medium text-gray-700 shadow-sm">
      <span className="text-primary text-base">&#128336;</span>
      {mm}:{ss}
    </div>
  )
}
