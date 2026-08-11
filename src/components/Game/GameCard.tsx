import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import type { Game } from '../../types';

interface GameCardProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onEdit,
  onDelete,
  className = '',
  style,
}) => {
  const color = game.color || gameColors[game.id] || '#6366f1';

  return (
    <div
      className={`relative bg-card rounded-xl border border-line overflow-hidden hover:border-line-strong transition-colors duration-150 group ${className}`}
      style={style}
    >
      {/* 顶部色条 */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: `${color}60` }}
      />
      
      {/* 卡片内容 */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <GameIcon gameId={game.id} size={32} />
            </div>
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center"
              style={{ backgroundColor: game.autoFetch ? '#34d399' : '#fbbf24' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-fg truncate mb-1">
              {game.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                game.autoFetch 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                {game.autoFetch ? '自动同步' : '手动管理'}
              </span>
            </div>
          </div>
        </div>

        {/* 创建时间 */}
        <p className="text-[10px] text-fg-4">
          创建于 {new Date(game.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 py-3 bg-panel border-t border-line flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-fg-3 hover:text-info hover:bg-hover rounded-lg transition-colors duration-150"
          title="编辑"
          aria-label="编辑游戏"
        >
          <Edit size={16} />
        </button>
        
        <button
          onClick={onDelete}
          className="p-2 text-fg-3 hover:text-danger hover:bg-hover rounded-lg transition-colors duration-150"
          title="删除"
          aria-label="删除游戏"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
