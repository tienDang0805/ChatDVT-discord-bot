import React from 'react';
import { CornerUpLeft } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0d1117] px-6 py-12 transition-colors">
        <style>{`
          @keyframes errorShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
          @keyframes errorFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          .error-icon{animation:errorShake .6s ease-in-out}
          .error-content{animation:errorFadeUp .5s ease-out .2s both}
        `}</style>

        <div className="text-center max-w-md">
          <div className="error-icon text-7xl mb-6">💥</div>

          <div className="error-content">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3">
              Ối! Có lỗi xảy ra
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
              Trang này gặp sự cố không mong muốn. Bạn có thể thử tải lại hoặc quay về trang chủ.
            </p>

            {this.state.error && (
              <div className="mt-4 mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-left">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                🔄 Thử lại
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:border-orange-500/50 transition-all active:scale-95"
              >
                <CornerUpLeft size={16} /> Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
