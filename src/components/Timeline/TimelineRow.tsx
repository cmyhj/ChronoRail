import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { VersionBlock } from './VersionBlock';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import { mihoyoService } from '../../services/mihoyo';
import type { Game, Version, TimelineScale, Banner } from '../../types';

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
  isMobile?: boolean;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  game,
  versions,
  dateRange,
  totalDays,
  onVersionClick,
  todayPosition,
  isMobile = false,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  // 加载卡池信息
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await mihoyoService.fetchBanners(game.id);
        setBanners(data);
      } catch (error) {
        console.error('Failed to load banners:', error);
      }
    };
    loadBanners();
  }, [game.id]);

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
  const visibleBanners = banners.filter(banner => {
    const bannerStart = dayjs(banner.startDate);
    const bannerEnd = dayjs(banner.endDate);
    return bannerStart.isBefore(dateRange.end) && bannerEnd.isAfter(dateRange.start);
  });

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

  return (
    <div className="flex border-b border-[#1e1e3a]/50 hover:bg-[#12122a]/50 transition-all duration-200 group">
      {/* 游戏名称 */}
      <div 
        className={`shrink-0 border-r border-[#1e1e3a]/50 flex items-center gap-2 md:gap-3 transition-colors ${
          isMobile ? 'w-28 px-2 py-4' : 'w-48 px-4 py-5'
        }`}
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="relative">
          <GameIcon gameId={game.id} size={isMobile ? 22 : 28} />
          <div 
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0a1a]"
            style={{ backgroundColor: color }}
          />
        </div>
        <div>
          <span className={`font-medium text-[#e2e8f0] block ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {game.name}
          </span>
          <span className={`text-[#64748b] ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
            {versions.length}个版本 · {visibleBanners.length}个卡池
          </span>
        </div>
      </div>

      {/* 版本块区域 */}
      <div className="flex-1 relative" style={{ minHeight: isMobile ? '80px' : '110px' }}>
        {/* 时间网格线 */}
        {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => {
          const dayNum = i * 7;
          const left = (dayNum / totalDays) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[#1e1e3a]/30"
              style={{ left: `${left}%` }}
            />
          );
        })}

        {/* 今天的标记线 */}
        {todayPosition !== null && (
          <>
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#6366f1] via-[#818cf8] to-[#6366f1] z-10 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
            />
            <div 
              className="absolute -top-1 w-3 h-3 bg-[#6366f1] rounded-full -translate-x-1/2 z-10 pointer-events-none shadow-lg shadow-[#6366f1]/50"
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
                        className="h-full rounded-md transition-all duration-200 hover:brightness-125 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(180deg, ${color}25, ${color}45)`,
                          border: `1px solid ${color}60`,
                          boxShadow: `inset 0 1px 0 ${color}30`,
                        }}
                      >
                        <span 
                          className="absolute top-0 bottom-0 flex items-center text-[9px] md:text-[10px] font-extrabold whitespace-nowrap"
                          style={{ 
                            left: `${nameLeftPercent}%`, 
                            transform: 'translateX(-50%)',
                            color: 'white',
                            textShadow: `
                              0 0 3px ${color},
                              0 0 6px ${color},
                              0 0 10px ${color}80,
                              2px 2px 2px rgba(0,0,0,0.9),
                              -2px -2px 2px rgba(0,0,0,0.9),
                              2px -2px 2px rgba(0,0,0,0.9),
                              -2px 2px 2px rgba(0,0,0,0.9),
                              0 2px 2px rgba(0,0,0,0.9),
                              2px 0 2px rgba(0,0,0,0.9),
                              0 -2px 2px rgba(0,0,0,0.9),
                              -2px 0 2px rgba(0,0,0,0.9)
                            `,
                            WebkitTextStroke: `0.1px ${color}`,
                            letterSpacing: '0.5px',
                          }}
                        >
                          {banner.character}
                        </span>
                      </div>
                      
                      {/* 悬浮提示 */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#12122a] border border-[#1e1e3a] rounded-lg shadow-xl opacity-0 group-hover/banner:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                        <div className="text-xs font-medium text-[#e2e8f0] mb-1">{banner.name}</div>
                        <div className="text-[10px] text-[#94a3b8] mb-1">{banner.character}</div>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                          <span>{dayjs(banner.startDate).format('MM/DD')}</span>
                          <span>→</span>
                          <span>{dayjs(banner.endDate).format('MM/DD')}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1e1e3a]" />
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
            <span className="text-xs text-[#4a4a6a]">本月暂无版本</span>
          </div>
        )}
      </div>
    </div>
  );
};
