# MathQuest — 고2 수학 단계별 풀이 퀴즈

React + TypeScript + Vite + Tailwind CSS 로 구축한 고등학교 2학년 수학 퀴즈 앱입니다.

## 주요 기능

- **단원 선택**: 대수 / 미적분 / 혼합
- **난이도**: Level 1 (기본) ~ Level 3 (심화)
- **MathQuill** 수식 입력기 + 팔레트
- **Gemini AI** 단계별 자동 채점
- 힌트 시스템 (최대 3단계, 점수 차감)
- 채점 결과: 단계별 피드백 / 모범 답안 / 문제 구조 맵 / 연결 교과과정

## 시작하기

```bash
npm install
```

`.env` 파일을 만들고 Gemini API 키를 입력하세요:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

API 키 발급: https://aistudio.google.com/apikey (무료)

```bash
npm run dev
```

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- MathQuill (수식 입력)
- KaTeX (수식 렌더링)
- Google Gemini 2.0 Flash (AI 채점)
