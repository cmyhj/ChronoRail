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
  
  // 计算持续天数
  const duration = endDate ? endDate.diff(startDate, 'day') : null;
  
  // 计算距今天数
  const daysFromNow = dayjs().diff(startDate, 'day');
  const isCurrent = endDate
    ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
    : daysFromNow >= 0 && daysFromNow < 42;
  const isPast = endDate ? dayjs().isAfter(endDate) : false;

  return (
    <div
      className="absolute top-0 h-full cursor-pointer group"
      style={style}
      onClick={onClick}
    >
      <div
        className={`
          h-full rounded-md px-1 md:px-2 flex flex-col items-center justify-center transition-all duration-300
          ${isCurrent 
            ? 'ring-1 ring-current shadow-md' 
            : isPast 
              ? 'opacity-60' 
              : 'opacity-90'
          }
          hover:scale-[1.02] hover:shadow-lg hover:z-20 hover:ring-1 hover:ring-white/50
        `}
        style={{
          backgroundColor: `${gameColor}25`,
          borderColor: `${gameColor}60`,
          border: `1px solid ${gameColor}40`,
        }}
      >
        {/* 版本号 */}
        <div 
          className={`font-bold truncate text-center ${isMobile ? 'text-[10px]' : 'text-xs'}`}
          style={{ color: gameColor }}
        >
          v{version.version}
        </div>
        
        {/* 版本名称 */}
        <div 
          className={`truncate text-center ${isMobile ? 'text-[8px]' : 'text-[10px]'} mt-0.5`}
          style={{ color: `${gameColor}CC` }}
        >
          {version.name}
        </div>

        {/* 日期范围 */}
        <div className={`text-[#64748b] ${isMobile ? 'text-[7px]' : 'text-[9px]'} mt-0.5`}>
          {startDate.format('MM/DD')}
          {endDate && ` - ${endDate.format('MM/DD')}`}
        </div>
      </div>

      {/* 悬浮提示 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 min-w-[180px]">
        <div className="text-sm font-semibold text-[#e2e8f0] mb-1">
          v{version.version} - {version.name}
        </div>
        <div className="text-xs text-[#94a3b8] space-y-1">
          <div>开始日期: {startDate.format('YYYY-MM-DD')}</div>
          {endDate && <div>结束日期: {endDate.format('YYYY-MM-DD')}</div>}
          {duration !== null && <div>持续天数: {duration}天</div>}
          {isCurrent && <div className="text-[#67c23a]">● 当前版本</div>}
          {isPast && <div className="text-[#64748b]">○ 已结束</div>}
          {!isPast && !isCurrent && <div className="text-[#e6a23c]">○ 即将开始</div>}
        </div>
        {/* 箭头 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2d2d4a]" />
      </div>
    </div>
  );
};
