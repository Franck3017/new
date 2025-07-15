'use client';

import { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = (): NotificationContextType => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, [removeNotification]);

  const showSuccess = useCallback((title: string, message: string, duration = 5000) => {
    addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration = 7000) => {
    addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration = 5000) => {
    addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration = 6000) => {
    addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
  };
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove?: (id: string) => void;
}

export const NotificationContainer = memo<NotificationContainerProps>(({ 
  notifications, 
  onRemove 
}) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <FiCheck className="h-5 w-5" />;
      case 'error':
        return <FiAlertCircle className="h-5 w-5" />;
      case 'warning':
        return <FiAlertCircle className="h-5 w-5" />;
      case 'info':
        return <FiInfo className="h-5 w-5" />;
      default:
        return <FiInfo className="h-5 w-5" />;
    }
  };

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400 text-white';
      case 'error':
        return 'bg-red-500/90 border-red-400 text-white';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400 text-white';
      case 'info':
        return 'bg-blue-500/90 border-blue-400 text-white';
      default:
        return 'bg-gray-500/90 border-gray-400 text-white';
    }
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getStyles(notification.type)}
            backdrop-blur-sm border rounded-lg p-4 shadow-lg
            transform transition-all duration-300 ease-out
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => {
                if (onRemove) {
                  onRemove(notification.id);
                }
              }}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
              aria-label="Cerrar notificación"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

// Hook personalizado para usar notificaciones en cualquier componente
export const useNotificationContext = (): NotificationContextType => {
  return useNotifications();
}; 