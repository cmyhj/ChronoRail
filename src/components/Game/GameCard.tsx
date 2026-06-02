import React from 'react';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { GameIcon, gameColors } from '../Common/GameIcon';
import type { Game } from '../../types';

interface GameCardProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  onRefreshVersions?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onEdit,
  onDelete,
  onRefreshVersions,
}) => {
  const color = game.color || gameColors[game.id] || '#6366f1';

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
            onClick={onRefreshVersions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            刷新版本
          </button>
        )}
      </div>
    </div>
  );
};
