import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import { TimelineRow } from './TimelineRow';
import { useResponsive } from '../../hooks/useResponsive';
import { mihoyoService } from '../../services/mihoyo';
import type { Game, Version, Banner } from '../../types';

interface TimelineViewProps {
  games: Game[];
  versions: Version[];
  onVersionClick?: (version: Version) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  games,
  versions,
  onVersionClick,
}) => {
  const { isMobile } = useResponsive();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [allBanners, setAllBanners] = useState<Record<string, Banner[]>>({});

  // 加载所有游戏的卡池数据
  useEffect(() => {
    const loadBanners = async () => {
      const bannerMap: Record<string, Banner[]> = {};
      for (const game of games) {
        const banners = await mihoyoService.fetchBanners(game.id);
        bannerMap[game.id] = banners;
      }
      setAllBanners(bannerMap);
    };
    loadBanners();
  }, [games]);

  // 计算时间范围 - 按月显示
  const dateRange = useMemo(() => {
    const start = currentDate.startOf('month');
    const end = currentDate.endOf('month');
    return { start, end };
  }, [currentDate]);

  // 生成时间刻度（每周一）
  const timeMarkers = useMemo(() => {
    const markers: dayjs.Dayjs[] = [];
    let current = dateRange.start;
    
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'day')) {
      markers.push(current);
      current = current.add(7, 'day');
    }
    
    return markers;
  }, [dateRange]);

  // 总天数
  const totalDays = useMemo(() => {
    return dateRange.end.diff(dateRange.start, 'day') + 1;
  }, [dateRange]);

  // 按游戏分组版本
  const versionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach(game => {
      grouped[game.id] = versions.filter(v => v.gameId === game.id);
    });
    return grouped;
  }, [games, versions]);

  // 按下一个卡池开始时间排序（使用卡池数据）
  const sortedGames = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    
    return [...games].sort((a, b) => {
      const aBanners = allBanners[a.id] || [];
      const bBanners = allBanners[b.id] || [];
      const aVersions = versionsByGame[a.id] || [];
      const bVersions = versionsByGame[b.id] || [];
      
      // 获取下一个卡池的开始时间
      const getNextBannerStart = (banners: Banner[], gameVersions: Version[]): string | null => {
        // 优先从卡池数据中找未来的卡池
        for (const banner of banners) {
          if (banner.startDate > today) {
            return banner.startDate;
          }
        }
        
        // 如果没有未来的卡池，找当前进行中卡池的结束时间
        for (const banner of banners) {
          if (banner.startDate <= today && banner.endDate > today) {
            return banner.endDate;
          }
        }
        
        // 都没有，用版本的结束时间
        if (gameVersions.length > 0 && gameVersions[0].endDate) {
          return gameVersions[0].endDate;
        }
        
        // 最后用版本开始时间
        if (gameVersions.length > 0) {
          return gameVersions[0].startDate;
        }
        
        return null;
      };
      
      const aDate = getNextBannerStart(aBanners, aVersions);
      const bDate = getNextBannerStart(bBanners, bVersions);
      
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      
      return dayjs(aDate).diff(dayjs(bDate));
    });
  }, [games, allBanners, versionsByGame]);

  // 导航 - 按月导航
  const navigate = useCallback((direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    setCurrentDate(prev => prev.add(amount, 'month'));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(dayjs());
  }, []);

  // 鼠标拖动切换月份
  const dragRef = useRef<{ startX: number; startY: number; dragging: boolean }>({ startX: 0, startY: 0, dragging: false });
  const DRAG_THRESHOLD = 80;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, dragging: true };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    // 只处理水平拖动（水平位移 > 垂直位移，且超过阈值）
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > DRAG_THRESHOLD) {
      navigate(dx > 0 ? 'prev' : 'next');
    }
  }, [navigate]);

  const handlePointerLeave = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);

  // 计算某天在时间轴上的位置百分比
  const getDayPosition = (date: dayjs.Dayjs): number => {
    const dayNum = date.diff(dateRange.start, 'day');
    return (dayNum / totalDays) * 100;
  };

  // 判断版本是否在当前月份范围内可见
  const isVersionVisible = (version: Version): boolean => {
    const versionStart = dayjs(version.startDate);
    const versionEnd = version.endDate ? dayjs(version.endDate) : versionStart.add(42, 'day');
    
    return versionStart.isBefore(dateRange.end) && versionEnd.isAfter(dateRange.start);
  };

  // 今天位置
  const todayPosition = useMemo(() => {
    if (!dayjs().isSame(currentDate, 'month')) return null;
    return getDayPosition(dayjs());
  }, [currentDate, dateRange, totalDays]);

  return (
    <div
      className="h-full flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs md:text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors border border-[#2d2d4a]"
          >
            今天
          </button>
          
          <span className="text-[#e2e8f0] font-medium text-sm md:text-base">
            {currentDate.format('YYYY年MM月')}
          </span>

          <span className="text-[10px] md:text-xs text-[#4a4a6a]">
            左右拖动切换月份
          </span>
        </div>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 overflow-auto">
        {/* 横向时间轴 */}
        <div className="min-w-[600px] md:min-w-[800px] relative">
          {/* 时间刻度标题 */}
          <div className="flex border-b border-[#2d2d4a] bg-[#16162a] sticky top-0 z-10">
            <div className={`shrink-0 px-2 md:px-4 py-2 border-r border-[#2d2d4a] ${isMobile ? 'w-28' : 'w-48'}`}>
              <span className="text-[10px] md:text-xs text-[#64748b]">游戏</span>
            </div>
            <div className="flex-1 relative h-7 md:h-8">
              {/* 日期刻度标签 */}
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute text-[10px] md:text-xs text-[#64748b]"
                  style={{ left: `${getDayPosition(marker)}%` }}
                >
                  <span className="ml-0.5 md:ml-1">{marker.format('MM/DD')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 游戏行（按版本结束日期排序） */}
          {sortedGames.map(game => (
            <TimelineRow
              key={game.id}
              game={game}
              versions={(versionsByGame[game.id] || []).filter(isVersionVisible)}
              dateRange={dateRange}
              totalDays={totalDays}
              onVersionClick={onVersionClick}
              todayPosition={todayPosition}
              isMobile={isMobile}
            />
          ))}

          {games.length === 0 && (
            <div className="text-center py-12 text-[#64748b]">
              暂无游戏，请先添加游戏
            </div>
          )}

          {/* 底部留白 */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};
