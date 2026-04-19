# Feature Scaffolder Rules (생성 에이전트)

이 규칙은 새로운 기능(Feature)의 골격을 일관되게 생성하기 위해 사용됩니다.

## 1. 디렉토리 구조 생성
새로운 기능을 생성할 때 반드시 아래 구조를 따릅니다:
- `src/features/<name>/presentation/`: UI 컴포넌트 및 페이지 클래스.
- `src/features/<name>/domain/`: 비즈니스 로직 및 `*.types.ts` 정의.
- `src/features/<name>/infrastructure/`: IPC 호출을 위한 `<name>.ipc.ts` 파일.

## 2. 기본 파일 템플릿
- **Page/Component**: `src/core/Component.ts`를 상속받고 `jsx` 태그 함수를 사용하는 기본 구조.
- **Types**: 도메인 모델을 정의하는 `interface` 또는 `type`.
- **IPC Wrapper**: `window.api`를 통해 메인 프로세스와 통신하는 비동기 함수들.

## 3. 라우터 등록 (반자동)
- `src/core/Router.ts`를 직접 수정하여 사고를 내는 대신, 등록이 필요한 위치에 아래와 같은 주석과 샘플 코드를 삽입합니다.
  - `// TODO: Register <Name>Page route`
  - `// import { <Name>Page } from '../features/<name>/presentation/<Name>Page';`

## 4. 주의사항
- 기존 파일을 대규모로 수정하지 않고 **새 파일 생성**에 집중합니다.
- 파일명은 항상 PascalCase(컴포넌트) 또는 camelCase(그 외) 규칙을 준수합니다.
