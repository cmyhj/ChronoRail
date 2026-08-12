import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm animate-overlay-in">
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} bg-panel border border-line md:rounded-xl shadow-2xl animate-modal-in md:max-h-[85vh] max-h-[90vh] rounded-t-xl md:rounded-t-xl`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-panel z-10">
          <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-fg-3 hover:text-fg hover:bg-white/[0.05] rounded-md transition-colors"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 52px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
