import React from 'react';
import type { Dayjs } from 'dayjs';
import type { Game, Version } from '../../types';

interface CalendarDayProps {
  date: Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  versions: Version[];
  gamesMap: Map<string, Game>;
  onClick: (dateKey: string) => void;
  dateKey: string;
}

export const CalendarDay: React.FC<CalendarDayProps> = React.memo(({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  versions,
  gamesMap,
  onClick,
  dateKey,
}) => {
  const displayVersions = versions.slice(0, 3);
  const remainingCount = versions.length - 3;

  return (
    <div
      onClick={() => onClick(dateKey)}
      className={`
        relative min-h-[60px] md:min-h-[80px] p-1 md:p-1.5 rounded-lg cursor-pointer transition-all duration-200
        ${isCurrentMonth ? 'bg-[#1a1a2e]' : 'bg-[#0f0f23]/50'}
        ${isSelected 
          ? 'ring-2 ring-[#6366f1] bg-[#6366f1]/10 shadow-lg shadow-[#6366f1]/20' 
          : 'active:bg-[#252540] md:hover:bg-[#252540] md:hover:shadow-md border border-[#2d2d4a]/50'
        }
        ${isToday ? 'border-[#6366f1]' : ''}
      `}
    >
      {/* 日期数字 */}
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <span
          className={`
            text-[10px] md:text-xs font-medium
            ${isToday 
              ? 'w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-[#6366f1] text-white rounded-full' 
              : isCurrentMonth 
                ? 'text-[#e2e8f0]' 
                : 'text-[#64748b]'
            }
          `}
        >
          {date.date()}
        </span>
        
        {versions.length > 0 && (
          <span className="text-[8px] md:text-[10px] text-[#64748b]">
            {versions.length}
          </span>
        )}
      </div>

      {/* 版本点 */}
      <div className="space-y-0 md:space-y-0.5">
        {displayVersions.map(version => {
          const color = gamesMap.get(version.gameId)?.color || '#6366f1';
          return (
            <div
              key={version.id}
              className="flex items-center gap-0.5 md:gap-1 px-0.5 md:px-1 py-0 md:py-0.5 rounded text-[8px] md:text-[10px] truncate"
              style={{
                backgroundColor: `${color}20`,
                color,
              }}
            >
              <div
                className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">v{version.version}</span>
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div className="text-[8px] md:text-[10px] text-[#64748b] text-center">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
});
