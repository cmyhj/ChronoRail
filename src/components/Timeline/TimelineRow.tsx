import React from 'react';
import dayjs from 'dayjs';
import { VersionBlock } from './VersionBlock';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import type { Game, Version, Banner } from '../../types';

interface TimelineRowProps {
  game: Game;
  versions: Version[];
  banners: Banner[];
  dateRange: {
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  };
  totalDays: number;
  onVersionClick?: (version: Version) => void;
  todayPosition: number | null;
  isMobile?: boolean;
}

export const TimelineRow: React.FC<TimelineRowProps> = React.memo(({
  game,
  versions,
  banners,
  dateRange,
  totalDays,
  onVersionClick,
  todayPosition,
  isMobile = false,
}) => {

  // 计算版本块位置
  const getVersionStyle = (version: Version): React.CSSProperties => {
    const versionStart = dayjs(version.startDate);
    const versionEnd = version.endDate ? dayjs(version.endDate) : versionStart.add(42, 'day');
    
    const startPos = Math.max(0, versionStart.diff(dateRange.start, 'day'));
    const endPos = Math.min(totalDays, versionEnd.diff(dateRange.start, 'day') + 1);
    
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

  // 计算卡池块位置
  const getBannerStyle = (banner: Banner): React.CSSProperties => {
    const bannerStart = dayjs(banner.startDate);
    const bannerEnd = dayjs(banner.endDate);
    
    const startPos = Math.max(0, bannerStart.diff(dateRange.start, 'day'));
    const endPos = Math.min(totalDays, bannerEnd.diff(dateRange.start, 'day') + 1);
    
    if (startPos >= totalDays || endPos <= 0) {
      return { display: 'none' };
    }
    
    const left = (startPos / totalDays) * 100;
    const width = ((endPos - startPos) / totalDays) * 100;
    
    return {
      left: `${left}%`,
      width: `${Math.max(width, 2)}%`,
    };
  };

  // 过滤可见的卡池
  const visibleBanners = React.useMemo(() => banners.filter(banner => {
    const bannerStart = dayjs(banner.startDate);
    const bannerEnd = dayjs(banner.endDate);
    return bannerStart.isBefore(dateRange.end) && bannerEnd.isAfter(dateRange.start);
  }), [banners, dateRange]);

  // 计算重叠卡池组（用于分布角色名）
  const bannerGroups = React.useMemo(() => {
    const groups: number[][] = [];
    const processed = new Set<number>();
    
    visibleBanners.forEach((banner, i) => {
      if (processed.has(i)) return;
      const group = [i];
      processed.add(i);
      
      const start = dayjs(banner.startDate).diff(dateRange.start, 'day');
      const end = dayjs(banner.endDate).diff(dateRange.start, 'day');
      
      visibleBanners.forEach((other, j) => {
        if (i === j || processed.has(j)) return;
        const otherStart = dayjs(other.startDate).diff(dateRange.start, 'day');
        const otherEnd = dayjs(other.endDate).diff(dateRange.start, 'day');
        
        if (start < otherEnd && end > otherStart) {
          group.push(j);
          processed.add(j);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }, [visibleBanners, dateRange]);

  const color = game.color || gameColors[game.id] || '#6366f1';

  // 时间网格线位置
  const gridLines = React.useMemo(() => {
    return Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => {
      const dayNum = i * 7;
      return (dayNum / totalDays) * 100;
    });
  }, [totalDays]);

  return (
    <div className="flex border-b border-line/50 hover:bg-white/[0.02] transition-colors duration-150 group">
      {/* 游戏名称 */}
      <div 
        className={`shrink-0 border-r border-line/50 flex items-center gap-2 md:gap-3 transition-colors ${
          isMobile ? 'w-28 px-2 py-4' : 'w-48 px-4 py-5'
        }`}
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="relative">
          <GameIcon gameId={game.id} size={isMobile ? 22 : 28} />
          <div 
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-ink"
            style={{ backgroundColor: color }}
          />
        </div>
        <div>
          <span className={`font-medium text-fg block ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {game.name}
          </span>
          <span className={`text-fg-3 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
            {versions.length}个版本 · {visibleBanners.length}个卡池
          </span>
        </div>
      </div>

      {/* 版本块区域 */}
      <div className="flex-1 relative" style={{ minHeight: isMobile ? '80px' : '110px' }}>
        {/* 时间网格线 */}
        {gridLines.map((left, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-line/30"
            style={{ left: `${left}%` }}
          />
        ))}

        {/* 今天的标记线 */}
        {todayPosition !== null && (
          <>
            <div
              className="absolute top-0 bottom-0 w-[2px] today-line z-10 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
            />
            <div 
              className="absolute -top-1 w-3 h-3 bg-accent rounded-full -translate-x-1/2 z-10 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
            />
          </>
        )}

        {/* 版本块 + 卡池块 */}
        <div className="absolute top-1 bottom-1 left-0 right-0">
          {/* 版本块 */}
          {versions.map(version => {
            const style = getVersionStyle(version);
            if (style.display === 'none') return null;
            
            return (
              <VersionBlock
                key={version.id}
                version={version}
                gameColor={color}
                style={{ ...style, bottom: visibleBanners.length > 0 ? '22px' : '0', top: '0' }}
                onClick={() => onVersionClick?.(version)}
                isMobile={isMobile}
              />
            );
          })}

          {/* 卡池块（版本块下方） */}
          {visibleBanners.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-5">
              {bannerGroups.map(group => {
                const count = group.length;
                const divider = count + 1;
                
                return group.map((bannerIdx, posInGroup) => {
                  const banner = visibleBanners[bannerIdx];
                  const style = getBannerStyle(banner);
                  if (style.display === 'none') return null;
                  
                  const nameLeftPercent = ((posInGroup + 1) / divider) * 100;
                  
                  return (
                    <div
                      key={bannerIdx}
                      className="absolute top-0 h-full cursor-pointer group/banner"
                      style={style}
                    >
                      <div
                        className="h-full rounded transition-all duration-150 hover:brightness-125 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(180deg, ${color}20, ${color}35)`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        <span 
                          className="absolute top-0 bottom-0 flex items-center text-[9px] md:text-[10px] font-bold whitespace-nowrap"
                          style={{ 
                            left: `${nameLeftPercent}%`, 
                            transform: 'translateX(-50%)',
                            color: 'white',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {banner.character}
                        </span>
                      </div>
                      
                      {/* 悬浮提示 */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-line rounded-lg shadow-xl opacity-0 group-hover/banner:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                        <div className="text-xs font-medium text-fg mb-1">{banner.name}</div>
                        <div className="text-[10px] text-fg-2 mb-1">{banner.character}</div>
                        <div className="flex items-center gap-2 text-[10px] text-fg-3">
                          <span>{dayjs(banner.startDate).format('MM/DD')}</span>
                          <span>→</span>
                          <span>{dayjs(banner.endDate).format('MM/DD')}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-line" />
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>

        {/* 无版本提示 */}
        {versions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-fg-4">本月暂无版本</span>
          </div>
        )}
      </div>
    </div>
  );
});
