import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Calendar, Gamepad2, Plus, RefreshCw, Check, AlertCircle, Download } from 'lucide-react';
import { GameIcon, gameColors } from '../Common/GameIcon';
import type { Game } from '../../types';

interface SidebarProps {
  games: Game[];
  onAddGame?: () => void;
  onRefreshGame?: (gameId: string) => Promise<boolean>;
  onSyncAll?: () => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  games,
  onAddGame,
  onRefreshGame,
  onSyncAll,
}) => {
  const location = useLocation();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<Record<string, 'success' | 'error'>>({});
  const [syncing, setSyncing] = useState(false);

  const navItems = [
    { path: '/', label: '时间轴', icon: Clock },
    { path: '/calendar', label: '日历', icon: Calendar },
    { path: '/games', label: '游戏管理', icon: Gamepad2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleRefresh = async (gameId: string) => {
    if (!onRefreshGame || refreshingId) return;
    
    setRefreshingId(gameId);
    setRefreshStatus(prev => ({ ...prev, [gameId]: undefined as any }));
    
    try {
      const result = await onRefreshGame(gameId);
      setRefreshStatus(prev => ({ ...prev, [gameId]: result ? 'success' : 'error' }));
    } catch (error) {
      setRefreshStatus(prev => ({ ...prev, [gameId]: 'error' }));
    } finally {
      setRefreshingId(null);
      setTimeout(() => {
        setRefreshStatus(prev => ({ ...prev, [gameId]: undefined as any }));
      }, 3000);
    }
  };

  const handleSyncAll = async () => {
    if (!onSyncAll || syncing) return;
    setSyncing(true);
    try {
      await onSyncAll();
    } finally {
      setSyncing(false);
    }
  };

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
          
          <ul className="space-y-2">
            {games.map((game) => {
              const isRefreshing = refreshingId === game.id;
              const status = refreshStatus[game.id];
              
              return (
                <li key={game.id}>
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] transition-colors"
                    style={{ borderLeft: `3px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
                  >
                    <GameIcon gameId={game.id} size={28} />
                    <span className="truncate flex-1 text-sm">{game.name}</span>
                    
                    {/* 刷新按钮 */}
                    {onRefreshGame && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefresh(game.id);
                        }}
                        disabled={isRefreshing}
                        className={`p-1 rounded transition-colors ${
                          isRefreshing
                            ? 'text-[#6366f1] animate-spin'
                            : status === 'success'
                              ? 'text-[#67c23a]'
                              : status === 'error'
                                ? 'text-[#ef4444]'
                                : 'text-[#64748b] hover:text-[#e2e8f0]'
                        }`}
                        title={isRefreshing ? '获取中...' : status === 'success' ? '已更新' : status === 'error' ? '失败' : '刷新版本'}
                      >
                        {status === 'success' ? (
                          <Check size={14} />
                        ) : status === 'error' ? (
                          <AlertCircle size={14} />
                        ) : (
                          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        )}
                      </button>
                    )}
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

        {/* 一键更新 */}
        <div className="border-t border-[#2d2d4a] pt-4">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              syncing
                ? 'bg-[#6366f1]/20 text-[#6366f1] cursor-wait'
                : 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:from-[#4f46e5] hover:to-[#6366f1] hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
            }`}
          >
            <Download size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? '同步中...' : '一键更新所有版本'}
          </button>
        </div>
      </div>
    </aside>
  );
};
