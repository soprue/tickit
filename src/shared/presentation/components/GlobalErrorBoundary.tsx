import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리 컴포넌트
 * 렌더링 도중 발생하는 예상치 못한 에러를 포착하여 화이트 스크린을 방지합니다.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Presentation] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-bg text-text-primary p-5 box-border scroll-none select-none">
          <div className="max-w-[500px] text-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-[2rem] mb-4 font-black tracking-tight">앗! 오류가 발생했습니다.</h1>
            <p className="mb-8 leading-relaxed text-text-secondary">
              죄송합니다. 예상치 못한 문제가 발생하여 화면을 표시할 수 없습니다.
            </p>
            {this.state.error && (
              <pre className="bg-white/50 dark:bg-black/50 p-4 rounded-xl text-[0.8rem] text-left mb-8 overflow-x-auto text-red-500 border border-red-500/20 backdrop-blur-sm">
                {this.state.error.message}
              </pre>
            )}
            <button 
              onClick={this.handleReset} 
              className="px-6 py-3 text-[1rem] bg-primary text-white border-none rounded-xl cursor-pointer hover:brightness-110 active:scale-95 transition-all font-bold shadow-lg shadow-primary/20"
            >
              앱 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
