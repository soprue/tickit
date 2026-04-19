# Style & UI Rules

이 문서는 프로젝트 내 스타일 구성 및 클래스 네이밍을 정의합니다.

## 1. CSS 아키텍처 (src/styles/style.css)
- 공통 스타일은 `src/styles/style.css`에서 정의합니다.
- 컴포넌트별 전용 스타일은 해당 컴포넌트 파일 상단에 주석으로 남기거나 CSS 파일에 별도 주석 섹션으로 구분합니다.

## 2. BEM 네이밍 규칙
- 클래스명은 **Block__Element--Modifier** 방식을 권장합니다.
  - 블록: `.reminder-item`
  - 요소: `.reminder-item__title`
  - 수식어: `.reminder-item--completed`

## 3. 리소스 처리
- 아이콘이나 이미지는 가능한 SVG 또는 `public/` (또는 설정된 경로) 리소스를 활용합니다.
- 동적 이미지는 `base64` 인코딩을 지양하고 파일 경로를 활용합니다.
