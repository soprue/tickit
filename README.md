# 🎫 Tickit (틱잇)

> **React 19 & Electron으로 구현한 현대적인 데스크탑 리마인더**

<div align="center">
  <img src="src/assets/logo.webp" width="120" height="120" alt="Tickit Logo" />
</div>

## 📖 프로젝트 소개

Tickit은 데스크탑 환경에서 중요한 일정과 루틴을 놓치지 않도록 도와주는 리마인더 애플리케이션입니다.
초기에는 Vanilla TypeScript로 React 아키텍처를 직접 구현하며 학습하는 프로젝트로 시작했으나, 현재는 **React 19**와 **Zustand**를 기반으로 한 현대적이고 견고한 구조로 마이그레이션되었습니다.

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, CSS Modules
- **State Management**: Zustand (with Persistence)
- **Desktop Framework**: Electron
- **Build Tool**: Vite
- **Routing**: React Router 7

## 🚀 주요 기능

- **리마인더 관리**: 카테고리별 일정 CRUD 및 티켓 스타일의 UI.
- **시스템 알림**: Electron 네이티브 API를 활용한 실시간 푸시 알림.
- **테마 시스템**: 다크 모드 및 라이트 모드 실시간 전환 지원.
- **데이터 영속성**: 로컬 파일 시스템을 활용한 데이터 자동 저장.

## 📅 향후 개발 로드맵 (Roadmap)

### 🟢 Phase 1: 아키텍처 현대화 (Completed)

- [x] **Vite 전환**: 빌드 속도 및 HMR 최적화.
- [x] **React 19 마이그레이션**: 함수형 컴포넌트 및 Hooks 기반 전환.
- [x] **상태 관리 통합**: Zustand 도입을 통한 전역 상태 관리 체계 구축.

### 🟡 Phase 2: 클라우드 연동 및 보안 (Planned)

- [ ] **Auth 시스템**: Supabase Auth를 통한 소셜 로그인 연동.
- [ ] **실시간 동기화**: 클라우드 DB 연동 및 오프라인 우선 전략 적용.

### 🟠 Phase 3: 기능 고도화

- [ ] **정교한 루틴 설정**: 반복 알림 로직 및 카테고리 커스터마이징.
- [ ] **다국어 지원 (i18n)**: 글로벌 사용자를 위한 i18n 적용.

### 🔴 Phase 4: 자동화 및 안정성

- [ ] **CI/CD 파이프라인**: GitHub Actions를 통한 빌드 및 Release 자동화.
- [ ] **자동 업데이트**: Electron-updater를 활용한 클라이언트 업데이트 기능.
- [ ] **테스트 커버리지**: Vitest를 이용한 핵심 도메인 로직 단위 테스트 강화.

---

**Author**: [soprue](https://github.com/soprue)
