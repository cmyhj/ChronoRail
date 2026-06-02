import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, RefreshCw } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface HeaderProps {
  onMenuToggle?: () => void;
  onSyncAll?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onSyncAll }) => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const [syncing, setSyncing] = useState(false);

  const navItems = [
    { path: '/', label: '时间轴', icon: '📅' },
    { path: '/calendar', label: '日历', icon: '🗓️' },
    { path: '/games', label: '游戏管理', icon: '🎮' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSync = async () => {
    if (!onSyncAll || syncing) return;
    setSyncing(true);
    try {
      await onSyncAll();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#1e1e3a]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#6366f1] to-[#818cf8] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/20 group-hover:shadow-[#6366f1]/40 transition-shadow">
                <span className="text-white font-bold text-xs md:text-sm">CR</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#6366f1] to-[#818cf8] rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
            </div>
            <span className="text-base md:text-lg font-bold text-gradient hidden sm:block">
              ChronoRail
            </span>
          </Link>

          {/* 桌面端导航 */}
          {!isMobile && (
            <nav className="flex items-center gap-1 bg-[#0e0e20] rounded-xl p-1 border border-[#1e1e3a]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white shadow-lg shadow-[#6366f1]/20'
                      : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35]'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            {/* 一键更新按钮 */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                syncing
                  ? 'bg-[#6366f1]/20 text-[#6366f1] cursor-wait'
                  : 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:from-[#4f46e5] hover:to-[#6366f1] shadow-lg shadow-[#6366f1]/25 hover:shadow-[#6366f1]/40 hover:-translate-y-0.5'
              }`}
              title="一键更新所有游戏版本"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{syncing ? '同步中...' : '一键更新'}</span>
              {!syncing && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
              )}
            </button>
            
            <a
              href="https://github.com/cmyhj/ChronoRail"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35] rounded-xl transition-all duration-200"
              title="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35] rounded-xl transition-all duration-200"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
