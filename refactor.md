# UI 리팩토링 정리

## HomePage

### 로고 교체
- 기존 `PokeballLogo` SVG + "Pokemon Minigames" h1 조합을 제거
- 새 로고 디자인 적용: `PokeFlip` 텍스트 + 절대 위치 포켓볼 뱃지
  - `Poke`: `yellow-200 → amber-500` 대각선 그라디언트
  - `Flip`: `red-400 → red-600` 그라디언트
  - `rotate-[-5deg]` + hover 시 `scale-110 + rotate-0` 애니메이션
  - 그림자 레이어 span 2개로 깊이감 표현
- 포켓볼: 흰 몸통, 빨간 윗면, 흰 중앙 버튼
- `font-galmuri` 적용

### 로고 위치 조정
- `motion.div`에 `-mt-16 pb-32` 적용해 로고를 위로 올리고 버튼과의 간격 확보

### 네비게이션 버튼 디자인 교체
- 기존 포켓몬 테마 버튼 → 새 디자인으로 통일
  - `w-[350px]`, `text-3xl`, `border-4 border-black`
  - `shadow-[4px_4px_0_0_black]` 박스섀도우
  - `bg-sky-300` 배경
  - hover: `scale-105 + -translate-y-1 + shadow 확대`
  - active: 섀도우 제거 + 이동 효과
  - `whitespace-nowrap` 줄바꿈 방지

### 배경
- `index.css` body gradient: `#fde8e8 → #f87171` → `#fdba74 → #ea580c` (진한 주황)

---

## GameSelectPage

### 게임 선택 카드 hover 효과
- `hover:-translate-y-1 + scale-[1.02]` 떠오르는 효과
- hover 시 배경색 `--color-brand`(빨강)로 전환
- `group` 활용해 자식 텍스트 색상 연동: 제목 → `white`, 설명·규칙 → `red-100`

### 난이도 버튼 색상
- 쉬움: `bg-game-success` (#22C55E 초록)
- 보통: `bg-game-warning` (#F59E0B 노랑)
- 어려움: `bg-game-error` (#EF4444 빨강)
- hover: `brightness-110`

### 뒤로가기 버튼 디자인
- "← 게임 선택으로 돌아가기": 텍스트 링크 → 테두리 버튼으로 교체
- 홈 버튼 추가: 게임 선택 제목 옆 `← 홈` 버튼

---

## PokedexPage

### 홈 버튼 추가
- 헤더 우측에 `← 홈` 버튼 추가
- 흰색 테두리 스타일, hover 시 흰 배경 + 빨간 글씨로 반전
