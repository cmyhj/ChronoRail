import React from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { GameCard } from './GameCard';
import { Button } from '../Common/Button';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import type { Game } from '../../types';

interface GameListProps {
  games: Game[];
  hiddenIds?: string[];
  revealHidden?: boolean;
  onToggleHidden?: () => void;
  onAdd: () => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  hiddenIds = [],
  revealHidden = false,
  onToggleHidden,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-fg">
              <TextGenerateEffect words="游戏管理" duration={0.6} className="text-base" />
            </h2>
            <p className="text-[12px] text-fg-3 mt-0.5">
              共 {games.length} 个游戏
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hiddenIds.length > 0 && onToggleHidden && (
              <Button
                onClick={onToggleHidden}
                icon={revealHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                size="sm"
                variant="secondary"
                aria-pressed={revealHidden}
                title={revealHidden ? '收起已隐藏的游戏' : '在时间轴中显示已隐藏的游戏'}
              >
                <span className="hidden sm:inline">已隐藏 {hiddenIds.length}</span>
              </Button>
            )}

            <Button
              onClick={onAdd}
              icon={<Plus size={15} />}
              size="sm"
            >
              <span className="hidden sm:inline">添加游戏</span>
            </Button>
          </div>
        </div>

        {/* Game grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={() => onEdit(game)}
                onDelete={() => onDelete(game)}
                className={`enter ${hiddenIds.includes(game.id) && !revealHidden ? 'opacity-50' : ''}`}
                style={{ ['--delay' as string]: `${index * 40}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 border border-line">
              <Plus size={28} className="text-fg-4" />
            </div>
            <h3 className="text-sm font-medium text-fg mb-1">
              暂无游戏
            </h3>
            <p className="text-[12px] text-fg-3 mb-4 max-w-xs">
              添加你想要追踪的游戏版本
            </p>
            <Button
              onClick={onAdd}
              icon={<Plus size={16} />}
              size="sm"
            >
              添加第一个游戏
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
