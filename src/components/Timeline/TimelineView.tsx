import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import dayjs from 'dayjs';
import { TimelineRow } from './TimelineRow';
import { useResponsive } from '../../hooks/useResponsive';
import type { Game, Version, TimelineScale } from '../../types';

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
  const [scale, setScale] = useState<TimelineScale>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());

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

  // 按下一个卡池开始时间排序（只算未来的卡池）
  const sortedGames = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    
    return [...games].sort((a, b) => {
      const aVersions = versionsByGame[a.id] || [];
      const bVersions = versionsByGame[b.id] || [];
      
      // 获取下一个卡池的开始时间
      const getNextBannerStart = (gameVersions: Version[]): string | null => {
        if (gameVersions.length === 0) return null;
        const currentVersion = gameVersions[0];
        
        // 如果当前版本开始时间在未来，用它
        if (currentVersion.startDate > today) {
          return currentVersion.startDate;
        }
        
        // 否则用结束时间（下一个卡池的开始，或当前卡池结束）
        if (currentVersion.endDate) {
          return currentVersion.endDate;
        }
        
        // 都没有就用开始时间
        return currentVersion.startDate;
      };
      
      const aDate = getNextBannerStart(aVersions);
      const bDate = getNextBannerStart(bVersions);
      
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      
      return dayjs(aDate).diff(dayjs(bDate));
    });
  }, [games, versionsByGame]);

  // 导航 - 按月导航
  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    setCurrentDate(prev => prev.add(amount, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  // 缩放
  const zoomIn = () => {
    if (scale === 'month') setScale('day');
  };

  const zoomOut = () => {
    if (scale === 'day') setScale('month');
  };

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
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => navigate('prev')}
            className="p-1.5 md:p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="md:w-5 md:h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            今天
          </button>
          
          <button
            onClick={() => navigate('next')}
            className="p-1.5 md:p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="md:w-5 md:h-5" />
          </button>
          
          <span className="text-[#e2e8f0] font-medium ml-1 md:ml-2 text-sm md:text-base">
            {currentDate.format('YYYY年MM月')}
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={zoomOut}
            className="p-1.5 md:p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
            disabled={scale === 'month'}
          >
            <ZoomOut size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          
          <span className="text-[10px] md:text-xs text-[#64748b] min-w-[30px] md:min-w-[40px] text-center">
            {scale === 'day' ? '日' : '月'}
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1.5 md:p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
            disabled={scale === 'day'}
          >
            <ZoomIn size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
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
              scale={scale}
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
