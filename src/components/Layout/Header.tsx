import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Settings } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { path: '/', label: '时间轴' },
    { path: '/calendar', label: '日历' },
    { path: '/games', label: '游戏管理' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f23]/95 backdrop-blur-md border-b border-[#2d2d4a]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#818cf8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <span className="text-lg font-bold text-[#e2e8f0] hidden sm:block">
              ChronoRail
            </span>
          </Link>

          {/* 桌面端导航 */}
          {!isMobile && (
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${isActive(item.path)
                      ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30'
                      : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540]'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
              title="设置"
            >
              <Settings size={20} />
            </button>
            
            <a
              href="https://github.com/cmyhj/ChronoRail"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
              title="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
              >
                {onMenuToggle ? <Menu size={20} /> : null}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="absolute top-full right-4 mt-2 w-64 bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl shadow-2xl p-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">设置</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors">
              GitHub 同步配置
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors">
              导出数据
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors">
              导入数据
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
