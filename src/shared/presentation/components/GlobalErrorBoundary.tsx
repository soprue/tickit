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
        <div className="bg-bg text-text-primary scroll-none box-border flex h-screen w-screen items-center justify-center p-5 select-none">
          <div className="animate-in fade-in zoom-in max-w-[500px] text-center duration-300">
            <h1 className="mb-4 text-[2rem] font-black tracking-tight">앗! 오류가 발생했습니다.</h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              죄송합니다. 예상치 못한 문제가 발생하여 화면을 표시할 수 없습니다.
            </p>
            {this.state.error && (
              <pre className="mb-8 max-h-[200px] overflow-auto rounded-xl border border-red-500/20 bg-white/50 p-4 text-left text-[0.8rem] break-words whitespace-pre-wrap text-red-500 backdrop-blur-sm dark:bg-black/50">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="bg-primary shadow-primary/20 cursor-pointer rounded-xl border-none px-6 py-3 text-[1rem] font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
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
