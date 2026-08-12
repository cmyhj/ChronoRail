import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'bg-transparent border border-line text-fg-2 hover:border-line-strong hover:bg-white/[0.03] hover:text-fg',
  ghost: 'bg-transparent text-fg-2 hover:bg-white/[0.04] hover:text-fg',
  danger:
    'bg-danger/10 border border-danger/20 text-danger hover:bg-danger/15 hover:border-danger/30',
};

const sizeClasses = {
  sm: 'h-7 px-2.5 text-[12px]',
  md: 'h-8 px-3.5 text-[13px]',
  lg: 'h-9 px-4 text-[13px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ink
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 13 : size === 'lg' ? 16 : 14} />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};
