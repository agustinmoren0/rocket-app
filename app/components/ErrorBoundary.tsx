'use client'

import React, { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#FFF5F0]">
          <div className="max-w-md w-full mx-4 p-8 rounded-3xl bg-white border border-[#FFB4A8]/20 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#FF8C66]/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-[#FF8C66]" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-[#3D2C28] mb-3">
              Oops, algo salió mal
            </h1>

            <p className="text-center text-[#6B9B9E] mb-6">
              Encontramos un error inesperado. No te preocupes, nuestro equipo ha sido notificado. Intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-h-32 overflow-auto">
                <p className="text-xs font-mono text-red-800 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar página
            </button>

            <p className="text-xs text-[#A67B6B] text-center mt-4">
              Si el problema persiste, intenta limpiar el caché desde tu perfil.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
