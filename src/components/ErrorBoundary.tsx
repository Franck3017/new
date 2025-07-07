'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const isApiError = error?.message?.includes('API') || error?.message?.includes('fetch');
      const isNetworkError = error?.message?.includes('conexión') || error?.message?.includes('network');

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              {/* Icono de error */}
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAlertTriangle className="h-8 w-8 text-red-400" />
              </div>

              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {isApiError ? 'Error de API' : 'Algo salió mal'}
              </h1>

              {/* Mensaje de error */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                {isApiError && isNetworkError ? (
                  'Parece que hay un problema con tu conexión a internet. Verifica tu conexión e inténtalo de nuevo.'
                ) : isApiError ? (
                  'Hubo un problema al cargar los datos. Esto puede ser temporal, inténtalo de nuevo.'
                ) : (
                  'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.'
                )}
              </p>

              {/* Detalles técnicos (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
                    Detalles técnicos
                  </summary>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400 font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Intentar de nuevo
                </button>
                
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  <FiHome className="h-4 w-4" />
                  Ir al inicio
                </Link>
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <p className="text-xs text-gray-500">
                  Si el problema persiste, contacta con soporte técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para manejar errores en componentes funcionales
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    
    // Por ahora, solo lo mostramos en consola
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Context:', context);
      console.groupEnd();
    }
  };

  return { handleError };
};

// Componente para mostrar errores específicos de API
export const APIErrorDisplay = ({ error, onRetry }: { error: Error; onRetry?: () => void }) => {
  const isNetworkError = error.message.includes('conexión') || error.message.includes('network');
  const isAuthError = error.message.includes('API key') || error.message.includes('401');
  const isRateLimitError = error.message.includes('429') || error.message.includes('Demasiadas peticiones');

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-400 mb-1">
            {isAuthError ? 'Error de autenticación' : 
             isRateLimitError ? 'Demasiadas peticiones' :
             isNetworkError ? 'Error de conexión' : 'Error de API'}
          </h3>
          <p className="text-red-300 text-sm mb-3">
            {error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
            >
              <FiRefreshCw className="h-3 w-3" />
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};