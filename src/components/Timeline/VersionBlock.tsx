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
  const daysFromNow = dayjs().diff(startDate, 'day');
  const isCurrent = endDate
    ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
    : daysFromNow >= 0 && daysFromNow < 42;
  const isPast = endDate ? dayjs().isAfter(endDate) : false;

  return (
    <div
      className="absolute top-0 h-full cursor-pointer group/version z-10"
      style={style}
      onClick={onClick}
    >
      {/* 主体：实色 pill，非半透明 */}
      <div
        className={`
          h-full rounded-full flex flex-col items-center justify-center
          transition-all duration-200
          ${isCurrent ? 'ring-1 ring-white/30' : ''}
          ${isPast ? 'opacity-30 saturate-[0.3]' : ''}
          hover:opacity-100 hover:saturate-100 hover:z-30 hover:scale-y-[1.06] hover:scale-x-[1.01]
        `}
        style={{
          backgroundColor: gameColor,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 3px rgba(0,0,0,0.3)`,
        }}
      >
        {/* 版本号 */}
        <div
          className={`font-bold whitespace-nowrap leading-none ${isMobile ? 'text-[9px]' : 'text-[11px]'}`}
          style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
        >
          v{version.version}
        </div>

        {/* 版本名称（只在宽度足够时显示） */}
        {!isMobile && (
          <div
            className="text-[9px] font-medium leading-tight mt-0.5 opacity-90 whitespace-nowrap"
            style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {version.name}
          </div>
        )}
      </div>

      {/* 悬浮提示 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-card border border-line rounded-xl shadow-2xl opacity-0 group-hover/version:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-30 min-w-[180px] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gameColor }} />
          <span className="text-[13px] font-semibold text-fg">v{version.version}</span>
          {isCurrent && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">进行中</span>
          )}
          {isPast && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-fg-3/10 text-fg-3">已结束</span>
          )}
        </div>
        <div className="text-[11px] text-fg-2 mb-2">{version.name}</div>
        <div className="space-y-1 text-[10px] text-fg-3">
          <div className="flex items-center gap-2">
            <span className="w-8">开始</span>
            <span className="text-fg tabular-nums">{startDate.format('YYYY-MM-DD')}</span>
          </div>
          {endDate && (
            <div className="flex items-center gap-2">
              <span className="w-8">结束</span>
              <span className="text-fg tabular-nums">{endDate.format('YYYY-MM-DD')}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-2">
              <span className="w-8">持续</span>
              <span className="text-fg">{endDate.diff(startDate, 'day')}天</span>
            </div>
          )}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card" />
      </div>
    </div>
  );
};
