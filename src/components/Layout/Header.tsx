import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';
import { NAV_ITEMS } from '../../constants/navigation';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { isMobile } = useResponsive();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass-header sticky top-0 z-40 border-b border-line">
      <div className="flex items-center h-12 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-6 group">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <span className="text-white font-bold text-[10px] tracking-tight">CR</span>
          </div>
          <span className="text-sm font-bold text-fg hidden sm:block tracking-tight">
            ChronoRail
          </span>
        </Link>

        {/* Desktop horizontal tabs */}
        {!isMobile && (
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.lucideIcon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150
                    ${active
                      ? 'bg-white/[0.07] text-fg'
                      : 'text-fg-3 hover:text-fg-2 hover:bg-white/[0.03]'
                    }
                  `}
                >
                  <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />

        {/* GitHub link */}
        <a
          href="https://github.com/cmyhj/ChronoRail"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-fg-3 hover:text-fg-2 hover:bg-white/[0.04] rounded-lg transition-colors duration-150"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>

        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={onMenuToggle}
            className="ml-2 p-1.5 text-fg-2 hover:text-fg hover:bg-white/[0.05] rounded-lg transition-colors duration-150"
            aria-label="打开菜单"
          >
            <Menu size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
