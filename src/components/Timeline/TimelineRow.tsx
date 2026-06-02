import React from 'react';
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
  getVersionStyle: (version: Version) => React.CSSProperties;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  game,
  versions,
  dateRange,
  scale,
  onVersionClick,
  getVersionStyle,
}) => {
  return (
    <div className="flex border-b border-[#2d2d4a] hover:bg-[#1a1a2e]/50 transition-colors">
      {/* 游戏名称 */}
      <div 
        className="w-48 shrink-0 px-4 py-5 border-r border-[#2d2d4a] flex items-center gap-3"
        style={{ borderLeft: `4px solid ${game.color || gameColors[game.id] || '#6366f1'}` }}
      >
        <GameIcon gameId={game.id} size={24} />
        <div>
          <span className="text-sm font-medium text-[#e2e8f0] block">
            {game.name}
          </span>
          <span className="text-xs text-[#64748b]">
            {versions.length} 个版本
          </span>
        </div>
      </div>

      {/* 版本块区域 */}
      <div className="flex-1 relative min-h-[80px]">
        {/* 时间网格线 */}
        <div className="absolute inset-0 flex">
          {scale === 'day' ? (
            // 按天显示网格
            Array.from({ length: dateRange.end.diff(dateRange.start, 'day') + 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-[#2d2d4a]/30 last:border-r-0"
              />
            ))
          ) : (
            // 按周显示网格
            Array.from({ length: Math.ceil((dateRange.end.diff(dateRange.start, 'day') + 1) / 7) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-[#2d2d4a]/50 last:border-r-0"
              />
            ))
          )}
        </div>

        {/* 今天的标记线 */}
        {dayjs().isSame(dateRange.start, 'month') && (() => {
          const today = dayjs();
          const dayOfMonth = today.date();
          const totalDays = dateRange.end.date();
          const leftPercent = (dayOfMonth / totalDays) * 100;
          
          return (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#6366f1] z-10 pointer-events-none"
              style={{ left: `${leftPercent}%` }}
            />
          );
        })()}

        {/* 版本块 */}
        {versions.map(version => {
          const style = getVersionStyle(version);
          if (style.display === 'none') return null;
          
          return (
            <VersionBlock
              key={version.id}
              version={version}
              gameColor={game.color || gameColors[game.id] || '#6366f1'}
              style={style}
              onClick={() => onVersionClick?.(version)}
            />
          );
        })}

        {/* 无版本提示 */}
        {versions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-[#64748b]">本月暂无版本</span>
          </div>
        )}
      </div>
    </div>
  );
};
