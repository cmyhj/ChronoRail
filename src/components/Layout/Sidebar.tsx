import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, RefreshCw, Check, AlertCircle, Download } from 'lucide-react';
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
    { path: '/', label: '时间轴', icon: '📅' },
    { path: '/calendar', label: '日历', icon: '🗓️' },
    { path: '/games', label: '游戏管理', icon: '🎮' },
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
    <aside className="w-64 bg-[#0e0e20] border-r border-[#1e1e3a] h-full overflow-y-auto">
      <div className="p-4">
        {/* 导航菜单 */}
        <nav className="mb-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#818cf8]/10 text-[#818cf8] border border-[#6366f1]/30 shadow-lg shadow-[#6366f1]/10'
                        : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35]'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 游戏列表 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              游戏列表
            </h3>
            <button
              onClick={onAddGame}
              className="p-1.5 text-[#64748b] hover:text-[#6366f1] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
              title="添加游戏"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ul className="space-y-2">
            {games.map((game) => {
              const isRefreshing = refreshingId === game.id;
              const status = refreshStatus[game.id];
              
              return (
                <li key={game.id}>
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 hover:bg-[#1a1a35] group cursor-pointer"
                    style={{ borderLeft: `3px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
                  >
                    <div className="relative">
                      <GameIcon gameId={game.id} size={32} />
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e20]"
                        style={{ backgroundColor: game.autoFetch ? '#10b981' : '#f59e0b' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="truncate font-medium text-[#e2e8f0] block text-sm">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {game.autoFetch ? '自动同步' : '手动管理'}
                      </span>
                    </div>
                    
                    {/* 刷新按钮 */}
                    {onRefreshGame && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefresh(game.id);
                        }}
                        disabled={isRefreshing}
                        className={`p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                          isRefreshing
                            ? 'text-[#6366f1] opacity-100'
                            : status === 'success'
                              ? 'text-[#10b981] opacity-100'
                              : status === 'error'
                                ? 'text-[#ef4444] opacity-100'
                                : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#252540]'
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
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#1a1a35] rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-xs text-[#64748b]">
                暂无游戏，点击 + 添加
              </p>
            </div>
          )}
        </div>

        {/* 一键更新 */}
        <div className="border-t border-[#1e1e3a] pt-4">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              syncing
                ? 'bg-[#6366f1]/20 text-[#6366f1] cursor-wait'
                : 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:from-[#4f46e5] hover:to-[#6366f1] shadow-lg shadow-[#6366f1]/25 hover:shadow-[#6366f1]/40 hover:-translate-y-0.5'
            }`}
          >
            <Download size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? '同步中...' : '一键更新所有版本'}
          </button>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 pt-4 border-t border-[#1e1e3a]">
          <div className="text-center">
            <p className="text-[10px] text-[#64748b]">
              共 {games.length} 个游戏
            </p>
            <p className="text-[10px] text-[#4a4a6a] mt-1">
              数据每日自动更新
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
