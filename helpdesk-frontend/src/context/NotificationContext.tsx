import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, XCircle, X, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300 ${
              n.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' :
              n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-900' :
              n.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-900' :
              'bg-blue-50/90 border-blue-200 text-blue-900'
            }`}
          >
            <div className="mt-0.5">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {n.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{n.title}</p>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}
