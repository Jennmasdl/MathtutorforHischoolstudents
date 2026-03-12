// 힌트 누적 차감표 (0단계~3단계)
const HINT_DEDUCTIONS = [0, 5, 15, 35] as const

/**
 * 최종 점수 계산
 * @param baseScore  Claude 채점 결과 totalScore (0~100)
 * @param hintsUsed  사용한 힌트 단계 수 (0~3)
 * @param questionElapsedSeconds  해당 문제에 소요된 시간(초)
 */
export function calculateFinalScore(
  baseScore: number,
  hintsUsed: number,
  questionElapsedSeconds: number,
): number {
  const hintDeduction = HINT_DEDUCTIONS[Math.min(hintsUsed, 3) as 0 | 1 | 2 | 3]

  const timeBonus =
    questionElapsedSeconds <= 180
      ? 20
      : questionElapsedSeconds <= 300
        ? 10
        : 0

  return Math.min(100, Math.max(0, baseScore - hintDeduction + timeBonus))
}
