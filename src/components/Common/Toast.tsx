import React from 'react';
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
    bg: 'bg-[#67c23a]/10',
    border: 'border-[#67c23a]/30',
    text: 'text-[#67c23a]',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[#ef4444]/10',
    border: 'border-[#ef4444]/30',
    text: 'text-[#ef4444]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#6366f1]/10',
    border: 'border-[#6366f1]/30',
    text: 'text-[#6366f1]',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} shadow-lg`}>
        <Icon size={18} className={config.text} />
        <span className="text-sm text-[#e2e8f0]">{message}</span>
        <button
          onClick={onClose}
          className="p-1 text-[#64748b] hover:text-[#e2e8f0] transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
