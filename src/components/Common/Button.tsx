import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

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
  const disabledState = disabled || loading;

  // primary: Aceternity 风格渐变发光边框（Lit up borders）
  if (variant === 'primary') {
    return (
      <button
        className={`
          relative p-px rounded-lg font-medium group
          ${sizeClasses[size]}
          ${disabledState ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ink
          ${className}
        `}
        disabled={disabledState}
        {...props}
      >
        {/* 渐变发光层：未悬浮时暗，hover 时亮起 */}
        <div
          className="absolute inset-0 rounded-lg transition-opacity duration-200 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-40 group-hover:opacity-100"
        />
        {/* 内层：hover 时变透明露出渐变 */}
        <div
          className={`
            relative bg-ink rounded-[7px] transition-all duration-200 text-white
            flex items-center justify-center gap-1.5 h-full
            ${disabledState ? '' : 'group-hover:bg-transparent group-hover:text-black'}
          `}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={size === 'sm' ? 13 : size === 'lg' ? 16 : 14} />
          ) : icon ? (
            icon
          ) : null}
          {children}
        </div>
      </button>
    );
  }

  const variantClasses = {
    secondary:
      'bg-transparent border border-line text-fg-2 hover:border-line-strong hover:bg-white/[0.03] hover:text-fg',
    ghost: 'bg-transparent text-fg-2 hover:bg-white/[0.04] hover:text-fg',
    danger:
      'bg-danger/10 border border-danger/20 text-danger hover:bg-danger/15 hover:border-danger/30',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledState ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ink
        ${className}
      `}
      disabled={disabledState}
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
