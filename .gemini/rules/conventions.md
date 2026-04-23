# Code Conventions & Best Practices

이 문서는 프로젝트의 코드 품질과 유지보수성을 높이기 위한 기술적 규칙을 정의합니다.

## 1. 명명 규칙 (Naming Conventions)
- **컴포넌트 & 파일**: `PascalCase` (예: `ReminderItem.tsx`)
- **커스텀 훅**: `camelCase`와 `use` 접두어 사용 (예: `useReminderUI.ts`)
- **일반 변수 & 함수**: `camelCase` (예: `const reminderData`)
- **상수**: `UPPER_SNAKE_CASE` (예: `const MAX_RETRY_COUNT = 3`)
- **인터페이스/타입**: `PascalCase` (예: `interface ReminderData`)
- **불리언 변수**: 상태를 명확히 하는 접두어 사용 (`isDone`, `hasMatches`, `shouldShow`)

## 2. TypeScript 규칙
- **`interface` vs `type`**:
  - `interface`: 컴포넌트의 Props, State, 구조적인 객체 정의 시 사용합니다.
  - `type`: 유니온 타입, 튜플, 함수 타입, 단순 데이터 모델 정의 시 사용합니다.
- **타입 Import**: `import type { ... }`를 사용하여 타입 전용 임포트를 명시하십시오.
- **Any 금지**: 타입을 알 수 없는 경우 `unknown`을 사용하고 타입 가드(Type Guard)를 활용하십시오.

## 3. 함수 및 이벤트 핸들러
- **선언 방식**: 모든 컴포넌트와 함수는 화살표 함수(`const Func = () => {}`)를 기본으로 사용합니다.
- **이벤트 핸들러**:
  - 내부 로직 실행 함수: `handle` + `이벤트명` (예: `handleDeleteClick`)
  - Props로 전달되는 콜백: `on` + `동작` (예: `onDelete`)

## 4. 주석 및 문서화 원칙
- **"왜(Why)"를 설명**: 코드 자체로 알 수 있는 "무엇(What)"보다는 해당 로직이 왜 필요한지, 비즈니스적 배경이나 결정 이유를 주석으로 남기십시오.
  - 예: `// 배터리 절약을 위해 1분 단위로만 리마인더 체크` (O)
  - 예: `// 1분마다 체크하는 루프 실행` (X)
- **TODO 형식**: 향후 개선이 필요한 부분은 `// TODO: 내용` 형식을 유지하십시오.

## 5. 상태 관리 전략 (State Management)
- **Zustand (Domain)**: 앱의 핵심 데이터 및 영속성(Persistence)이 필요한 상태 관리.
- **Zustand (UI Store)**: 여러 컴포넌트가 공유해야 하는 순수 UI 상태 (예: 편집 중인 ID).
- **Context API**: React 엔진 기능(예: `useTransition`의 펜딩 상태)이나 라이프사이클에 밀접한 UI 로직 공유.

## 6. 임포트 순서 (Import Ordering)
1. React 관련 패키지 (`react`, `react-dom`)
2. 외부 라이브러리 (`zustand`, `react-router-dom`)
3. 프로젝트 절대 경로 별칭 (`@src`, `@features`, `@assets` 등)
4. 상대 경로 (`./components`, `../hooks`)
5. 스타일 파일 (`.css`)

## 7. 에러 핸들링 (Error Handling)

### 1) 계층별 에러 처리 원칙
- **Infrastructure (IPC/Storage)**: 에러를 숨기지 않고 `throw` 하여 상위로 전파합니다. 발생한 원본 에러 정보를 유지하십시오.
- **Domain/Actions (Zustand/Hooks)**: `try-catch`의 주된 장소입니다. 비동기 작업 실패 시 에러를 포착하여 사용자 피드백(토스트, 모달)으로 전환하십시오.
- **Presentation (UI)**: 렌더링 중 발생하는 예상치 못한 에러를 위해 `ErrorBoundary`를 활용하십시오.

### 2) UI 피드백 기준
- **치명적 에러**: 전역 모달(Global Modal)을 사용하여 앱 사용을 일시 중단하고 명확한 후속 조치를 안내합니다.
- **일시적 에러**: 토스트(Toast) 알림을 사용하여 사용자의 흐름을 방해하지 않고 알립니다.

### 3) Error Boundary 사용 전략
- **전역 바운더리 (`GlobalErrorBoundary`)**: `App.tsx` 최상단에 배치하여 앱 전체가 화이트 스크린으로 멈추는 것을 방지합니다.
- **지역 바운더리**: 주요 위젯이나 섹션 단위로 배치하여, 특정 부분의 에러가 앱 전체로 퍼지지 않게 차단(Isolate)하고 해당 영역만 복구 UI를 보여줍니다.
- **복구 메커니즘**: 에러 발생 시 사용자에게 "다시 시도" 버튼을 제공하여 스스로 상태를 초기화하거나 복구할 수 있는 경로를 제공해야 합니다.

### 4) 로깅 규칙
- 에러 로깅 시 계층 정보를 접두어로 포함하십시오.
  - 예: `console.error('[Infrastructure] DB write failed:', error);`
