import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    text: 'text-danger',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-toast-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border} shadow-2xl backdrop-blur-sm`}>
        <Icon size={18} className={config.text} />
        <span className="text-sm text-fg font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 text-fg-3 hover:text-fg transition-colors rounded-md hover:bg-white/10"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
