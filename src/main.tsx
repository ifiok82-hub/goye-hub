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
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
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
            maxWidth: '480px',
            backgroundColor: '#0A1931',
            border: '1px solid #D4AF37',
            borderRadius: '24px',
            padding: '36px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.05em', marginBottom: '12px', color: '#FFD700', textTransform: 'uppercase' }}>
              GOYE SERVICES HUB
            </h1>
            <p style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '24px', lineHeight: '1.6', fontWeight: '500' }}>
              Preview recovered from transient session interruption. Tap below to reload the live application.
            </p>
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
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
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
