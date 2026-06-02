import React from 'react';
import type { Dayjs } from 'dayjs';
import type { Game, Version } from '../../types';

interface CalendarDayProps {
  date: Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  versions: Version[];
  games: Game[];
  onClick: () => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  versions,
  games,
  onClick,
}) => {
  // 获取游戏信息
  const getGame = (gameId: string) => games.find(g => g.id === gameId);

  // 获取版本颜色
  const getVersionColor = (version: Version) => {
    const game = getGame(version.gameId);
    return game?.color || '#6366f1';
  };

  // 最多显示3个版本点
  const displayVersions = versions.slice(0, 3);
  const remainingCount = versions.length - 3;

  return (
    <div
      onClick={onClick}
      className={`
        relative min-h-[80px] p-1.5 rounded-lg cursor-pointer transition-all duration-200
        ${isCurrentMonth ? 'bg-[#1a1a2e]' : 'bg-[#0f0f23]/50'}
        ${isSelected 
          ? 'ring-2 ring-[#6366f1] bg-[#6366f1]/10' 
          : 'hover:bg-[#252540] border border-[#2d2d4a]/50'
        }
        ${isToday ? 'border-[#6366f1]' : ''}
      `}
    >
      {/* 日期数字 */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            text-xs font-medium
            ${isToday 
              ? 'w-6 h-6 flex items-center justify-center bg-[#6366f1] text-white rounded-full' 
              : isCurrentMonth 
                ? 'text-[#e2e8f0]' 
                : 'text-[#64748b]'
            }
          `}
        >
          {date.date()}
        </span>
        
        {versions.length > 0 && (
          <span className="text-[10px] text-[#64748b]">
            {versions.length}
          </span>
        )}
      </div>

      {/* 版本点 */}
      <div className="space-y-0.5">
        {displayVersions.map(version => (
          <div
            key={version.id}
            className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate"
            style={{
              backgroundColor: `${getVersionColor(version)}20`,
              color: getVersionColor(version),
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: getVersionColor(version) }}
            />
            <span className="truncate">v{version.version}</span>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-[10px] text-[#64748b] text-center">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};
