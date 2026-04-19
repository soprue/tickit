# Electron IPC Architect Rules (연결 에이전트)

이 규칙은 메인, 프리로드, 렌더러 간의 안전한 데이터 통신(IPC)을 위해 사용됩니다.

## 1. IPC 계약(Contract) 중심 설계
IPC 채널을 생성하기 전, 먼저 아래 파일에서 채널명과 데이터 타입을 정의합니다:
- `src/shared/ipc/<name>.contract.ts` (채널 이름, Payload, Result 타입)
- **채널 네이밍**: `domain:action` (예: `reminder:save`, `reminder:get-list`)

## 2. 보안 원칙 (Preload)
- `preload.cjs`에서 `ipcRenderer` 원본을 절대 노출하지 않습니다.
- **안전한 노출**: `contextBridge.exposeInMainWorld('api', { ... })` 내에서 특정한 함수를 통해 `ipcRenderer.invoke` 또는 `send`를 호출하는 방식만 허용합니다.

## 3. 코드 분리 (Main)
- `main.ts`에 모든 로직을 직접 작성하지 않습니다.
- **핸들러 분리**: 비즈니스 로직은 `src/main/ipc/<name>.handler.ts`와 같이 분리하여 정의하고, `main.ts`에서는 이를 불러와 리스너를 등록합니다.

## 4. 렌더러 래퍼 (Renderer)
- `src/features/<feature>/infrastructure/<name>.ipc.ts`와 같은 파일을 생성하여, UI 컴포넌트가 편리하게 비동기 호출을 할 수 있도록 `window.api.<func>`를 호출하는 래퍼 함수를 제공합니다.
