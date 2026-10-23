import { createContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-custom mb-2 p-3 d-flex align-items-center"
            style={{
              minWidth: 300,
              animation: 'slide-up 0.3s ease-out',
              borderLeft: `4px solid ${
                toast.type === 'success' ? '#10b981' :
                toast.type === 'error' ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#6366f1'
              }`
            }}
          >
            <i className={`fas me-2 ${
              toast.type === 'success' ? 'fa-check-circle text-success' :
              toast.type === 'error' ? 'fa-exclamation-circle text-danger' :
              toast.type === 'warning' ? 'fa-exclamation-triangle text-warning' :
              'fa-info-circle text-primary'
            }`}></i>
            <span className="text-light flex-grow-1 small">{toast.message}</span>
            <button
              className="btn btn-sm btn-link text-secondary p-0 ms-2"
              onClick={() => removeToast(toast.id)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
