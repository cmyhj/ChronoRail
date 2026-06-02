import React from 'react';
import { Plus } from 'lucide-react';
import { GameCard } from './GameCard';
import type { Game } from '../../types';

interface GameListProps {
  games: Game[];
  onAdd: () => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onRefreshVersions?: (game: Game) => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  onAdd,
  onEdit,
  onDelete,
  onRefreshVersions,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div>
          <h2 className="text-lg font-semibold text-[#e2e8f0]">游戏管理</h2>
          <p className="text-sm text-[#64748b] mt-1">
            共 {games.length} 个游戏
          </p>
        </div>
        
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg hover:from-[#4f46e5] hover:to-[#6366f1] transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          添加游戏
        </button>
      </div>

      {/* 游戏列表 */}
      <div className="flex-1 overflow-auto p-4">
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={() => onEdit(game)}
                onDelete={() => onDelete(game)}
                onRefreshVersions={onRefreshVersions ? () => onRefreshVersions(game) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-[#252540] rounded-full flex items-center justify-center mb-4">
              <Plus size={40} className="text-[#64748b]" />
            </div>
            <h3 className="text-lg font-medium text-[#e2e8f0] mb-2">
              暂无游戏
            </h3>
            <p className="text-sm text-[#64748b] mb-6 max-w-md">
              点击上方"添加游戏"按钮来添加你想要追踪的游戏版本
            </p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg hover:from-[#4f46e5] hover:to-[#6366f1] transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              添加第一个游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
