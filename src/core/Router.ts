import { Component, ComponentProps } from './Component';

export class Router {
  private static instance: Router;
  private routes: Record<
    string,
    new (target: HTMLElement, props: any) => Component<any, any>
  > = {};
  private currentPage: Component<any, any> | null = null;

  private constructor() {
    // Hash 변경 감지
    window.addEventListener('hashchange', this.resolve.bind(this));
    // 초기 로드 시 실행
    window.addEventListener('load', this.resolve.bind(this));
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  public add(
    path: string,
    page: new (target: HTMLElement, props: any) => Component<any, any>
  ) {
    this.routes[path] = page as any;
  }

  public resolve() {
    // #/login -> /login 형식으로 추출
    let hash = window.location.hash.replace(/^#/, '') || '/';
    
    const route = this.routes[hash] || this.routes['/'];

    if (route) {
      const target = document.getElementById('root');
      if (target) {
        // 1. 기존 페이지 언마운트
        if (this.currentPage) {
          this.currentPage.unmount();
        }

        // 2. 새 페이지 생성
        this.currentPage = new route(target, {});
      }
    } else {
      console.error('[Router] Route not found for:', hash);
    }
  }

  public navigate(path: string) {
    // 해시를 변경하면 hashchange 이벤트가 발생하여 resolve가 실행됨
    window.location.hash = path;
  }
}
