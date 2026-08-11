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
        relative min-h-[60px] md:min-h-[80px] p-1 md:p-1.5 rounded-lg cursor-pointer transition-colors duration-150
        ${isCurrentMonth ? 'bg-card' : 'bg-ink/50'}
        ${isSelected 
          ? 'ring-2 ring-accent bg-accent/10' 
          : 'border border-line/50 hover:bg-hover'
        }
        ${isToday && !isSelected ? 'border-accent/40' : ''}
      `}
    >
      {/* 日期数字 */}
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <span
          className={`
            text-[10px] md:text-xs font-medium
            ${isToday 
              ? 'w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-accent text-white rounded-full' 
              : isCurrentMonth 
                ? 'text-fg' 
                : 'text-fg-3'
            }
          `}
        >
          {date.date()}
        </span>
        
        {versions.length > 0 && (
          <span className="text-[8px] md:text-[10px] text-fg-3">
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
                backgroundColor: `${color}15`,
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
          <div className="text-[8px] md:text-[10px] text-fg-3 text-center">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
});
