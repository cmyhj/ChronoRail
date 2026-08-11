import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [remoteVersions, setRemoteVersions] = useState<Version[]>([]);

  // 加载所有游戏的卡池数据 + 版本历史
  useEffect(() => {
    const loadData = async () => {
      const bannerMap: Record<string, Banner[]> = {};
      const remote: Version[] = [];
      for (const game of games) {
        const banners = await mihoyoService.fetchBanners(game.id);
        bannerMap[game.id] = banners;

        const history = await mihoyoService.fetchVersionHistory(game.id);
        for (const v of history) {
          remote.push({
            id: `remote-${game.id}-${v.version}`,
            gameId: game.id,
            version: v.version,
            name: v.name,
            startDate: v.startDate,
            endDate: v.endDate,
            isAutoFetched: true,
            createdAt: '',
            updatedAt: '',
          });
        }
      }
      setAllBanners(bannerMap);
      setRemoteVersions(remote);
    };
    loadData();
  }, [games]);

  // 合并本地版本和远程版本（本地优先）
  const mergedVersions = useMemo(() => {
    const localKeys = new Set(versions.map(v => `${v.gameId}:${v.version}`));
    const remoteOnly = remoteVersions.filter(v => !localKeys.has(`${v.gameId}:${v.version}`));
    return [...versions, ...remoteOnly];
  }, [versions, remoteVersions]);

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
      grouped[game.id] = mergedVersions.filter(v => v.gameId === game.id);
    });
    return grouped;
  }, [games, mergedVersions]);

  // 按下一个卡池开始时间排序（使用卡池数据）
  const sortedGames = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    
    return [...games].sort((a, b) => {
      const aBanners = allBanners[a.id] || [];
      const bBanners = allBanners[b.id] || [];
      const aVersions = versionsByGame[a.id] || [];
      const bVersions = versionsByGame[b.id] || [];
      
      const getNextBannerStart = (banners: Banner[], gameVersions: Version[]): string | null => {
        // 找所有未来卡池中最早开始的
        const upcoming = banners
          .filter(b => b.startDate > today)
          .map(b => b.startDate);
        if (upcoming.length > 0) return upcoming.reduce((a, b) => a < b ? a : b);
        
        // 找所有进行中卡池中最早结束的
        const ongoing = banners
          .filter(b => b.startDate <= today && b.endDate > today)
          .map(b => b.endDate);
        if (ongoing.length > 0) return ongoing.reduce((a, b) => a < b ? a : b);
        
        if (gameVersions.length > 0 && gameVersions[0].endDate) {
          return gameVersions[0].endDate;
        }
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

  // 导航
  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => prev.add(direction === 'prev' ? -1 : 1, 'month'));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(dayjs());
  }, []);

  // 计算某天在时间轴上的位置百分比
  const getDayPosition = useCallback((date: dayjs.Dayjs): number => {
    const dayNum = date.diff(dateRange.start, 'day');
    return (dayNum / totalDays) * 100;
  }, [dateRange, totalDays]);

  // 判断版本是否在当前月份范围内可见
  const isVersionVisible = useCallback((version: Version): boolean => {
    const versionStart = dayjs(version.startDate);
    const versionEnd = version.endDate ? dayjs(version.endDate) : versionStart.add(42, 'day');
    return versionStart.isBefore(dateRange.end) && versionEnd.isAfter(dateRange.start);
  }, [dateRange]);

  // 按游戏分组并过滤可见版本（memoize 避免子组件不必要的重渲染）
  const visibleVersionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach(game => {
      grouped[game.id] = (versionsByGame[game.id] || []).filter(isVersionVisible);
    });
    return grouped;
  }, [games, versionsByGame, isVersionVisible]);

  // 今天位置
  const todayPosition = useMemo(() => {
    if (!dayjs().isSame(currentDate, 'month')) return null;
    return getDayPosition(dayjs());
  }, [currentDate, getDayPosition]);

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-panel border-b border-line">
        <button
          onClick={() => navigate('prev')}
          className="flex items-center justify-center w-10 h-10 text-fg-2 hover:text-fg hover:bg-hover active:bg-white/10 rounded-lg transition-colors duration-150"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-fg font-semibold text-base md:text-lg tracking-wide">
            {currentDate.format('YYYY年MM月')}
          </span>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs md:text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-full transition-colors duration-150"
          >
            今天
          </button>
        </div>

        <button
          onClick={() => navigate('next')}
          className="flex items-center justify-center w-10 h-10 text-fg-2 hover:text-fg hover:bg-hover active:bg-white/10 rounded-lg transition-colors duration-150"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px] md:min-w-[800px] relative">
          {/* 时间刻度标题 */}
          <div className="flex border-b border-line bg-panel sticky top-0 z-10">
            <div className={`shrink-0 px-2 md:px-4 py-2 border-r border-line ${isMobile ? 'w-28' : 'w-48'}`}>
              <span className="text-[10px] md:text-xs text-fg-3">游戏</span>
            </div>
            <div className="flex-1 relative h-7 md:h-8">
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute text-[10px] md:text-xs text-fg-3"
                  style={{ left: `${getDayPosition(marker)}%` }}
                >
                  <span className="ml-0.5 md:ml-1">{marker.format('MM/DD')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 游戏行 */}
          {sortedGames.map(game => (
            <TimelineRow
              key={game.id}
              game={game}
              versions={visibleVersionsByGame[game.id] || []}
              banners={allBanners[game.id] || []}
              dateRange={dateRange}
              totalDays={totalDays}
              onVersionClick={onVersionClick}
              todayPosition={todayPosition}
              isMobile={isMobile}
            />
          ))}

          {games.length === 0 && (
            <div className="text-center py-12 text-fg-3">
              暂无游戏，请先添加游戏
            </div>
          )}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};
