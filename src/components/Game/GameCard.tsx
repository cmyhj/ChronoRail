import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import { CardSpotlight } from '../ui/card-spotlight';
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
    <CardSpotlight
      color={color}
      className={`group/spotlight relative bg-card/60 backdrop-blur-xl rounded-xl border border-line overflow-hidden hover:border-line-strong transition-all duration-200 ${className}`}
      style={style}
    >
      <div className="p-4 relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}12` }}
            >
              <GameIcon gameId={game.id} size={28} />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card flex items-center justify-center"
              style={{ backgroundColor: game.autoFetch ? '#34d399' : '#fbbf24' }}
            >
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-fg truncate mb-1">
              {game.name}
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              game.autoFetch
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning'
            }`}>
              {game.autoFetch ? '自动同步' : '手动管理'}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-fg-4">
          创建于 {new Date(game.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      <div className="px-3 py-2 bg-elevated/50 border-t border-line flex items-center gap-0.5 opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-150 relative z-10">
        <button
          onClick={onEdit}
          className="p-1.5 text-fg-3 hover:text-info hover:bg-white/[0.04] rounded-md transition-colors duration-150"
          title="编辑"
          aria-label="编辑游戏"
        >
          <Edit size={14} />
        </button>

        <button
          onClick={onDelete}
          className="p-1.5 text-fg-3 hover:text-danger hover:bg-white/[0.04] rounded-md transition-colors duration-150"
          title="删除"
          aria-label="删除游戏"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </CardSpotlight>
  );
};
