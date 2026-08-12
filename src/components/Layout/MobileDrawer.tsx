import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
import { NAV_ITEMS } from '../../constants/navigation';
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

  const isActive = (path: string) => location.pathname === path;

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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-panel border-l border-line shadow-2xl animate-drawer-in">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <span className="text-sm font-semibold text-fg">导航</span>
          <button
            onClick={onClose}
            className="p-1.5 text-fg-2 hover:text-fg hover:bg-hover rounded-lg transition-colors"
            aria-label="关闭菜单"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.lucideIcon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                      ${isActive(item.path)
                        ? 'bg-white/[0.07] text-fg'
                        : 'text-fg-2 hover:text-fg hover:bg-white/[0.03]'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-3">
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[11px] font-medium text-fg-4 uppercase tracking-wider">
                游戏
              </h3>
              <button
                onClick={() => {
                  onAddGame?.();
                  onClose();
                }}
                className="p-1 text-fg-3 hover:text-accent hover:bg-hover rounded transition-colors"
                title="添加游戏"
              >
                <Plus size={14} />
              </button>
            </div>

            <ul className="space-y-0.5">
              {games.map((game) => (
                <li key={game.id}>
                  <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-fg-2 hover:text-fg hover:bg-white/[0.03] transition-colors">
                    <GameIcon gameId={game.id} size={22} />
                    <span className="truncate flex-1 font-medium text-[13px]">{game.name}</span>
                  </div>
                </li>
              ))}
            </ul>

            {games.length === 0 && (
              <p className="text-xs text-fg-3 px-2 py-2">
                暂无游戏
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-line">
          <a
            href="https://github.com/cmyhj/ChronoRail"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-3 hover:text-fg-2 hover:bg-white/[0.03] rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};
