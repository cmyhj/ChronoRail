import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Download, Upload } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import { NAV_ITEMS } from '../../constants/navigation';
import { DEFAULT_PRESET_GAMES } from '../../hooks/useGames';
import { dataService } from '../../services/storage';
import type { Game } from '../../types';

interface SidebarProps {
  games: Game[];
  onAddGame?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  games,
  onAddGame,
}) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleExport = () => {
    dataService.downloadJson();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const json = reader.result as string;
      if (dataService.importFromJson(json)) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

    const sortedGames = [...games].sort((a, b) => {
      const aIndex = DEFAULT_PRESET_GAMES.indexOf(a.id as typeof DEFAULT_PRESET_GAMES[number]);
      const bIndex = DEFAULT_PRESET_GAMES.indexOf(b.id as typeof DEFAULT_PRESET_GAMES[number]);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return (
    <aside className="w-64 bg-[#0e0e20] border-r border-[#1e1e3a] h-full overflow-y-auto">
      <div className="p-4">
        {/* 导航菜单 */}
        <nav className="mb-6">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#818cf8]/10 text-[#818cf8] border border-[#6366f1]/30 shadow-lg shadow-[#6366f1]/10 glow-effect'
                        : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a1a35]'
                      }
                    `}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 游戏列表 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              游戏列表
            </h3>
            <button
              onClick={onAddGame}
              className="p-1.5 text-[#64748b] hover:text-[#6366f1] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
              title="添加游戏"
              aria-label="添加游戏"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ul className="space-y-2">
            {sortedGames.map((game) => {
              return (
                <li key={game.id}>
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 hover:bg-[#1a1a35] hover:shadow-md group cursor-pointer"
                    style={{ borderLeft: `3px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
                  >
                    <div className="relative">
                      <GameIcon gameId={game.id} size={32} />
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e20]"
                        style={{ backgroundColor: game.autoFetch ? '#10b981' : '#f59e0b' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="truncate font-medium text-[#e2e8f0] block text-sm">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {game.autoFetch ? '自动同步' : '手动管理'}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {sortedGames.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#1a1a35] rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-xs text-[#64748b]">
                暂无游戏，点击 + 添加
              </p>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="mt-6 pt-4 border-t border-[#1e1e3a]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
              title="导出数据"
            >
              <Download size={12} />
              导出
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1a35] rounded-lg transition-all duration-200"
              title="导入数据"
            >
              <Upload size={12} />
              导入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#64748b]">
              共 {sortedGames.length} 个游戏
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
