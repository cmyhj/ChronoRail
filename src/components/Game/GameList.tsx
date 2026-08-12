import React from 'react';
import { Plus } from 'lucide-react';
import { GameCard } from './GameCard';
import { Button } from '../Common/Button';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import type { Game } from '../../types';

interface GameListProps {
  games: Game[];
  onAdd: () => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
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
              <TextGenerateEffect words="游戏管理" duration={0.8} className="text-base" />
            </h2>
            <p className="text-[12px] text-fg-3 mt-0.5">
              共 {games.length} 个游戏
            </p>
          </div>

          <Button
            onClick={onAdd}
            icon={<Plus size={15} />}
            size="sm"
          >
            <span className="hidden sm:inline">添加游戏</span>
          </Button>
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
                className="enter"
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
