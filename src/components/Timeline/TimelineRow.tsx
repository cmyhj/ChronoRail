import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { VersionBlock } from './VersionBlock';
import { GameIcon, gameColors } from '../Common/GameIcon';
import type { Game, Version, TimelineScale } from '../../types';

interface TimelineRowProps {
  game: Game;
  versions: Version[];
  dateRange: {
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  };
  scale: TimelineScale;
  onVersionClick?: (version: Version) => void;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  game,
  versions,
  dateRange,
  scale,
  onVersionClick,
}) => {
  // 计算版本块位置
  const versionBlocks = useMemo(() => {
    return versions.map(version => {
      const startDate = dayjs(version.startDate);
      const endDate = version.endDate ? dayjs(version.endDate) : startDate.add(scale === 'day' ? 1 : scale === 'week' ? 7 : 30, 'day');
      
      const totalDays = dateRange.end.diff(dateRange.start, 'day');
      const startOffset = startDate.diff(dateRange.start, 'day');
      const duration = endDate.diff(startDate, 'day');
      
      const left = Math.max(0, (startOffset / totalDays) * 100);
      const width = Math.min(100 - left, (duration / totalDays) * 100);
      
      return {
        version,
        style: {
          left: `${left}%`,
          width: `${Math.max(width, 3)}%`,
        },
      };
    }).filter(block => {
      // 只显示在时间范围内的版本
      const startDate = dayjs(block.version.startDate);
      return startDate.isAfter(dateRange.start.subtract(1, 'day')) && 
             startDate.isBefore(dateRange.end.add(1, 'day'));
    });
  }, [versions, dateRange, scale]);

  return (
    <div className="flex border-b border-[#2d2d4a] hover:bg-[#1a1a2e]/50 transition-colors">
      {/* 游戏名称 */}
      <div 
        className="w-48 shrink-0 px-4 py-5 border-r border-[#2d2d4a] flex items-center gap-3"
        style={{ borderLeft: `4px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
      >
        <GameIcon gameId={game.id} size={24} />
        <span className="text-sm font-medium text-[#e2e8f0] truncate">
          {game.name}
        </span>
      </div>

      {/* 版本块区域 */}
      <div className="flex-1 relative min-h-[80px]">
        {/* 时间网格线 */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-[#2d2d4a]/50 last:border-r-0"
            />
          ))}
        </div>

        {/* 今天的标记线 */}
        {dayjs().isAfter(dateRange.start) && dayjs().isBefore(dateRange.end) && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#6366f1] z-10"
            style={{
              left: `${(dayjs().diff(dateRange.start, 'day') / dateRange.end.diff(dateRange.start, 'day')) * 100}%`,
            }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-[#6366f1] rounded-full" />
          </div>
        )}

        {/* 版本块 */}
        <div className="absolute inset-0 flex items-center px-2">
          {versionBlocks.map(({ version, style }) => (
            <VersionBlock
              key={version.id}
              version={version}
              gameColor={game.color || gameColors[game.id] || '#6366f1'}
              style={style}
              onClick={() => onVersionClick?.(version)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
