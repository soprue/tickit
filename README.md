# 🎫 Tickit (틱잇)
> **Vanilla TypeScript & Electron으로 구현한 리액트 아키텍처 기반의 데스크탑 리마인더**

<div align="center">
  <img src="src/assets/logo.webp" width="120" height="120" alt="Tickit Logo" />
</div>

## 📖 프로젝트 동기
저는 정해진 루틴대로 생활하고 있으며, 약도 제시간에 챙겨 먹어야 합니다. 하지만 핸드폰을 자주 보지 않아 시간을 놓치는 경우가 많았습니다. 이러한 문제를 해결하기 위해 이 애플리케이션을 만들었습니다. 이 애플리케이션은 데스크탑 환경에서 알림을 통해 중요한 일정을 놓치지 않도록 도와줍니다.

## 🎯 기술적 목표: React 아키텍처 직접 구현하기
이 프로젝트는 **"React 프레임워크의 내부 동작 원리를 깊이 있게 공부하고 싶다"**는 갈증에서 시작되었습니다. React 라이브러리를 단순히 가져다 쓰는 것이 아니라, 그 아키텍처를 순수 TypeScript로 직접 밑바닥부터 구현해 보는 것을 최우선 목표로 삼았습니다.

*   **컴포넌트 생명주기 이해**: React의 `Mount`, `Update`, `Unmount` 과정을 직접 코드로 설계하며 컴포넌트의 제어 흐름을 학습했습니다.
*   **가상 돔(Virtual DOM) 엔진**: 실제 DOM 조작의 비용을 최소화하기 위해 가상 돔 개념을 도입하고, 데이터 변경 시 차이점을 분석하여 필요한 부분만 업데이트하는 렌더링 최적화 원리를 공부했습니다.
*   **선언적 UI와 JSX**: 명령형 DOM 조작이 아닌, 데이터에 따라 UI가 그려지는 '선언적' 방식을 유지하기 위해 **태그 템플릿 리터럴 기반의 `jsx` 파서**를 직접 만들어 구현했습니다.
*   **상태 관리 시스템**: `State`가 변할 때 어떻게 UI가 반응(React)하는지, 그 연결 고리를 `Observable` 패턴 기반의 `Store` 시스템으로 직접 구축했습니다.
*   **SPA 라우팅 원리**: 프레임워크 제공 라우터 없이 `Hash` 기반의 SPA 라우팅 시스템을 직접 구현하며 주소 체계와 컴포넌트 전환 원리를 익혔습니다.

## 🛠 주요 구현 기능

### 1. 프레임워크 코어 (Custom Core)
*   **JSX Parser**: `jsx` 템플릿 리터럴을 통해 선언적 UI 구조를 작성할 수 있는 커스텀 파서 구현.
*   **Virtual DOM**: 가상 돔을 통한 효율적인 UI 업데이트 및 렌더링 로직.
*   **Component**: `init`, `render`, `componentDidUpdate` 등 생명주기를 가진 베이스 클래스 추상화.
*   **Store**: 전역 상태를 중앙에서 관리하고, 변화 발생 시 구독 중인 컴포넌트만 자동 리렌더링.
*   **Router**: Hash 기반의 라우팅을 직접 구현하여 SPA(Single Page Application) 구조 확립.

### 2. 서비스 기능 (Features)
*   **리마인더 CRUD**: 카테고리별 일정 관리 및 티켓 형태의 세련된 리스트 UI.
*   **커스텀 타임피커**: AM/PM 및 분 단위까지 정확하게 설정 가능한 시간 선택 인터페이스.
*   **시스템 알림**: Electron 네이티브 API를 활용하여 정해진 시간에 데스크탑 팝업 알림 발송.
*   **데이터 영속성**: Electron IPC 통신을 활용하여 로컬 파일 시스템에 데이터 자동 저장 및 복구.
*   **테마 시스템**: CSS 변수와 상태 관리를 활용한 실시간 다크 모드 지원.

## 🚀 사용 방법 및 실행

### 설치 파일 다운로드
[Releases](https://github.com/soprue/vanilla-reminder/releases) 페이지에서 자신의 OS(macOS, Windows)에 맞는 설치 파일을 내려받아 즉시 사용할 수 있습니다.

> **⚠️ macOS 사용자 주의사항**  
> Apple에 등록되지 않은 개발자의 앱이므로 실행 시 "손상되었기 때문에 열 수 없습니다"라는 메시지가 뜰 수 있습니다. 이 경우 앱을 **응용 프로그램** 폴더로 옮긴 후, 터미널에서 아래 명령어를 입력하면 정상적으로 실행됩니다:  
> \`sudo xattr -rd com.apple.quarantine /Applications/Tickit.app\`

### 개발 환경 실행
```bash
# 저장소 복제
git clone https://github.com/soprue/vanilla-reminder.git

# 의존성 설치
npm install

# 개발 서버 및 Electron 실행 (HMR 지원)
npm run dev

# 실행 파일(.dmg, .exe) 패키징 및 배포 설정
npm run dist
```

## 📅 향후 개발 로드맵 (Roadmap)

본 프로젝트는 현재의 바닐라 버전을 넘어, 실제 서비스 수준의 완성도를 갖춘 **Tickit v2(React)**로의 진화를 계획하고 있습니다.

### 🟢 Phase 1: 아키텍처 현대화 (React & Vite)
- [ ] **빌드 도구 전환**: Webpack에서 Vite로 전환하여 HMR 및 빌드 속도 개선.
- [ ] **React Core 도입**: 커스텀 `Component`, `JSX`를 React 함수형 컴포넌트와 Hooks로 전환.
- [ ] **상태 관리 전환**: `Store.ts`를 전역 상태 관리 라이브러리(Zustand 등)로 마이그레이션.
- [ ] **UI 디자인 시스템**: CSS Modules 또는 Vanilla Extract를 활용한 컴포넌트 라이브러리 구축.

### 🟡 Phase 2: 클라우드 연동 및 보안 (Supabase)
- [ ] **Auth 시스템**: Supabase Auth를 통한 소셜 로그인(Google, Github) 연동.
- [ ] **실시간 데이터 동기화**: 로컬 저장소와 클라우드 DB 간의 하이브리드 저장 방식 구현.
- [ ] **오프라인 우선 전략**: 오프라인 환경에서도 원활한 사용을 위한 로컬 캐싱 최적화.

### 🟠 Phase 3: 기능 고도화 및 개인화
- [ ] **정교한 루틴 설정**: 매일, 매주, 특정 요일 반복 등 맞춤형 반복 알림 로직 구현.
- [ ] **카테고리 개인화**: 티켓 카테고리별 컬러 및 아이콘 커스터마이징 기능 추가.
- [ ] **다국어 지원 (i18n)**: 한국어와 영어 지원을 통한 글로벌 서비스 대응.
- [ ] **데이터 시각화**: 완료된 리마인더 기반의 주간/월간 달성도 통계 대시보드.

### 🔴 Phase 4: 자동화 및 안정성
- [ ] **CI/CD 파이프라인**: GitHub Actions를 통한 빌드 및 Release 자동화.
- [ ] **자동 업데이트**: Electron-updater를 활용한 클라이언트 업데이트 기능.
- [ ] **테스트 커버리지**: Vitest를 이용한 핵심 도메인 로직 단위 테스트 강화.

---
**Author**: [soprue](https://github.com/soprue)  
**Project Milestone**: v1.1.0-vanilla Completion.
