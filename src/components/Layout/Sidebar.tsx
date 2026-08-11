import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Download, Upload } from 'lucide-react';
import { GameIcon } from '../Common/GameIcon';
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
    <aside className="w-60 bg-panel border-r border-line h-full overflow-y-auto shrink-0">
      <div className="p-4">
        {/* 导航菜单 */}
        <nav className="mb-6">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                      ${isActive(item.path)
                        ? 'bg-white/8 text-fg'
                        : 'text-fg-2 hover:text-fg hover:bg-white/5'
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-medium text-fg-4 uppercase tracking-wider">
              游戏列表
            </h3>
            <button
              onClick={onAddGame}
              className="p-1 text-fg-3 hover:text-accent hover:bg-hover rounded-md transition-colors duration-150"
              title="添加游戏"
              aria-label="添加游戏"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <ul className="space-y-1">
            {sortedGames.map((game) => {
              return (
                <li key={game.id}>
                  <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors duration-150 hover:bg-hover cursor-pointer group">
                    <div className="relative shrink-0">
                      <GameIcon gameId={game.id} size={28} />
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-panel"
                        style={{ backgroundColor: game.autoFetch ? '#34d399' : '#fbbf24' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="truncate font-medium text-fg block text-sm">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-fg-3">
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
              <p className="text-xs text-fg-3">
                暂无游戏，点击 + 添加
              </p>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="mt-6 pt-4 border-t border-line">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-fg-3 hover:text-fg hover:bg-hover rounded-lg transition-colors duration-150"
              title="导出数据"
            >
              <Download size={12} />
              导出
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-fg-3 hover:text-fg hover:bg-hover rounded-lg transition-colors duration-150"
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
            <p className="text-[10px] text-fg-4">
              共 {sortedGames.length} 个游戏
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
