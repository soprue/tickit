# Tickit Project Guidelines

이 프로젝트는 **Electron**과 **Vanilla TypeScript** 기반의 커스텀 프레임워크를 사용합니다. 
AI는 작업을 시작하기 전, 아래 규칙 중 현재 작업 범위에 해당하는 상세 지침을 먼저 읽고 준수해야 합니다.

## 📌 규칙 인덱스 (Rule Index)
- **프레임워크 코어 (.gemini/rules/framework.md)**: `Component`, `JSX`, `Router` 활용 및 생명주기 규칙.
- **폴더 구조 및 설계 (.gemini/rules/structure.md)**: 기능(Feature) 기반 아키텍처 및 폴더 구조 규칙.
- **코드 컨벤션 (.gemini/rules/conventions.md)**: TypeScript 규칙, 주석 원칙, 에러 처리 계층화 등.
- **Electron 아키텍처 (.gemini/rules/electron.md)**: 메인/렌더러 프로세스 분리 및 IPC 통신 규칙.
- **스타일 및 UI (.gemini/rules/style.md)**: CSS 네이밍 및 컴포넌트 스타일링 규칙.
- **Git 워크플로우 (.gemini/rules/git.md)**: 논리적 단위 커밋 및 메시지 컨벤션 규칙.
- **교육 모드 (.gemini/rules/education.md)**: 챌린지 기반 학습(Challenge-Based Learning) 및 멘토링 규칙.

### 🤖 실전 에이전트 (Specialized Agents)
- **골격 생성 (.gemini/rules/scaffolder.md)**: 기능별 디렉토리 및 기본 파일 생성 가이드.
- **IPC 설계 (.gemini/rules/ipc-architect.md)**: Main-Preload-Renderer 간의 통신 브릿지 설계 규칙.
- **변경 검증 (.gemini/rules/validator.md)**: 작업 완료 후 안정성 검증 및 타입 체크 절차.

---

## 🛠 기본 원칙 (Core Principles)
1. **모듈성**: 모든 UI는 `Component`를 상속받은 독립적인 클래스로 구성합니다.
2. **보안**: 렌더러 프로세스에서 Node.js API를 직접 호출하지 않습니다 (`preload.cjs` 활용).
3. **단방향 흐름**: 가능한 `state` 변경을 통해 UI를 갱신하며, 직접적인 DOM 조작은 최소화합니다.
