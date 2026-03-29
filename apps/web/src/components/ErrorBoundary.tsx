import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo): void => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      console.log('Error report (would send to Sentry in production):', errorReport);
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  };

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleGoHome = (): void => {
    this.resetError();
    window.location.hash = '';
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-5 animate-fadeIn">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl shadow-black/50">
            <div className="text-6xl mb-5">😵</div>
            <h3 className="text-white font-semibold text-xl mb-3">出错了</h3>
            <p className="text-[#888888] text-sm mb-6 leading-relaxed">
              {this.state.error?.message || '页面发生了未知错误，请稍后重试'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mb-6 text-left">
                <summary className="text-[#666666] text-xs cursor-pointer hover:text-white transition-colors mb-2">
                  查看错误详情
                </summary>
                <pre className="bg-[#1A1A1A] rounded-xl p-3 text-[10px] text-red-400 overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-gradient-to-r from-primary to-[#4096ff] text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-lg shadow-primary/20"
              >
                重试
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-[#1A1A1A] text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 hover:bg-[#252525] active:scale-[0.97] border border-white/5"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
