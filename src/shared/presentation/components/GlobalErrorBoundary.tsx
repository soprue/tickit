import React, { Component, ErrorInfo, ReactNode } from 'react';

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
class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수 있습니다.
    console.error('[Presentation] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // 앱 상태를 초기화하거나 새로고침을 시도합니다.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={fallbackStyle}>
          <div style={contentStyle}>
            <h1 style={titleStyle}>앗! 오류가 발생했습니다.</h1>
            <p style={descStyle}>
              죄송합니다. 예상치 못한 문제가 발생하여 화면을 표시할 수 없습니다.
            </p>
            {this.state.error && (
              <pre style={errorDetailStyle}>
                {this.state.error.message}
              </pre>
            )}
            <button onClick={this.handleReset} style={buttonStyle}>
              앱 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 간단한 인라인 스타일 (CSS 모듈이 준비되기 전까지 임시 사용)
const fallbackStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  color: '#212529',
  padding: '20px',
  boxSizing: 'border-box',
};

const contentStyle: React.CSSProperties = {
  maxWidth: '500px',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
};

const descStyle: React.CSSProperties = {
  marginBottom: '2rem',
  lineHeight: '1.5',
};

const errorDetailStyle: React.CSSProperties = {
  backgroundColor: '#f1f3f5',
  padding: '1rem',
  borderRadius: '8px',
  fontSize: '0.8rem',
  textAlign: 'left',
  marginBottom: '2rem',
  overflowX: 'auto',
  color: '#e03131',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '1rem',
  backgroundColor: '#339af0',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default GlobalErrorBoundary;
