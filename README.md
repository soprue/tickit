# Tickit

> 할 일과 일정을 간단하게 관리하는 데스크톱 리마인더 앱

<div align="center">
  <img src="src/assets/logo.webp" width="120" height="120" alt="Tickit Logo" />
</div>

## 프로젝트 소개

Tickit은 데스크톱 환경에서 리마인더, 할 일, 일정을 관리할 수 있는 Electron 기반 앱입니다.

사용자는 섹션별로 리마인더를 정리하고, 완료 상태를 관리하며, 검색과 알림 기능을 통해 중요한 일정을 놓치지 않도록 도와줍니다.

## 주요 기능

- 리마인더 섹션 생성, 수정, 삭제
- 리마인더 생성, 수정, 완료 처리, 삭제
- 리마인더 검색 및 필터링
- Google OAuth 기반 로그인
- 서버 API를 통한 리마인더 동기화
- 데스크톱 알림
- 온라인/오프라인 상태 감지
- 라이트/다크 테마 지원

## 기술 스택

- React 19
- TypeScript
- Electron
- Vite
- Zustand
- TanStack Query
- Axios / Orval
- Tailwind CSS v4
- Vitest
- electron-builder

## 시작하기

### 요구 사항

- Node.js 22
- npm

### 의존성 설치

```bash
npm ci
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_API_URL=https://tickit-server-production.up.railway.app
```

### 개발 서버 실행

```bash
npm run dev
```

### 테스트 실행

```bash
npm test
```

### 빌드

```bash
npm run build
```

### 데스크톱 앱 패키징

```bash
npm run dist
```

## 릴리즈

Tickit은 GitHub Actions와 electron-builder를 사용해 릴리즈 빌드를 자동화합니다.

`v*` 형식의 태그를 푸시하면 릴리즈 워크플로가 실행됩니다.

```bash
git tag v1.0.1
git push origin v1.0.1
```

릴리즈 워크플로는 다음 순서로 실행됩니다.

- `npm ci`
- `npm test`
- `npm run build`
- macOS / Windows 앱 패키징
- GitHub Release에 빌드 산출물 업로드

릴리즈 빌드에 필요한 `VITE_API_URL`은 GitHub Actions의 Repository Variable로 설정해야 합니다.

## 로드맵

- [x] React 19 기반 프론트엔드 마이그레이션
- [x] Zustand 기반 상태 관리 도입
- [x] 인증 시스템 연동
- [x] 리마인더 / 섹션 CRUD 구현
- [x] GitHub Actions 릴리즈 자동화
- [ ] 오프라인 동기화
- [ ] 자동 업데이트

## 작성자

[soprue](https://github.com/soprue)
