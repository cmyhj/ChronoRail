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
  const daysFromNow = dayjs().diff(startDate, 'day');
  const isCurrent = endDate
    ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
    : daysFromNow >= 0 && daysFromNow < 42;
  const isPast = endDate ? dayjs().isAfter(endDate) : false;

  return (
    <div
      className="absolute top-0 h-full cursor-pointer group/version"
      style={style}
      onClick={onClick}
    >
      <div
        className={`
          h-full rounded-lg px-1.5 md:px-2.5 flex flex-col items-center justify-center transition-all duration-200
          ${isCurrent 
            ? 'ring-1 ring-current shadow-lg animate-pulse-glow' 
            : isPast 
              ? 'opacity-50' 
              : 'opacity-90'
          }
          hover:brightness-125 hover:shadow-xl hover:z-20 hover:scale-[1.02]
        `}
        style={{
          background: `linear-gradient(135deg, ${gameColor}25, ${gameColor}45)`,
          border: `1px solid ${gameColor}60`,
          boxShadow: `inset 0 1px 0 ${gameColor}30`,
        }}
      >
        {/* 版本号 */}
        <div 
          className={`font-bold truncate text-center leading-tight drop-shadow-sm ${isMobile ? 'text-[10px]' : 'text-xs'}`}
          style={{ color: gameColor, textShadow: `0 0 10px ${gameColor}50` }}
        >
          v{version.version}
        </div>
        
        {/* 版本名称 */}
        <div 
          className={`truncate text-center leading-tight font-medium ${isMobile ? 'text-[8px]' : 'text-[10px]'} mt-0.5`}
          style={{ color: `${gameColor}dd` }}
        >
          {version.name}
        </div>

        {/* 日期范围 */}
        <div className={`text-[#8890a0] ${isMobile ? 'text-[7px]' : 'text-[9px]'} mt-0.5`}>
          {startDate.format('MM/DD')}
          {endDate && `~${endDate.format('MM/DD')}`}
        </div>
      </div>

      {/* 悬浮提示 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-[#12122a] border border-[#1e1e3a] rounded-xl shadow-2xl opacity-0 group-hover/version:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 min-w-[200px] backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: gameColor }}
          />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            v{version.version}
          </span>
          {isCurrent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981]">
              进行中
            </span>
          )}
          {isPast && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#64748b]/20 text-[#64748b]">
              已结束
            </span>
          )}
        </div>
        
        <div className="text-xs text-[#94a3b8] mb-2">{version.name}</div>
        
        <div className="space-y-1 text-[11px] text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-12">开始</span>
            <span className="text-[#e2e8f0]">{startDate.format('YYYY-MM-DD')}</span>
          </div>
          {endDate && (
            <div className="flex items-center gap-2">
              <span className="w-12">结束</span>
              <span className="text-[#e2e8f0]">{endDate.format('YYYY-MM-DD')}</span>
            </div>
          )}
          {duration !== null && (
            <div className="flex items-center gap-2">
              <span className="w-12">持续</span>
              <span className="text-[#e2e8f0]">{duration}天</span>
            </div>
          )}
        </div>
        
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1e1e3a]" />
      </div>
    </div>
  );
};
