import React, { useMemo } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import dayjs from 'dayjs';
import { GameIcon } from '../Common/GameIcon';
import type { Game, Version, Banner } from '../../types';

interface UpcomingHeroProps {
  games: Game[];
  versions: Version[];
  allBanners: Record<string, Banner[]>;
}

interface UpcomingItem {
  game: Game;
  nextEvent: {
    type: 'banner' | 'version';
    name: string;
    character?: string;
    startDate: string;
    endDate?: string;
  } | null;
  daysUntil: number;
}

export const UpcomingHero: React.FC<UpcomingHeroProps> = ({
  games,
  versions,
  allBanners,
}) => {
  const upcoming = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');

    return games
      .map((game): UpcomingItem => {
        const banners = allBanners[game.id] || [];
        const gameVersions = versions.filter((v) => v.gameId === game.id);

        // Find the next upcoming banner
        const futureBanners = banners
          .filter((b) => b.startDate > today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (futureBanners.length > 0) {
          const next = futureBanners[0];
          const days = dayjs(next.startDate).diff(dayjs(), 'day');
          return {
            game,
            nextEvent: {
              type: 'banner',
              name: next.name,
              character: next.character,
              startDate: next.startDate,
              endDate: next.endDate,
            },
            daysUntil: days,
          };
        }

        // Find ongoing banners (check when they end)
        const ongoingBanners = banners.filter(
          (b) => b.startDate <= today && b.endDate > today
        );
        if (ongoingBanners.length > 0) {
          const soonestEnding = ongoingBanners.sort((a, b) =>
            a.endDate.localeCompare(b.endDate)
          )[0];
          const days = dayjs(soonestEnding.endDate).diff(dayjs(), 'day');
          return {
            game,
            nextEvent: {
              type: 'banner',
              name: soonestEnding.name,
              character: soonestEnding.character,
              startDate: soonestEnding.startDate,
              endDate: soonestEnding.endDate,
            },
            daysUntil: days,
          };
        }

        // Find next version
        const futureVersions = gameVersions
          .filter((v) => v.startDate > today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (futureVersions.length > 0) {
          const next = futureVersions[0];
          const days = dayjs(next.startDate).diff(dayjs(), 'day');
          return {
            game,
            nextEvent: {
              type: 'version',
              name: `v${next.version}`,
              startDate: next.startDate,
              endDate: next.endDate,
            },
            daysUntil: days,
          };
        }

        return { game, nextEvent: null, daysUntil: Infinity };
      })
      .filter((item) => item.nextEvent !== null)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  }, [games, versions, allBanners]);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Zap size={14} className="text-accent" />
        <h2 className="text-xs font-semibold text-fg-3 uppercase tracking-wider">
          即将到来
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {upcoming.map((item) => {
          const color = item.game.color;
          const isImminent = item.daysUntil <= 3;

          return (
            <div
              key={item.game.id}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                bg-card hover:bg-hover cursor-default group
                ${isImminent ? 'border-accent/20' : 'border-line hover:border-line-strong'}
              `}
            >
              {/* Color accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
                style={{ backgroundColor: color }}
              />

              <div className="relative shrink-0 ml-1">
                <GameIcon gameId={item.game.id} size={32} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-medium text-fg-3 truncate">
                    {item.game.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.nextEvent?.character && (
                    <span
                      className="text-[12px] font-semibold truncate"
                      style={{ color }}
                    >
                      {item.nextEvent.character}
                    </span>
                  )}
                  {item.nextEvent?.character && (
                    <ArrowRight size={10} className="text-fg-4 shrink-0" />
                  )}
                  <span className="text-[11px] text-fg-2 truncate">
                    {item.nextEvent?.type === 'banner' ? item.nextEvent.name : item.nextEvent?.name}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {item.daysUntil <= 0 ? (
                  <span className="text-[11px] font-semibold text-success">今天</span>
                ) : item.daysUntil <= 3 ? (
                  <span className="text-[11px] font-semibold text-accent">
                    {item.daysUntil}天后
                  </span>
                ) : (
                  <span className="text-[11px] text-fg-3 tabular-nums">
                    {item.daysUntil}天后
                  </span>
                )}
                <div className="text-[10px] text-fg-4 tabular-nums">
                  {dayjs(item.nextEvent?.startDate).format('MM/DD')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
