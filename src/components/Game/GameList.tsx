import React from 'react';
import { Plus } from 'lucide-react';
import { GameCard } from './GameCard';
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
      <div className="flex items-center justify-between p-3 md:p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-[#e2e8f0]">游戏管理</h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-0.5 md:mt-1">
            共 {games.length} 个游戏
          </p>
        </div>
        
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg active:from-[#4f46e5] md:hover:from-[#4f46e5] active:to-[#6366f1] md:hover:to-[#6366f1] transition-all duration-300 md:hover:-translate-y-0.5 shadow-lg md:hover:shadow-xl"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">添加游戏</span>
        </button>
      </div>

      {/* 游戏列表 */}
      <div className="flex-1 overflow-auto p-3 md:p-4">
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {games.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={() => onEdit(game)}
                onDelete={() => onDelete(game)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#252540] rounded-full flex items-center justify-center mb-4 animate-float">
              <Plus size={32} className="md:w-10 md:h-10 text-[#64748b]" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-[#e2e8f0] mb-2">
              暂无游戏
            </h3>
            <p className="text-xs md:text-sm text-[#64748b] mb-4 md:mb-6 max-w-md">
              点击上方"添加游戏"按钮来添加你想要追踪的游戏版本
            </p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg active:from-[#4f46e5] md:hover:from-[#4f46e5] active:to-[#6366f1] md:hover:to-[#6366f1] transition-all duration-300 md:hover:-translate-y-0.5 shadow-lg md:hover:shadow-xl"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
              添加第一个游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
