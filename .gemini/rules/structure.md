# Folder Structure & Architecture Rules

이 프로젝트는 기능(Feature) 중심의 계층형 아키텍처를 따릅니다.

## 1. 디렉토리 구조 (Directory Structure)
- **`src/core/`**: 프레임워크 핵심 로직 (Component, JSX, Router 등). 수정 빈도가 낮음.
- **`src/features/`**: 도메인별 기능 모듈.
  - `features/<name>/presentation/`: 해당 기능의 컴포넌트 및 페이지.
  - `features/<name>/domain/`: 비즈니스 로직, 데이터 변환, 유틸리티.
  - `features/<name>/infrastructure/`: Electron IPC 통신, 로컬 저장소 접근.
  - `features/<name>/types.ts`: 도메인 전용 타입 정의.
- **`src/shared/`**: 여러 기능에서 공통으로 사용하는 모듈.
  - `shared/components/`: 공통 UI 요소 (Button, Modal 등).
  - `shared/utils/`: 날짜 포맷팅, 문자열 처리 등 범용 유틸리티.
- **`src/styles/`**: 전역 CSS 스타일.

## 2. 파일 네이밍 규칙 (Naming Conventions)
- **컴포넌트 클래스**: PascalCase (예: `ReminderItem.ts`, `MainPage.ts`).
- **일반 함수/변수**: camelCase.
- **상수**: UPPER_SNAKE_CASE.
- **접미사 활용**:
  - 타입 파일: `*.types.ts`
  - 데이터 파일: `*.data.ts`
  - 스타일 파일: `*.css` (컴포넌트별 스타일이 필요한 경우)

## 3. 의존성 방향 (Dependency Rules)
- `features` 내부 코드는 `core`와 `shared`를 참조할 수 있습니다.
- `core`는 `features`를 참조해서는 안 됩니다.
- 렌더러 프로세스(src/)에서 메인 프로세스 로직을 직접 호출하지 않고, 반드시 IPC(infrastructure 레이어)를 거칩니다.
