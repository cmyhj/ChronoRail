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
      setTimeout(() => setRefreshStatus('idle'), 3000);
    }
  };

  return (
    <div className="relative bg-[#12122a] rounded-2xl border border-[#1e1e3a] overflow-hidden hover:border-[#2d2d50] transition-all duration-300 group">
      {/* 顶部渐变条 */}
      <div 
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
      />
      
      {/* 卡片内容 */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4 mb-4">
          <div className="relative">
            <div 
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}
            >
              <GameIcon gameId={game.id} size={36} />
            </div>
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#12122a] flex items-center justify-center"
              style={{ backgroundColor: game.autoFetch ? '#10b981' : '#f59e0b' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-[#e2e8f0] truncate mb-1">
              {game.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                game.autoFetch 
                  ? 'bg-[#10b981]/15 text-[#10b981]' 
                  : 'bg-[#f59e0b]/15 text-[#f59e0b]'
              }`}>
                {game.autoFetch ? '自动同步' : '手动管理'}
              </span>
            </div>
          </div>
        </div>

        {/* 刷新状态提示 */}
        {refreshStatus !== 'idle' && (
          <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs mb-3 ${
            refreshStatus === 'success' 
              ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' 
              : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
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
        <p className="text-[10px] md:text-xs text-[#4a4a6a]">
          创建于 {new Date(game.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 md:px-5 py-3 md:py-4 bg-[#0e0e20] border-t border-[#1e1e3a] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-[#64748b] hover:text-[#818cf8] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
            title="编辑"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {onRefreshVersions && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
              refreshing
                ? 'text-[#818cf8] bg-[#818cf8]/10 cursor-wait'
                : refreshStatus === 'success'
                  ? 'text-[#10b981] bg-[#10b981]/10'
                  : refreshStatus === 'error'
                    ? 'text-[#ef4444] bg-[#ef4444]/10'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35]'
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
