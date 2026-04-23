# Electron IPC Guidelines

메인 프로세스와 렌더러 프로세스 간의 안전하고 명확한 통신 규칙입니다.

## 1. IPC 호출 규칙
- **직접 접근 금지**: 컴포넌트나 훅에서 `window.api`를 직접 호출하지 않습니다.
- **IPC 유틸리티 사용**: `shared/utils/ipc.ts`에 정의된 `ipc.invoke` 메서드를 통해 통신합니다.
  - 장점: 자동 타입 지원, 공통 에러 핸들링, `window.api` 존재 여부 자동 체크.

## 2. 이벤트 수신 (Main -> Renderer)
- **useIpc 훅 사용**: 메인 프로세스에서 보낸 이벤트를 들을 때는 `shared/presentation/hooks/useIpc.ts` 훅을 사용합니다.
- **클린업**: 훅을 통해 리스너를 등록함으로써 컴포넌트 언마운트 시 메모리 누수를 방지합니다.

## 3. 보안 (Preload Script)
- `preload.cjs`에서 허용된 채널 목록(Allow-list)을 엄격히 관리하여 임의의 IPC 메시지가 전송되지 않도록 합니다.
