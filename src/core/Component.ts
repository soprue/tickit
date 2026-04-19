import { updateDOM, VNodeChild } from './JSX';
import { Store } from './Store';

export interface ComponentProps {
  [key: string]: unknown;
}

export type ComponentState = object;

/**
 * 프레임워크의 모든 UI 컴포넌트가 상속받는 최상위 베이스 클래스입니다.
 */
export class Component<
  P extends ComponentProps = ComponentProps,
  S extends ComponentState = ComponentState
> {
  protected target: HTMLElement;
  protected props: P;
  protected state: S;
  private oldVNode: VNodeChild;
  private unsubs: (() => void)[] = [];
  private eventHandlers: Array<{ eventType: string; handler: (event: Event) => void; useCapture: boolean }> = [];

  // 렌더링 큐 관리를 위한 변수
  private isQueued = false;

  constructor(target: HTMLElement, props: P) {
    this.target = target;
    this.props = props;
    this.state = {} as S;

    this.init();
    this.componentWillMount();
    this.mount();
    this.setEvent();
    this.componentDidMount();
  }

  init() {}
  setEvent() {}

  addEvent(eventType: string, selector: string, callback: Function, useCapture = false) {
    const handler = (event: Event) => {
      const target = event.target as HTMLElement;
      const closest = target.closest(selector);
      if (closest) callback(event);
    };
    this.target.addEventListener(eventType, handler, useCapture);
    this.eventHandlers.push({ eventType, handler, useCapture });
  }

  subscribe(store: Store<any>) {
    const unsub = store.subscribe(() => {
      this.setState({} as Partial<S>);
    });
    this.unsubs.push(unsub);
  }

  /**
   * 상태를 업데이트하고 렌더링을 큐에 등록합니다. (Batch Update)
   */
  setState(newState: Partial<S>, callback?: () => void) {
    this.state = { ...this.state, ...newState };

    if (this.isQueued) return; // 이미 큐에 대기 중이면 중복 등록 방지

    this.isQueued = true;
    
    // 브라우저의 다음 프레임에 렌더링 수행
    requestAnimationFrame(() => {
      this.performUpdate();
      this.isQueued = false;
      if (callback) callback();
    });
  }

  /**
   * 실제 DOM 업데이트 수행
   */
  private performUpdate() {
    this.componentWillUpdate();

    const newVNode = this.render();
    if (newVNode) {
      updateDOM(this.target, newVNode, this.oldVNode);
      this.oldVNode = newVNode;
    }

    this.componentDidUpdate();
  }

  unmount() {
    this.componentWillUnmount();
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.eventHandlers.forEach(({ eventType, handler, useCapture }) => {
      this.target.removeEventListener(eventType, handler, useCapture);
    });
    this.eventHandlers = [];
    this.target.innerHTML = '';
  }

  private mount() {
    this.target.innerHTML = '';
    const newVNode = this.render();
    if (newVNode) {
      updateDOM(this.target, newVNode, undefined);
      this.oldVNode = newVNode;
    }
  }

  render(): VNodeChild { return null; }

  /* Lifecycle Hooks */
  componentWillMount() {}
  componentDidMount() {}
  componentWillUpdate() {}
  componentDidUpdate() {}
  componentWillUnmount() {}
}
