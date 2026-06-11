import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Clock, Calendar, Gamepad2, Plus } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import type { Game } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onAddGame?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  games,
  onAddGame,
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '时间轴', icon: Clock },
    { path: '/calendar', label: '日历', icon: Calendar },
    { path: '/games', label: '游戏管理', icon: Gamepad2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 抽屉内容 */}
      <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#16162a] border-l border-[#2d2d4a] shadow-2xl animate-slide-in-right">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[#2d2d4a]">
          <span className="text-lg font-bold text-[#e2e8f0]">菜单</span>
          <button
            onClick={onClose}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 border-b border-[#2d2d4a]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-300
                      ${isActive(item.path)
                        ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30'
                        : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540]'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 游戏列表 */}
        <div className="p-4 border-b border-[#2d2d4a]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              游戏列表
            </h3>
            <button
              onClick={() => {
                onAddGame?.();
                onClose();
              }}
              className="p-1.5 text-[#64748b] hover:text-[#6366f1] hover:bg-[#252540] rounded transition-colors"
              title="添加游戏"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ul className="space-y-3">
            {games.map((game) => {
              return (
                <li key={game.id}>
                  <div
                    className="flex items-center gap-3 px-3 py-3.5 rounded-lg text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] transition-colors"
                    style={{ borderLeft: `3px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
                  >
                    <GameIcon gameId={game.id} size={32} />
                    <span className="truncate flex-1 font-medium">{game.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {games.length === 0 && (
            <p className="text-xs text-[#64748b] px-3 py-2">
              暂无游戏，点击 + 添加
            </p>
          )}
        </div>

        {/* GitHub链接 */}
        <div className="p-4">
          <a
            href="https://github.com/cmyhj/ChronoRail"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};
