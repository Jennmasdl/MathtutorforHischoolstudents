/**
 * 채점 API 모듈 — Google Gemini 2.0 Flash 사용 (무료, 카드 불필요)
 * API 키 발급: https://aistudio.google.com/apikey
 * 무료 한도: 1,500 RPD / 15 RPM (gemini-2.0-flash 기준)
 */
import type { Question, GradeResult } from '../types'

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// ── API 키 없을 때 폴백 ────────────────────────────────────────────────────
function fallbackResult(studentSteps: string[]): GradeResult {
  return {
    stepResults: studentSteps.map((_, i) => ({
      stepIndex: i,
      status: 'partially_correct' as const,
      errorType: null,
      explanation: null,
    })),
    totalScore: 100,
    overallFeedback:
      'VITE_GEMINI_API_KEY가 설정되지 않아 자동 채점을 건너뜁니다. ' +
      '.env 파일에 키를 입력하면 AI 채점이 활성화됩니다.',
  }
}

// ── 프롬프트 생성 ──────────────────────────────────────────────────────────
function buildPrompt(question: Question, studentSteps: string[]): string {
  const cleanTitle = question.title
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\[\(\[]([\s\S]*?)\\[\)\]]/g, '$1')

  const stepsText =
    studentSteps.length > 0
      ? studentSteps.map((s, i) => `${i + 1}. ${s || '(비어 있음)'}`).join('\n')
      : '(풀이 없음)'

  return `당신은 한국 고등학교 2학년 수학 채점 전문가입니다.
학생 풀이를 모범 답안과 비교하여 각 단계를 채점하고, JSON만 반환하세요.

## 문제
${cleanTitle}

## 모범 답안 단계
${question.solutionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## 정답
${question.answer}

## 학생 풀이 단계 (채점 대상)
${stepsText}

## 출력 형식 (JSON만, 다른 텍스트 금지)
{
  "stepResults": [
    {
      "stepIndex": 0,
      "status": "correct",
      "errorType": null,
      "explanation": null
    }
  ],
  "totalScore": 85,
  "overallFeedback": "한국어 총평 1-2문장"
}

규칙:
- status: "correct" | "incorrect" | "partially_correct"
- errorType: "개념 오류" | "적용 오류" | "계산 오류" | "구조 오류" | "선행 지식 누락" | null
- explanation: 틀렸을 때만 한국어 설명, 맞으면 null
- totalScore: 0~100 정수
- stepResults 배열 길이는 학생 풀이 단계 수(${studentSteps.length})와 동일하게 생성`
}

// ── Gemini API 응답 타입 ───────────────────────────────────────────────────
interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
  }[]
  error?: { message: string }
}

// ── 메인 함수 ──────────────────────────────────────────────────────────────
export async function gradeSubmission(
  question: Question,
  studentSteps: string[],
): Promise<GradeResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return fallbackResult(studentSteps)

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildPrompt(question, studentSteps) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(`Gemini API ${response.status}: ${err.error?.message ?? response.statusText}`)
  }

  const data = (await response.json()) as GeminiResponse

  if (data.error) {
    throw new Error(`Gemini API 오류: ${data.error.message}`)
  }

  const rawText = data.candidates[0]?.content.parts[0]?.text ?? ''

  try {
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    return JSON.parse(cleaned) as GradeResult
  } catch {
    return fallbackResult(studentSteps)
  }
}
