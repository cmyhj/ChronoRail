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
        relative min-h-[56px] md:min-h-[72px] p-1 md:p-1.5 rounded-lg cursor-pointer transition-colors duration-150
        ${isCurrentMonth ? 'bg-card/50' : 'bg-transparent'}
        ${isSelected
          ? 'ring-1 ring-accent/50 bg-accent/[0.06]'
          : 'border border-transparent hover:bg-hover hover:border-line/30'
        }
        ${isToday && !isSelected ? 'border-accent/30' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <span
          className={`
            text-[10px] md:text-[11px] font-medium
            ${isToday
              ? 'w-5 h-5 md:w-5.5 md:h-5.5 flex items-center justify-center bg-accent text-white rounded-full text-[9px]'
              : isCurrentMonth
                ? 'text-fg-2'
                : 'text-fg-4'
            }
          `}
        >
          {date.date()}
        </span>

        {versions.length > 0 && (
          <span className="text-[8px] md:text-[9px] text-fg-4 tabular-nums">
            {versions.length}
          </span>
        )}
      </div>

      <div className="space-y-px">
        {displayVersions.map((version) => {
          const color = gamesMap.get(version.gameId)?.color || '#6366f1';
          return (
            <div
              key={version.id}
              className="flex items-center gap-0.5 px-0.5 py-0 rounded text-[7px] md:text-[9px] truncate"
              style={{
                backgroundColor: `${color}10`,
                color,
              }}
            >
              <div
                className="w-[3px] h-[3px] md:w-1 md:h-1 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate font-medium">v{version.version}</span>
            </div>
          );
        })}

        {remainingCount > 0 && (
          <div className="text-[7px] md:text-[9px] text-fg-4 text-center">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
});
