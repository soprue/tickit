# 🎫 Tickit (틱잇)

> **React 19 & Electron으로 구현한 현대적인 데스크탑 리마인더**

<div align="center">
  <img src="src/assets/logo.webp" width="120" height="120" alt="Tickit Logo" />
</div>

## 📖 프로젝트 소개

Tickit은 데스크탑 환경에서 중요한 일정과 루틴을 놓치지 않도록 도와주는 리마인더 애플리케이션입니다.
초기에는 Vanilla TypeScript로 React 아키텍처를 직접 구현하며 학습하는 프로젝트로 시작했으나, 현재는 **React 19**와 **Zustand**를 기반으로 한 현대적이고 견고한 구조로 마이그레이션되었습니다.

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **State Management**: Zustand (with Persistence & Immer)
- **Data Fetching**: TanStack Query v5, Axios, Orval (API Code Gen)
- **Desktop Framework**: Electron (Main/Preload/Renderer Separation)
- **Build Tool**: Vite
- **Testing**: Vitest

## 🚀 주요 기능

- **리마인더 관리**: 카테고리별 일정 CRUD 및 티켓 스타일의 UI.
- **클라우드 인증**: Electron IPC와 `BrowserWindow`를 활용한 구글 OAuth2 로그인 및 JWT 기반 세션 관리.
- **시스템 알림**: Electron 네이티브 API를 활용한 실시간 푸시 알림.
- **테마 시스템**: 다크 모드 및 라이트 모드 실시간 전환 지원.
- **데이터 보안**: 로그아웃 시 로컬 스토리지 및 메모리 데이터 완전 초기화로 보안성 강화.

## 📅 개발 로드맵 (Roadmap)

### 🟢 Phase 1: 아키텍처 현대화 (React & Zustand) - 완료 ✅

- [x] **빌드 도구 전환**: Webpack에서 Vite로 전환하여 HMR 및 빌드 속도 개선.
- [x] **React Core 도입**: 커스텀 `Component`에서 React 19 함수형 컴포넌트와 Hooks로 전환.
- [x] **상태 관리 전환**: Zustand(with Persistence) 기반의 현대적 상태 관리 체계로 마이그레이션.
- [x] **아키텍처 정립**: 기능 중심(Feature-based) 계층형 아키텍처 도입.

### 🟢 Phase 2: 클라우드 연동 및 인증 시스템 - 완료 ✅

- [x] **백엔드 인프라**: Nest.js 기반 API 서버 연동 및 클라우드 배포 환경 구축.
- [x] **인증 시스템**: 구글 OAuth2 및 JWT(Access/Refresh Token) 기반 인증 로직 개발.
- [x] **Electron 인증 브릿지**: IPC 통신과 별도 창 제어를 통한 안전한 소셜 로그인 흐름 구현.
- [x] **세션 정교화**: 로그아웃 시 모든 로컬 데이터(Reminders, Auth) 완전 리셋 로직 적용.

### 🟡 Phase 3: 기능 고도화 및 오프라인 전략 - 진행 중 🏗️

- [ ] **오프라인 우선(Offline-first)**: 서버 연결이 끊겨도 로컬 데이터를 유지하고 재연결 시 동기화하는 로직 최적화.
- [ ] **정교한 루틴 설정**: 매일, 매주, 특정 요일 반복 등 맞춤형 반복 알림 로직 구현.
- [ ] **다국어 지원 (i18n)**: 한국어와 영어 지원을 통한 글로벌 서비스 대응.
- [ ] **데이터 시각화**: 완료된 리마인더 기반의 주간/월간 달성도 통계 대시보드.

### 🔴 Phase 4: 자동화 및 안정성

- [ ] **CI/CD 파이프라인**: GitHub Actions를 통한 빌드 및 Release 자동화.
- [x] **테스트 커버리지**: Vitest를 이용한 핵심 도메인 로직 단위 테스트 구축.
- [ ] **자동 업데이트**: Electron-updater를 활용한 클라이언트 업데이트 기능.

---

**Author**: [soprue](https://github.com/soprue)
