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
  dateRange: { start: dayjs.Dayjs; end: dayjs.Dayjs };
  totalDays: number;
  onVersionClick?: (version: Version) => void;
  todayPosition: number | null;
  isMobile?: boolean;
}

export const TimelineRow: React.FC<TimelineRowProps> = React.memo(
  ({ game, versions, banners, dateRange, totalDays, onVersionClick, todayPosition, isMobile = false }) => {
    const getVersionStyle = (version: Version): React.CSSProperties => {
      const start = dayjs(version.startDate);
      const end = version.endDate ? dayjs(version.endDate) : start.add(42, 'day');
      const startDay = Math.max(0, start.diff(dateRange.start, 'day'));
      const endDay = Math.min(totalDays, end.diff(dateRange.start, 'day') + 1);
      if (startDay >= totalDays || endDay <= 0) return { display: 'none' };
      return {
        left: `${(startDay / totalDays) * 100}%`,
        width: `${Math.max((endDay - startDay) / totalDays * 100, 2.5)}%`,
      };
    };

    const getBannerStyle = (banner: Banner): React.CSSProperties => {
      const start = dayjs(banner.startDate);
      const end = dayjs(banner.endDate);
      const startDay = Math.max(0, start.diff(dateRange.start, 'day'));
      const endDay = Math.min(totalDays, end.diff(dateRange.start, 'day') + 1);
      if (startDay >= totalDays || endDay <= 0) return { display: 'none' };
      return {
        left: `${(startDay / totalDays) * 100}%`,
        width: `${Math.max((endDay - startDay) / totalDays * 100, 1.5)}%`,
      };
    };

    const visibleBanners = React.useMemo(
      () =>
        banners.filter((b) => {
          const s = dayjs(b.startDate);
          const e = dayjs(b.endDate);
          return s.isBefore(dateRange.end) && e.isAfter(dateRange.start);
        }),
      [banners, dateRange],
    );

    const bannerGroups = React.useMemo(() => {
      const groups: number[][] = [];
      const done = new Set<number>();
      visibleBanners.forEach((b, i) => {
        if (done.has(i)) return;
        const group = [i];
        done.add(i);
        const si = dayjs(b.startDate).diff(dateRange.start, 'day');
        const ei = dayjs(b.endDate).diff(dateRange.start, 'day');
        visibleBanners.forEach((ob, j) => {
          if (i === j || done.has(j)) return;
          const sj = dayjs(ob.startDate).diff(dateRange.start, 'day');
          const ej = dayjs(ob.endDate).diff(dateRange.start, 'day');
          if (si < ej && ei > sj) { group.push(j); done.add(j); }
        });
        groups.push(group);
      });
      return groups;
    }, [visibleBanners, dateRange]);

    const color = game.color || gameColors[game.id] || '#6366f1';
    const gridLines = React.useMemo(
      () => Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => ((i * 7) / totalDays) * 100),
      [totalDays],
    );

    return (
      <div className="flex border-b border-line/30 hover:bg-white/[0.01] transition-colors duration-150 group">
        {/* 游戏名 */}
        <div
          className={`shrink-0 border-r border-line/30 flex items-center gap-2 ${
            isMobile ? 'w-24 px-2 py-3' : 'w-44 px-3 py-4'
          }`}
        >
          <div className="relative shrink-0">
            <GameIcon gameId={game.id} size={isMobile ? 20 : 24} />
          </div>
          <div className="min-w-0">
            <span className={`font-medium text-fg block truncate ${isMobile ? 'text-[11px]' : 'text-[13px]'}`}>
              {game.name}
            </span>
            <span className={`text-fg-4 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
              {versions.length}个版本
            </span>
          </div>
        </div>

        {/* 时间轴区域 */}
        <div className="flex-1 relative" style={{ minHeight: isMobile ? '56px' : '72px' }}>
          {/* 网格线 */}
          {gridLines.map((left, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-line/15" style={{ left: `${left}%` }} />
          ))}

          {/* 今天的标记 ==== 渐变发光 + 顶部 floating pill === */}
          {todayPosition !== null && (
            <>
              {/* 光晕层 */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{
                  left: `${todayPosition}%`,
                  width: '24px',
                  marginLeft: '-12px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(99,102,241,0.06) 40%, rgba(99,102,241,0.06) 60%, transparent)',
                }}
              />
              {/* 竖线 */}
              <div
                className="absolute top-2 bottom-2 w-[1.5px] z-20 pointer-events-none rounded-full"
                style={{
                  left: `${todayPosition}%`,
                  background: 'linear-gradient(180deg, transparent, #818cf8 15%, #6366f1 50%, #818cf8 85%, transparent)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                }}
              />
              {/* 顶部 "今天" pill 标签 */}
              <div
                className="absolute z-30 pointer-events-none"
                style={{ left: `${todayPosition}%`, top: '-2px', transform: 'translateX(-50%)' }}
              >
                <span className="text-[9px] font-semibold text-white bg-accent px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                  今天
                </span>
              </div>
            </>
          )}

          {/* 版本块 + 卡池块 */}
          <div className="absolute top-1.5 bottom-1.5 left-0 right-0">
            {/* 版本块（上半部分） */}
            {versions.map((v) => {
              const s = getVersionStyle(v);
              if (s.display === 'none') return null;
              return (
                <VersionBlock
                  key={v.id}
                  version={v}
                  gameColor={color}
                  style={{
                    ...s,
                    bottom: visibleBanners.length > 0 ? '14px' : '0',
                    top: '0',
                  }}
                  onClick={() => onVersionClick?.(v)}
                  isMobile={isMobile}
                />
              );
            })}

            {/* 卡池块（下半部分，细条） */}
            {visibleBanners.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-3">
                {bannerGroups.map((group) => {
                  return group.map((idx) => {
                    const b = visibleBanners[idx];
                    const s = getBannerStyle(b);
                    if (s.display === 'none') return null;
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 h-full cursor-pointer group/banner"
                        style={s}
                      >
                        <div
                          className="h-full rounded-full transition-opacity duration-150 hover:opacity-80"
                          style={{
                            background: `linear-gradient(90deg, ${color}60, ${color}85)`,
                            boxShadow: `0 0 4px ${color}40`,
                          }}
                        >
                          {/* 悬浮提示 */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1.5 bg-card border border-line rounded-lg shadow-xl opacity-0 group-hover/banner:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 text-[10px]">
                            <span className="text-fg font-medium">{b.character}</span>
                            <span className="text-fg-3 ml-2 tabular-nums">
                              {dayjs(b.startDate).format('MM/DD')} → {dayjs(b.endDate).format('MM/DD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>

          {/* 空状态 */}
          {versions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] text-fg-4 italic">本月暂无版本</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
