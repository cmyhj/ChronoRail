import React from 'react';
import dayjs from 'dayjs';
import type { Version } from '../../types';

interface VersionBlockProps {
  version: Version;
  gameColor: string;
  style: React.CSSProperties;
  onClick?: () => void;
  isMobile?: boolean;
}

export const VersionBlock: React.FC<VersionBlockProps> = ({
  version,
  gameColor,
  style,
  onClick,
  isMobile = false,
}) => {
  const startDate = dayjs(version.startDate);
  const endDate = version.endDate ? dayjs(version.endDate) : null;
  
  const duration = endDate ? endDate.diff(startDate, 'day') : null;
  const isCurrent = endDate
    ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
    : dayjs().diff(startDate, 'day') >= 0 && dayjs().diff(startDate, 'day') < 42;
  const isPast = endDate ? dayjs().isAfter(endDate) : false;

  return (
    <div
      className="absolute top-0 h-full cursor-pointer group/version"
      style={style}
      onClick={onClick}
    >
      <div
        className={`
          h-full rounded-lg px-1.5 md:px-2.5 flex flex-col items-center justify-center transition-all duration-150
          ${isCurrent 
            ? 'ring-1 ring-accent' 
            : isPast 
              ? 'opacity-40' 
              : 'opacity-85'
          }
          hover:opacity-100 hover:z-20 hover:scale-[1.02]
        `}
        style={{
          background: `linear-gradient(135deg, ${gameColor}20, ${gameColor}35)`,
          border: `1px solid ${gameColor}40`,
        }}
      >
        {/* 版本号 */}
        <div 
          className={`font-bold truncate text-center leading-tight ${isMobile ? 'text-[10px]' : 'text-xs'}`}
          style={{ color: gameColor }}
        >
          v{version.version}
        </div>
        
        {/* 版本名称 */}
        <div 
          className={`truncate text-center leading-tight font-medium ${isMobile ? 'text-[8px]' : 'text-[10px]'} mt-0.5 text-fg-2`}
        >
          {version.name}
        </div>

        {/* 日期范围 */}
        <div className={`text-fg-3 ${isMobile ? 'text-[7px]' : 'text-[9px]'} mt-0.5`}>
          {startDate.format('MM/DD')}
          {endDate && `~${endDate.format('MM/DD')}`}
        </div>
      </div>

      {/* 悬浮提示 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-card border border-line rounded-xl shadow-2xl opacity-0 group-hover/version:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-30 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: gameColor }}
          />
          <span className="text-sm font-semibold text-fg">
            v{version.version}
          </span>
          {isCurrent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success">
              进行中
            </span>
          )}
          {isPast && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-fg-3">
              已结束
            </span>
          )}
        </div>
        
        <div className="text-xs text-fg-2 mb-2">{version.name}</div>
        
        <div className="space-y-1 text-[11px] text-fg-3">
          <div className="flex items-center gap-2">
            <span className="w-12">开始</span>
            <span className="text-fg">{startDate.format('YYYY-MM-DD')}</span>
          </div>
          {endDate && (
            <div className="flex items-center gap-2">
              <span className="w-12">结束</span>
              <span className="text-fg">{endDate.format('YYYY-MM-DD')}</span>
            </div>
          )}
          {duration !== null && (
            <div className="flex items-center gap-2">
              <span className="w-12">持续</span>
              <span className="text-fg">{duration}天</span>
            </div>
          )}
        </div>
        
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-line" />
      </div>
    </div>
  );
};
