import type { Question } from '../types'

export const ALL_QUESTIONS: Question[] = [
  {
    id: 'alg-1', category: 'algebra', level: 1,
    title: '이차방정식 $x^2 - 5x + 6 = 0$ 의 두 근을 \\(\\alpha,\\, \\beta\\) 라 할 때, \\(\\alpha + \\beta\\) 의 값을 구하여라.',
    answer: '5',
    solutionSteps: ['x^2 - 5x + 6 = 0','(x - 2)(x - 3) = 0','x = 2 \\quad \\text{또는} \\quad x = 3','\\alpha + \\beta = 2 + 3 = 5'],
    hints: ['인수분해를 이용해보세요. 두 수의 합이 5이고 곱이 6인 수를 찾아보세요.','(x - a)(x - b) = 0 형태로 인수분해하면, 두 근의 합은 a + b 입니다.','(x - 2)(x - 3) = 0 으로 인수분해됩니다. 두 근은 2와 3입니다.'],
    structureMap: { goal: '이차방정식의 두 근의 합 구하기', given: 'x^2 - 5x + 6 = 0', strategy: ['인수분해법 적용', '근과 계수의 관계 활용'], tools: ['인수분해', '비에타 공식 (근의 합 = -b/a)'] },
    priorKnowledge: [{ grade: '중3', topic: '이차방정식의 풀이' }, { grade: '고1', topic: '인수분해' }],
  },
  {
    id: 'alg-2', category: 'algebra', level: 1,
    title: '첫째항이 $3$이고 공차가 $4$인 등차수열 $\\{a_n\\}$ 에서 제 $10$ 항 $a_{10}$ 을 구하여라.',
    answer: '39',
    solutionSteps: ['a_n = a_1 + (n-1)d','a_{10} = 3 + (10-1) \\times 4','a_{10} = 3 + 9 \\times 4','a_{10} = 3 + 36 = 39'],
    hints: ['등차수열의 일반항 공식은 $a_n = a_1 + (n-1)d$ 입니다.','$a_1 = 3$, $d = 4$, $n = 10$ 을 공식에 대입해보세요.','$a_{10} = 3 + 9 \\times 4 = 3 + 36$ 를 계산하세요.'],
    structureMap: { goal: '등차수열의 제 n항 구하기', given: 'a_1 = 3,\\; d = 4,\\; n = 10', strategy: ['일반항 공식 적용'], tools: ['등차수열 일반항: a_n = a_1 + (n-1)d'] },
    priorKnowledge: [{ grade: '고1', topic: '수열의 뜻과 등차수열' }],
  },
  {
    id: 'alg-3', category: 'algebra', level: 2,
    title: '$f(x) = x^2 - 6x + 11$ 의 최솟값을 구하여라.',
    answer: '2',
    solutionSteps: ['f(x) = x^2 - 6x + 11','f(x) = (x^2 - 6x + 9) + 11 - 9','f(x) = (x - 3)^2 + 2','\\text{최솟값} = 2 \\quad (x = 3 \\text{일 때})'],
    hints: ['완전제곱식으로 변형하는 방법(배출법)을 사용하세요.','$x^2 - 6x = (x-3)^2 - 9$ 임을 이용하세요.','$f(x) = (x-3)^2 + 2$ 이므로 $(x-3)^2 \\ge 0$ 에서 최솟값은 2입니다.'],
    structureMap: { goal: '이차함수의 최솟값 구하기', given: 'f(x) = x^2 - 6x + 11', strategy: ['완전제곱식 변형', '꼭짓점 좌표 파악'], tools: ['완전제곱식', '이차함수의 꼭짓점 공식'] },
    priorKnowledge: [{ grade: '중3', topic: '이차함수의 최대·최솟값' }, { grade: '고1', topic: '완전제곱식' }],
  },
  {
    id: 'alg-4', category: 'algebra', level: 2,
    title: '첫째항이 $1$이고 공비가 $2$인 등비수열의 첫 $5$항의 합 $S_5$ 를 구하여라.',
    answer: '31',
    solutionSteps: ['S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\ne 1)','S_5 = \\frac{1 \\cdot (2^5 - 1)}{2 - 1}','S_5 = \\frac{32 - 1}{1}','S_5 = 31'],
    hints: ['등비수열의 합 공식 $S_n = \\dfrac{a(r^n-1)}{r-1}$ 을 이용하세요.','$a=1$, $r=2$, $n=5$ 를 대입하세요.','$2^5 = 32$ 이므로 $S_5 = \\dfrac{32-1}{1} = 31$ 입니다.'],
    structureMap: { goal: '등비수열의 부분합 구하기', given: 'a_1 = 1,\\; r = 2,\\; n = 5', strategy: ['등비수열 합 공식 적용'], tools: ['S_n = a(r^n - 1) / (r - 1)'] },
    priorKnowledge: [{ grade: '고1', topic: '등비수열과 그 합' }],
  },
  {
    id: 'alg-5', category: 'algebra', level: 3,
    title: '다항식 $P(x)$ 를 $(x-1)$ 로 나눈 나머지가 $3$이고, $(x+2)$ 로 나눈 나머지가 $-3$ 일 때, $P(x)$ 를 $(x-1)(x+2)$ 로 나눈 나머지 $R(x) = ax + b$ 에 대하여 $a + b$ 의 값을 구하여라.',
    answer: 'a=2,\\; b=1,\\; a+b=3',
    solutionSteps: ['R(x) = ax + b \\text{ 라 하면}','P(1) = a + b = 3 \\quad \\cdots \\text{①}','P(-2) = -2a + b = -3 \\quad \\cdots \\text{②}','\\text{①} - \\text{②}: \\; 3a = 6 \\Rightarrow a = 2','b = 3 - a = 1','a + b = 2 + 1 = 3'],
    hints: ['나머지정리: P(1) = 3, P(-2) = -3 을 이용하세요.','나머지 R(x) = ax + b 로 놓으면 P(x) = (x-1)(x+2)Q(x) + ax + b 입니다.','x = 1과 x = -2을 각각 대입하여 a, b에 대한 연립방정식을 세우세요.'],
    structureMap: { goal: 'P(x) ÷ (x-1)(x+2)의 나머지 구하기', given: 'P(1)=3,\\; P(-2)=-3', strategy: ['나머지정리 적용', '연립방정식 풀기'], tools: ['나머지정리', '인수정리', '연립일차방정식'] },
    priorKnowledge: [{ grade: '고1', topic: '나머지정리와 인수정리' }, { grade: '중3', topic: '연립방정식' }],
  },
  {
    id: 'calc-1', category: 'calculus', level: 1,
    title: '$\\displaystyle\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$ 의 값을 구하여라.',
    answer: '4',
    solutionSteps: ['\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}','= \\lim_{x \\to 2} \\frac{(x+2)(x-2)}{x-2}','= \\lim_{x \\to 2} (x + 2)','= 2 + 2 = 4'],
    hints: ['분자 $x^2 - 4$ 를 인수분해해 보세요.','$x^2 - 4 = (x+2)(x-2)$ 로 인수분해하면 분모와 약분됩니다.','약분 후 $x \\to 2$ 를 대입하면 $2 + 2 = 4$ 입니다.'],
    structureMap: { goal: '0/0 부정형 극한값 계산', given: '\\lim_{x\\to2} \\frac{x^2-4}{x-2}', strategy: ['분자 인수분해', '0이 되는 인수 약분', '극한 대입'], tools: ['인수분해', '극한의 정의'] },
    priorKnowledge: [{ grade: '고2', topic: '함수의 극한' }, { grade: '중3', topic: '인수분해' }],
  },
  {
    id: 'calc-2', category: 'calculus', level: 1,
    title: "$f(x) = x^3 - 3x^2 + 2x - 1$ 일 때, $f'(1)$ 의 값을 구하여라.",
    answer: '-1',
    solutionSteps: ["f'(x) = 3x^2 - 6x + 2","f'(1) = 3(1)^2 - 6(1) + 2","f'(1) = 3 - 6 + 2","f'(1) = -1"],
    hints: ["거듭제곱 함수의 미분법 $(x^n)'= nx^{n-1}$ 을 각 항에 적용하세요.","$f'(x) = 3x^2 - 6x + 2$ 를 먼저 구하세요.","$f'(1) = 3 - 6 + 2 = -1$ 입니다."],
    structureMap: { goal: '다항함수의 특정 점에서 미분값 계산', given: 'f(x) = x^3 - 3x^2 + 2x - 1', strategy: ['각 항 미분', 'x=1 대입'], tools: ["거듭제곱 미분법: (x^n)' = nx^{n-1}"] },
    priorKnowledge: [{ grade: '고2', topic: '미분법' }],
  },
  {
    id: 'calc-3', category: 'calculus', level: 2,
    title: "$f(x) = (2x + 1)^4$ 일 때, $f'(x)$ 를 구하여라.",
    answer: '8(2x+1)^3',
    solutionSteps: ['f(x) = (2x+1)^4',"f'(x) = 4(2x+1)^3 \\cdot (2x+1)'","f'(x) = 4(2x+1)^3 \\cdot 2","f'(x) = 8(2x+1)^3"],
    hints: ["합성함수의 미분법(연쇄법칙): $[g(h(x))]'= g'(h(x)) \\cdot h'(x)$ 를 이용하세요.","바깥 함수 $u^4$ 를 먼저 미분하면 $4u^3$, 안쪽 함수 $(2x+1)$ 을 미분하면 $2$ 입니다.","$f'(x) = 4(2x+1)^3 \\cdot 2 = 8(2x+1)^3$ 입니다."],
    structureMap: { goal: '합성함수 미분', given: 'f(x) = (2x+1)^4', strategy: ['연쇄법칙(chain rule) 적용'], tools: ["합성함수 미분법: [g(h(x))]' = g'(h(x))·h'(x)"] },
    priorKnowledge: [{ grade: '고2', topic: '합성함수의 미분법' }],
  },
  {
    id: 'calc-4', category: 'calculus', level: 2,
    title: '$\\displaystyle\\int_0^2 (3x^2 - 2x + 1)\\,dx$ 를 계산하여라.',
    answer: '6',
    solutionSteps: ['\\int_0^2 (3x^2 - 2x + 1)\\,dx','= \\left[ x^3 - x^2 + x \\right]_0^2','= (8 - 4 + 2) - (0 - 0 + 0)','= 6'],
    hints: ['각 항을 적분하세요: $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$','부정적분을 구하면 $x^3 - x^2 + x$ 입니다.','미적분학의 기본 정리를 적용: $x=2$ 대입값에서 $x=0$ 대입값을 빼세요.'],
    structureMap: { goal: '정적분 계산', given: '\\int_0^2 (3x^2 - 2x + 1)\\,dx', strategy: ['각 항 적분(거듭제곱 적분법)', '미적분학의 기본 정리 적용'], tools: ['\\int x^n dx = x^{n+1}/(n+1) + C', '미적분학의 기본 정리'] },
    priorKnowledge: [{ grade: '고2', topic: '정적분의 계산' }],
  },
  {
    id: 'calc-5', category: 'calculus', level: 3,
    title: '$f(x) = x^3 - 3x + 2$ 에서 극솟값을 구하여라.',
    answer: '0',
    solutionSteps: ["f'(x) = 3x^2 - 3 = 3(x^2-1) = 3(x+1)(x-1)","f'(x) = 0 \\Rightarrow x = -1 \\text{ 또는 } x = 1","x = 1 \\text{ 좌우에서 } f'(x): -\\to+ \\Rightarrow \\text{극소}",'f(1) = 1 - 3 + 2 = 0','\\text{극솟값} = 0'],
    hints: ["$f'(x)$ 를 먼저 구한 뒤 $f'(x) = 0$ 을 풀어 임계점을 찾으세요.","$f'(x) = 3x^2 - 3 = 3(x-1)(x+1) = 0$ 이므로 $x = \\pm 1$ 입니다.",'증감표를 그려 $x = 1$ 이 극소점임을 확인하고 $f(1)$ 을 계산하세요.'],
    structureMap: { goal: '다항함수의 극솟값 구하기', given: 'f(x) = x^3 - 3x + 2', strategy: ["f'(x) = 0 인 점 탐색", '증감표 작성', '극값 결정'], tools: ['미분법', '증감표', '극값의 정의'] },
    priorKnowledge: [{ grade: '고2', topic: '함수의 극대·극소' }, { grade: '고2', topic: '미분법의 응용' }],
  },
]

export function selectQuestions(
  category: 'algebra' | 'calculus' | 'mixed',
  level: 1 | 2 | 3,
  count: number,
): typeof ALL_QUESTIONS {
  let pool = ALL_QUESTIONS
  if (category !== 'mixed') pool = pool.filter((q) => q.category === category)
  pool = pool.filter((q) => q.level <= level)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
