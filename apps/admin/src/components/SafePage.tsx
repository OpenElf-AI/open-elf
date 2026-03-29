import React from 'react';

interface SafePageProps {
  children: React.ReactNode;
  pageName: string;
}

interface SafePageState {
  hasError: boolean;
  error: any;
}

class SafePage extends React.Component<SafePageProps, SafePageState> {
  constructor(props: SafePageProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`SafePage [${this.props.pageName}] error details:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ color: '#ff4d4f', marginBottom: 16 }}>
            {this.props.pageName} 页面加载失败
          </h2>
          <div style={{ background: '#fff2f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SafePage;
