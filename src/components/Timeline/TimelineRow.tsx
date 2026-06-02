import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { VersionBlock } from './VersionBlock';
import { GameIcon, gameColors } from '../Common/GameIcon';
import { mihoyoService } from '../../services/mihoyo';
import type { Game, Version, TimelineScale } from '../../types';

interface Banner {
  name: string;
  character: string;
  startDate: string;
  endDate: string;
}

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
            {versions.length} 个版本 · {visibleBanners.length} 个卡池
          </span>
        </div>
      </div>

      {/* 版本块区域 */}
      <div className="flex-1 relative" style={{ minHeight: visibleBanners.length > 0 ? '100px' : '80px' }}>
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

        {/* 版本块（居中显示） */}
        <div className="absolute top-2 bottom-2 left-0 right-0">
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
        </div>

        {/* 卡池块（版本块下方，重叠卡池分行显示） */}
        {visibleBanners.length > 0 && (() => {
          // 计算卡池的行分配，避免重叠
          const bannerRows: number[] = [];
          const rowEndPositions: number[] = [];
          
          visibleBanners.forEach((banner, index) => {
            const bannerStart = dayjs(banner.startDate).diff(dateRange.start, 'day');
            let assignedRow = 0;
            
            // 找到第一个可用的行
            for (let row = 0; row < rowEndPositions.length; row++) {
              if (bannerStart >= rowEndPositions[row]) {
                assignedRow = row;
                break;
              }
              assignedRow = row + 1;
            }
            
            bannerRows[index] = assignedRow;
            if (!rowEndPositions[assignedRow]) {
              rowEndPositions[assignedRow] = 0;
            }
            rowEndPositions[assignedRow] = dayjs(banner.endDate).diff(dateRange.start, 'day');
          });
          
          const totalRows = Math.max(...bannerRows) + 1;
          const rowHeight = 20; // 每行高度
          
          return (
            <div className="absolute bottom-2 left-0 right-0" style={{ height: `${totalRows * rowHeight}px` }}>
              {visibleBanners.map((banner, index) => {
                const style = getBannerStyle(banner);
                if (style.display === 'none') return null;
                
                const row = bannerRows[index];
                const top = row * rowHeight;
                
                return (
                  <div
                    key={index}
                    className="absolute cursor-pointer group"
                    style={{ ...style, top: `${top}px`, height: `${rowHeight - 2}px` }}
                  >
                    <div
                      className="h-full rounded px-1 flex items-center justify-center overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-white/50"
                      style={{
                        backgroundColor: `${game.color || gameColors[game.id] || '#6366f1'}40`,
                        border: `1px solid ${game.color || gameColors[game.id] || '#6366f1'}60`,
                      }}
                    >
                      <span className="text-[9px] text-white/80 truncate">
                        {banner.character}
                      </span>
                    </div>
                    
                    {/* 悬浮提示 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1a1a2e] border border-[#2d2d4a] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                      <div className="text-xs text-[#e2e8f0] font-medium">{banner.name}</div>
                      <div className="text-[10px] text-[#94a3b8]">{banner.character}</div>
                      <div className="text-[10px] text-[#64748b]">
                        {dayjs(banner.startDate).format('MM/DD')} - {dayjs(banner.endDate).format('MM/DD')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

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
