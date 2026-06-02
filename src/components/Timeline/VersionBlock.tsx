import React from 'react';
import dayjs from 'dayjs';
import type { Version } from '../../types';

interface VersionBlockProps {
  version: Version;
  gameColor: string;
  style: React.CSSProperties;
  onClick?: () => void;
}

export const VersionBlock: React.FC<VersionBlockProps> = ({
  version,
  gameColor,
  style,
  onClick,
}) => {
  const startDate = dayjs(version.startDate);
  const endDate = version.endDate ? dayjs(version.endDate) : null;
  
  // 计算持续天数
  const duration = endDate ? endDate.diff(startDate, 'day') : null;
  
  // 计算距今天数
  const daysFromNow = dayjs().diff(startDate, 'day');
  const isCurrent = daysFromNow >= 0 && (duration === null || daysFromNow < duration);
  const isPast = duration !== null && daysFromNow >= duration;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
      style={style}
      onClick={onClick}
    >
      <div
        className={`
          relative px-3 py-2 rounded-lg border transition-all duration-300
          ${isCurrent 
            ? 'border-current shadow-lg' 
            : isPast 
              ? 'opacity-70' 
              : 'opacity-90'
          }
          hover:scale-105 hover:shadow-xl hover:z-10
        `}
        style={{
          backgroundColor: `${gameColor}20`,
          borderColor: `${gameColor}60`,
          color: gameColor,
        }}
      >
        {/* 版本号 */}
        <div className="text-xs font-bold mb-0.5 truncate">
          v{version.version}
        </div>
        
        {/* 版本名称 */}
        <div className="text-[10px] opacity-80 truncate">
          {version.name}
        </div>

        {/* 悬浮提示 */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
          <div className="text-sm font-semibold text-[#e2e8f0] mb-1">
            v{version.version} - {version.name}
          </div>
          <div className="text-xs text-[#94a3b8] space-y-1">
            <div>更新日期: {startDate.format('YYYY-MM-DD')}</div>
            {endDate && <div>结束日期: {endDate.format('YYYY-MM-DD')}</div>}
            {duration !== null && <div>持续天数: {duration}天</div>}
            {version.description && (
              <div className="max-w-[200px] truncate">{version.description}</div>
            )}
          </div>
          {/* 箭头 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2d2d4a]" />
        </div>
      </div>

      {/* 当前版本标记 */}
      {isCurrent && (
        <div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: gameColor }}
        />
      )}
    </div>
  );
};
