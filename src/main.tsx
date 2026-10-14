import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  handleRestore = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      }
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    try {
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        } else {
          window.location.reload();
        }
      }
    } catch (e) {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#FFD700',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '24px',
            padding: '36px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.05em', marginBottom: '8px', color: '#FFD700', textTransform: 'uppercase' }}>
              GOYE SERVICES HUB
            </h1>
            <p style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '20px', lineHeight: '1.6', fontWeight: '500' }}>
              Click below to reset session cache and restore the application view.
            </p>

            {this.state.error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '12px',
                color: '#ff8888',
                fontSize: '11px',
                textAlign: 'left',
                maxHeight: '120px',
                overflowY: 'auto',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleRestore}
              style={{
                backgroundColor: '#FFD700',
                color: '#000000',
                fontWeight: '900',
                fontSize: '12px',
                padding: '14px 28px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)'
              }}
            >
              RESTORE PREVIEW & REFRESH
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
