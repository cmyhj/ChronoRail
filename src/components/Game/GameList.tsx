import React from 'react';
import { Plus } from 'lucide-react';
import { GameCard } from './GameCard';
import { Button } from '../Common/Button';
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
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-panel border-b border-line">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-fg">游戏管理</h2>
          <p className="text-xs md:text-sm text-fg-3 mt-0.5">
            共 {games.length} 个游戏
          </p>
        </div>
        
        <Button
          onClick={onAdd}
          icon={<Plus size={16} />}
        >
          <span className="hidden sm:inline">添加游戏</span>
        </Button>
      </div>

      {/* 游戏列表 */}
      <div className="flex-1 overflow-auto p-3 md:p-4">
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={() => onEdit(game)}
                onDelete={() => onDelete(game)}
                className="enter"
                style={{ ['--delay' as string]: `${index * 50}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-card rounded-full flex items-center justify-center mb-4 border border-line">
              <Plus size={32} className="text-fg-3" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-fg mb-2">
              暂无游戏
            </h3>
            <p className="text-xs md:text-sm text-fg-3 mb-4 md:mb-6 max-w-md">
              点击上方"添加游戏"按钮来添加你想要追踪的游戏版本
            </p>
            <Button
              onClick={onAdd}
              icon={<Plus size={18} />}
            >
              添加第一个游戏
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
