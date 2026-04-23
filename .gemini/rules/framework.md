# Framework Core Rules (React 19)

이 프로젝트는 React 19의 기능을 최대한 활용하여 선언적이고 효율적인 앱을 구축합니다.

## 1. Functional Components
- 모든 UI는 함수형 컴포넌트로 작성합니다.
- `autoFocus` 속성을 활용하여 편집 모드 전환 시 포커스를 선언적으로 관리합니다.

## 2. Hooks 아키텍처 (계층화)
- **Atomic Hooks**: 단일 기능만 수행하는 작은 훅 (예: `useSearchFilter`, `useTimePickerState`).
- **Facade Hooks (Orchestrator)**: 여러 Atomic 훅을 조립하여 페이지에 최종 인터페이스를 제공하는 훅 (예: `useReminderUI`).
- **규칙**: 컴포넌트는 가급적 하나의 Facade 훅만 구독하여 깨끗한 상태를 유지합니다.

## 3. React 19 Actions & Transitions
- 비동기 작업(저장, 삭제 등)은 `useTransition` 기반의 **전역 Action 시스템**을 통해 실행합니다.
- `isPending` 상태를 활용하여 '저장 중...'과 같은 사용자 피드백을 선언적으로 제공합니다.

## 4. Router (React Router 7)
- 페이지 이동은 `useNavigate` 훅을 사용합니다.
- 직접적인 `window.location.hash` 조작을 금지하며, 라우터가 제공하는 선언적 API를 우선시합니다.
