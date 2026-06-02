import React, { useState } from 'react';
import { Edit, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { GameIcon, gameColors } from '../Common/GameIcon';
import type { Game } from '../../types';

interface GameCardProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  onRefreshVersions?: () => Promise<boolean>;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onEdit,
  onDelete,
  onRefreshVersions,
}) => {
  const color = game.color || gameColors[game.id] || '#6366f1';
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRefresh = async () => {
    if (!onRefreshVersions || refreshing) return;
    
    setRefreshing(true);
    setRefreshStatus('idle');
    
    try {
      const result = await onRefreshVersions();
      setRefreshStatus(result ? 'success' : 'error');
    } catch (error) {
      setRefreshStatus('error');
    } finally {
      setRefreshing(false);
      // 3秒后清除状态
      setTimeout(() => setRefreshStatus('idle'), 3000);
    }
  };

  return (
    <div
      className="bg-[#1a1a2e] rounded-xl border border-[#2d2d4a] overflow-hidden hover:border-[#6366f1]/30 transition-all duration-300 group"
      style={{ borderTopColor: color, borderTopWidth: '3px' }}
    >
      {/* 卡片头部 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <GameIcon gameId={game.id} size={28} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e2e8f0]">
                {game.name}
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {game.autoFetch ? '自动获取' : '手动输入'}
                {game.fetchSource === 'mihoyo' && ' · 米哈游API'}
              </p>
            </div>
          </div>
        </div>

        {/* 状态指示 */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: game.autoFetch ? '#67c23a' : '#e6a23c' }}
          />
          <span className="text-xs text-[#94a3b8]">
            {game.autoFetch ? '自动同步中' : '手动管理模式'}
          </span>
        </div>

        {/* 刷新状态提示 */}
        {refreshStatus !== 'idle' && (
          <div className={`flex items-center gap-2 p-2 rounded-lg text-xs mb-3 ${
            refreshStatus === 'success' 
              ? 'bg-[#67c23a]/10 text-[#67c23a]' 
              : 'bg-[#ef4444]/10 text-[#ef4444]'
          }`}>
            {refreshStatus === 'success' ? (
              <>
                <Check size={14} />
                <span>版本数据已更新</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                <span>获取失败，请稍后重试</span>
              </>
            )}
          </div>
        )}

        {/* 创建时间 */}
        <p className="text-xs text-[#64748b]">
          创建于: {new Date(game.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 py-3 bg-[#16162a] border-t border-[#2d2d4a] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-[#64748b] hover:text-[#6366f1] hover:bg-[#252540] rounded-lg transition-colors"
            title="编辑"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#252540] rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {game.autoFetch && onRefreshVersions && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
              refreshing
                ? 'text-[#6366f1] bg-[#6366f1]/10 cursor-wait'
                : refreshStatus === 'success'
                  ? 'text-[#67c23a] bg-[#67c23a]/10'
                  : refreshStatus === 'error'
                    ? 'text-[#ef4444] bg-[#ef4444]/10'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540]'
            }`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? '获取中...' : refreshStatus === 'success' ? '已更新' : refreshStatus === 'error' ? '失败' : '刷新版本'}
          </button>
        )}
      </div>
    </div>
  );
};
