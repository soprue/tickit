# Framework Core Rules

이 문서는 `src/core` 하위의 프레임워크 핵심 요소를 사용하는 방법을 정의합니다.

## 1. Component (Component.ts)
- 모든 UI 요소는 `Component`를 상속받은 클래스여야 합니다.
- **생명주기(Lifecycle)**:
  - `componentWillMount`: 렌더링 전 초기화.
  - `render`: JSX를 활용해 UI 반환 (반드시 구현).
  - `componentDidMount`: DOM 삽입 후 실행 (이벤트 바인딩, API 호출 등).
  - `setState`: 상태를 변경하며, 비동기(Promise)로 동작함을 유의하십시오.

## 2. JSX (JSX.ts)
- 이 프로젝트의 JSX는 **태그 함수(Tagged Template Literal)** 방식입니다. 
- 예시: `jsx`<div>Hello ${this.props.name}</div>``
- **이벤트 바인딩**: `on` 접두어를 사용하여 인라인으로 전달합니다. 
  - 예: `jsx`<button onclick="${this.handleClick.bind(this)}">클릭</button>``
- 주의: 일반적인 React JSX(`<div>...</div>`) 문법이 아니므로 반드시 `jsx` 백틱 기호를 사용하십시오.

## 3. Router (Router.ts)
- 페이지 이동은 `Router.getInstance().navigate(path)`를 사용합니다.
- 새로운 페이지를 추가할 때는 `Router.add(path, PageClass)`를 통해 등록합니다.
- `window.location.href`를 직접 수정하지 마십시오.
