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
  totalDays: number;
  scale?: TimelineScale;
  onVersionClick?: (version: Version) => void;
  todayPosition: number | null;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  game,
  versions,
  dateRange,
  totalDays,
  onVersionClick,
  todayPosition,
}) => {
  // 计算版本块位置
  const getVersionStyle = (version: Version): React.CSSProperties => {
    const versionStart = dayjs(version.startDate);
    const versionEnd = version.endDate ? dayjs(version.endDate) : versionStart.add(42, 'day');
    
    // 计算在当前月份范围内的位置
    const startPos = Math.max(0, versionStart.diff(dateRange.start, 'day'));
    const endPos = Math.min(totalDays, versionEnd.diff(dateRange.start, 'day') + 1);
    
    // 如果版本完全在月份范围外，不显示
    if (startPos >= totalDays || endPos <= 0) {
      return { display: 'none' };
    }
    
    const left = (startPos / totalDays) * 100;
    const width = ((endPos - startPos) / totalDays) * 100;
    
    return {
      left: `${left}%`,
      width: `${Math.max(width, 3)}%`,
    };
  };

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
        {/* 时间网格线（每周一条） */}
        {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => {
          const dayNum = i * 7;
          const left = (dayNum / totalDays) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[#2d2d4a]/40"
              style={{ left: `${left}%` }}
            />
          );
        })}

        {/* 今天的标记线 */}
        {todayPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#6366f1] z-10 pointer-events-none"
            style={{ left: `${todayPosition}%` }}
          />
        )}

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
