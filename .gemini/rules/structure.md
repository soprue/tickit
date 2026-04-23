# Project Structure & Architecture

이 프로젝트는 기능(Feature) 기반의 레이어드 아키텍처를 따릅니다.

## 1. 디렉토리 구조 (Layered Feature)
각 기능 폴더(`src/features/[feature-name]`)는 아래의 레이어로 나뉩니다.

- **domain**: 비즈니스 로직 및 상태 정의 (Zustand Stores, Interfaces).
- **infrastructure**: 외부 시스템과의 통신 (Persistence, IPC Storages).
- **presentation**: 사용자 인터페이스 (Components, Hooks).
  - `components/`: 순수 UI 컴포넌트.
  - `hooks/`: 해당 기능 전용 로직을 담은 훅.

## 2. 공유 레이어 (shared)
- 여러 기능에서 공통으로 쓰이는 유틸리티, 전역 컨텍스트, 공통 컴포넌트를 관리합니다.
- 예: `shared/utils/date.ts`, `shared/context/ActionContext.tsx`.

## 3. 원칙
- **상향식 의존성**: `presentation`은 `domain`에 의존할 수 있지만, `domain`은 `presentation`을 몰라야 합니다.
- **인프라 캡슐화**: 실제 데이터가 저장되는 방식(IPC, LocalStorage 등)은 `infrastructure` 계층 내부에 숨겨져야 합니다.
