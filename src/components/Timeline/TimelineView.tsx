import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';
import { TimelineRow } from './TimelineRow';
import { UpcomingHero } from './UpcomingHero';
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

  const mergedVersions = useMemo(() => {
    const localKeys = new Set(versions.map((v) => `${v.gameId}:${v.version}`));
    const remoteOnly = remoteVersions.filter(
      (v) => !localKeys.has(`${v.gameId}:${v.version}`)
    );
    return [...versions, ...remoteOnly];
  }, [versions, remoteVersions]);

  const dateRange = useMemo(() => {
    const start = currentDate.startOf('month');
    const end = currentDate.endOf('month');
    return { start, end };
  }, [currentDate]);

  const timeMarkers = useMemo(() => {
    const markers: dayjs.Dayjs[] = [];
    let current = dateRange.start;
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'day')) {
      markers.push(current);
      current = current.add(7, 'day');
    }
    return markers;
  }, [dateRange]);

  const totalDays = useMemo(() => {
    return dateRange.end.diff(dateRange.start, 'day') + 1;
  }, [dateRange]);

  const versionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach((game) => {
      grouped[game.id] = mergedVersions.filter((v) => v.gameId === game.id);
    });
    return grouped;
  }, [games, mergedVersions]);

  const sortedGames = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');

    return [...games].sort((a, b) => {
      const aBanners = allBanners[a.id] || [];
      const bBanners = allBanners[b.id] || [];
      const aVersions = versionsByGame[a.id] || [];
      const bVersions = versionsByGame[b.id] || [];

      const getNextEventDate = (
        banners: Banner[],
        gameVersions: Version[]
      ): string | null => {
        const upcoming = banners
          .filter((b) => b.startDate > today)
          .map((b) => b.startDate);
        if (upcoming.length > 0)
          return upcoming.reduce((a, b) => (a < b ? a : b));

        const ongoing = banners
          .filter((b) => b.startDate <= today && b.endDate > today)
          .map((b) => b.endDate);
        if (ongoing.length > 0)
          return ongoing.reduce((a, b) => (a < b ? a : b));

        if (gameVersions.length > 0 && gameVersions[0].endDate) {
          return gameVersions[0].endDate;
        }
        if (gameVersions.length > 0) {
          return gameVersions[0].startDate;
        }
        return null;
      };

      const aDate = getNextEventDate(aBanners, aVersions);
      const bDate = getNextEventDate(bBanners, bVersions);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return dayjs(aDate).diff(dayjs(bDate));
    });
  }, [games, allBanners, versionsByGame]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => prev.add(direction === 'prev' ? -1 : 1, 'month'));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(dayjs());
  }, []);

  const getDayPosition = useCallback(
    (date: dayjs.Dayjs): number => {
      const dayNum = date.diff(dateRange.start, 'day');
      return (dayNum / totalDays) * 100;
    },
    [dateRange, totalDays]
  );

  const isVersionVisible = useCallback(
    (version: Version): boolean => {
      const versionStart = dayjs(version.startDate);
      const versionEnd = version.endDate
        ? dayjs(version.endDate)
        : versionStart.add(42, 'day');
      return versionStart.isBefore(dateRange.end) && versionEnd.isAfter(dateRange.start);
    },
    [dateRange]
  );

  const visibleVersionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach((game) => {
      grouped[game.id] = (versionsByGame[game.id] || []).filter(isVersionVisible);
    });
    return grouped;
  }, [games, versionsByGame, isVersionVisible]);

  const todayPosition = useMemo(() => {
    if (!dayjs().isSame(currentDate, 'month')) return null;
    return getDayPosition(dayjs());
  }, [currentDate, getDayPosition]);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        {/* Upcoming Hero */}
        <UpcomingHero
          games={games}
          versions={mergedVersions}
          allBanners={allBanners}
        />

        {/* Timeline section */}
        <div>
          {/* Timeline header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-fg-3" />
              <h2 className="text-xs font-semibold text-fg-3 uppercase tracking-wider">
                时间轴
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('prev')}
                className="flex items-center justify-center w-7 h-7 text-fg-3 hover:text-fg hover:bg-white/[0.05] rounded-md transition-colors duration-150"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-[13px] font-medium text-fg-2 px-2 tabular-nums">
                {currentDate.format('YYYY年MM月')}
              </span>

              <button
                onClick={() => navigate('next')}
                className="flex items-center justify-center w-7 h-7 text-fg-3 hover:text-fg hover:bg-white/[0.05] rounded-md transition-colors duration-150"
              >
                <ChevronRight size={16} />
              </button>

              <button
                onClick={goToToday}
                className="ml-1 px-2.5 py-1 text-[11px] font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-md transition-colors duration-150"
              >
                今天
              </button>
            </div>
          </div>

          {/* Timeline gantt */}
          <div className="bg-panel/50 backdrop-blur-xl rounded-xl border border-line overflow-x-auto">
            <div className="min-w-[600px] md:min-w-[800px]">
              {/* Time scale header */}
              <div className="flex border-b border-line bg-elevated/40 backdrop-blur-xl sticky top-0 z-10">
                <div
                  className={`shrink-0 px-3 py-2 border-r border-line ${
                    isMobile ? 'w-24' : 'w-44'
                  }`}
                >
                  <span className="text-[10px] text-fg-4 uppercase tracking-wider">
                    游戏
                  </span>
                </div>
                <div className="flex-1 relative h-8">
                  {timeMarkers.map((marker, index) => (
                    <div
                      key={index}
                      className="absolute text-[10px] text-fg-4 tabular-nums"
                      style={{ left: `${getDayPosition(marker)}%` }}
                    >
                      <span className="ml-1">{marker.format('MM/DD')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game rows */}
              {sortedGames.map((game) => (
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
                <div className="text-center py-16 text-fg-3 text-sm">
                  暂无游戏，请先添加游戏
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
