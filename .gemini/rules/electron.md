# Electron Architecture Rules

이 문서는 Electron 메인/렌더러 프로세스 간의 협업 방식을 정의합니다.

## 1. IPC 통신 (Inter-Process Communication)
- **메인(Main)**: `electron/main.js` (또는 `main.ts`)에서 Node.js API를 실행합니다. 
- **프리로드(Preload)**: `preload.cjs`에서 `contextBridge`를 사용하여 안전한 API를 노출합니다. 
- **렌더러(Renderer)**: `src/` 하위 코드에서 `window.api` (또는 정의된 이름)를 통해 통신합니다.

## 2. 파일 시스템/데이터 저장
- `fs` 모듈 등은 오직 메인 프로세스에서만 사용 가능합니다.
- 데이터 저장 로직은 메인에 구현하고, 렌더러는 비동기 호출(`ipcRenderer.invoke`)을 통해 데이터를 가져옵니다.

## 3. 보안 (Security)
- `nodeIntegration: false`, `contextIsolation: true` 설정을 유지합니다.
- 외부 URL 로드는 반드시 검증되어야 합니다.
