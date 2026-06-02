import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Calendar, Gamepad2, Plus, RefreshCw } from 'lucide-react';
import { GameIcon, gameColors } from '../Common/GameIcon';
import type { Game } from '../../types';

interface SidebarProps {
  games: Game[];
  onAddGame?: () => void;
  onRefreshVersions?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  games,
  onAddGame,
  onRefreshVersions,
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '时间轴', icon: Clock },
    { path: '/calendar', label: '日历', icon: Calendar },
    { path: '/games', label: '游戏管理', icon: Gamepad2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#16162a] border-r border-[#2d2d4a] h-full overflow-y-auto">
      <div className="p-4">
        {/* 导航菜单 */}
        <nav className="mb-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive(item.path)
                        ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30'
                        : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540]'
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

        {/* 游戏列表 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              游戏列表
            </h3>
            <button
              onClick={onAddGame}
              className="p-1 text-[#64748b] hover:text-[#6366f1] hover:bg-[#252540] rounded transition-colors"
              title="添加游戏"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <ul className="space-y-1">
            {games.map((game) => (
              <li key={game.id}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] transition-colors cursor-pointer"
                  style={{ borderLeft: `3px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
                >
                  <GameIcon gameId={game.id} size={18} />
                  <span className="truncate">{game.name}</span>
                </div>
              </li>
            ))}
          </ul>

          {games.length === 0 && (
            <p className="text-xs text-[#64748b] px-3 py-2">
              暂无游戏，点击 + 添加
            </p>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="border-t border-[#2d2d4a] pt-4">
          <button
            onClick={onRefreshVersions}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            刷新版本数据
          </button>
        </div>
      </div>
    </aside>
  );
};
